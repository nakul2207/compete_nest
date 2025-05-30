import { Response, Request } from "express";

import { Server } from "socket.io";
import { Difficulty, Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const ongoingUpdates = new Set<string>();

const handleRunCallback = async (req: Request, res: Response) => {
  const problem_id = req.params.id;
  const uid = req.body.uid;

  try {
    const io = (req as any).io as Server | undefined;

    if (!io) {
      console.error("Socket.IO not attached to request");
      return res.status(500).json({
        success: false,
        message: "Socket.IO not initialized",
      });
    }

    if (uid) {
      console.log("Attempting to emit with io:", !!io);
      io.to(uid).emit("update", {
        success: true,
        message: "Testcase updated successfully",
        problem_id,
        uid,
      });
      console.log(`Emitted to room ${uid}`);
    } else {
      console.log("UID not found in callback");
    }

    return res.status(200).json({
      success: true,
      message: "callback called properly",
    });
  } catch (error) {
    console.error("Error in handleRunCallback:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const handleSubmissionCallback = async (req: Request, res: Response) => {
  const subTestcaseId = req.params.id;
  const submissionId = req.params.submissionId;

  if (!subTestcaseId || !req.body || !submissionId) {
    return res.status(400).json({
      success: false,
      message: "Invalid request. Testcase ID or request body missing.",
    });
  }

  if (ongoingUpdates.has(subTestcaseId)) {
    return res.status(429).json({
      success: false,
      message: "This submission is already being processed.",
    });
  }

  ongoingUpdates.add(subTestcaseId);
  try {
    const { stdout, status, time, memory } = req.body;
    const parsedTime = time ? parseFloat(time) : 0;

    const result = await prisma.$transaction(
      async (tx) => {
        const updatedTestcase = await tx.submittedTestcase.update({
          where: { id: subTestcaseId },
          data: {
            output: stdout ?? "",
            status: status.id,
            memory: memory ?? 0,
            time: parsedTime,
          },
        });

        const submission = await tx.$queryRaw<
          Prisma.SubmissionGetPayload<{}>[]
        >`
                    SELECT * 
                    FROM "Submission"
                    WHERE "id" = ${updatedTestcase.submissionId}
                    FOR UPDATE
                `;

        if (!submission?.length) {
          throw new Error("Submission not found.");
        }

        const submissionData = submission[0];
        let { acceptedTestcases, evaluatedTestcases } = submissionData;
        let overallStatus = submissionData.status;

        //incrementing the evaluated testcases
        if (updatedTestcase.status >= 3) {
          evaluatedTestcases++;
        }

        //incrementing the accepted testcases count if the current testcase is accepted
        if (updatedTestcase.status === 3) {
          acceptedTestcases++;
        }

        if (evaluatedTestcases !== submissionData.totalTestcases) {
          if (updatedTestcase.status > 3) {
            overallStatus = updatedTestcase.status;
          }
        } else {
          //then it takes the maximum of current status and previous status
          overallStatus = Math.max(updatedTestcase.status, overallStatus);
        }

        const updatedSubmission = await tx.submission.update({
          where: { id: updatedTestcase.submissionId },
          data: {
            evaluatedTestcases,
            acceptedTestcases,
            status: overallStatus,
            memory: Math.max(submissionData.memory, memory),
            time: submissionData.time + parsedTime,
          },
        });

        //sending the updated submission data to the client
        // const io = (req as any).io as Server | undefined;
        // if (!io) {
        //     console.error('Socket.IO not attached to request');
        //     throw new Error("IO object not found");
        // }

        // console.log('Attempting to emit with io:', !!io);
        // io.to(updatedTestcase.submissionId).emit("update", {
        //     success: true,
        //     message: "Testcase updated successfully",
        //     updatedSubmission
        // });

        if (overallStatus === 3) {
          //find difficulty type of problem
          const problem = await tx.problem.findUnique({
            where: {
              id: updatedSubmission.problemId,
            },
            select: {
              difficulty: true,
            },
          });

          // Check for existing accepted submission excluding the current one
          const alreadySolved = await tx.submission.findFirst({
            where: {
              userId: updatedSubmission.userId,
              problemId: updatedSubmission.problemId,
              status: 3,
              NOT: {
                id: updatedSubmission.id, // Exclude current submission
              },
            },
            select: { id: true }, // Only get ID for existence check
          });

          if (!alreadySolved) {
            await tx.user.update({
              where: { id: updatedSubmission.userId },
              data: {
                problemsSolved: {
                  push: JSON.stringify({
                    id: updatedSubmission.problemId,
                    type: problem?.difficulty || Difficulty.Easy, // Use enum instead of string literal
                  }),
                },
              },
            });
          }
        }

        return {
          success: true,
          message: "Submission updated successfully.",
          updatedSubmission,
        };
      },
      {
        maxWait: 20000,
        timeout: 20000,
      }
    );

    return res.status(200).json(result);
  } catch (error) {
    // Update the submission to "Internal Error" status (14)
    try {
      const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: 13, // Internal Error
        },
      });

      // Sending the updated submission data to the client
      // const io = (req as any).io as Server | undefined;
      // if (io) {
      //     io.to(submissionId).emit("update", {
      //         success: false,
      //         message: "Internal error occurred in the backend.",
      //         updatedSubmission,
      //     });
      // } else {
      //     console.error("Socket.IO not attached to request");
      // }

      return res.status(500).json({
        success: false,
        message: "Internal server error. Submission marked as Internal Error.",
        updatedSubmission,
      });
    } catch (updateError) {
      console.error(
        "Failed to update submission to Internal Error:",
        updateError
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error. Submission marked as Internal Error.",
      });
    }
  } finally {
    ongoingUpdates.delete(subTestcaseId);
  }
};

const handleContestSubmissionCallback = async (req: Request, res: Response) => {
  const subTestcaseId = req.params.id;
  const contestId = req.params.contestId;
  const submissionId = req.params.submissionId;

  if (!subTestcaseId || !req.body || !submissionId) {
    return res.status(400).json({
      success: false,
      message: "Invalid request. Testcase ID or request body missing.",
    });
  }

  if (ongoingUpdates.has(subTestcaseId)) {
    return res.status(429).json({
      success: false,
      message: "This submission is already being processed.",
    });
  }

  ongoingUpdates.add(subTestcaseId);
  try {
    const { stdout, status, time, memory } = req.body;
    const parsedTime = time ? parseFloat(time) : 0;

    const result = await prisma.$transaction(
      async (tx) => {
        const updatedTestcase = await tx.submittedTestcase.update({
          where: { id: subTestcaseId },
          data: {
            output: stdout ?? "",
            status: status.id,
            memory: memory ?? 0,
            time: parsedTime,
          },
        });

        const submission = await tx.$queryRaw<
          Prisma.SubmissionGetPayload<{}>[]
        >`
                    SELECT * 
                    FROM "Submission"
                    WHERE "id" = ${updatedTestcase.submissionId}
                    FOR UPDATE
                `;

        if (!submission?.length) {
          throw new Error("Submission not found.");
        }

        const submissionData = submission[0];
        let { acceptedTestcases, evaluatedTestcases } = submissionData;
        let overallStatus = submissionData.status;

        //incrementing the evaluated testcases
        if (updatedTestcase.status >= 3) {
          evaluatedTestcases++;
        }

        //incrementing the accepted testcases count if the current testcase is accepted
        if (updatedTestcase.status === 3) {
          acceptedTestcases++;
        }

        if (evaluatedTestcases !== submissionData.totalTestcases) {
          if (updatedTestcase.status > 3) {
            overallStatus = updatedTestcase.status;
          }
        } else {
          //then it takes the maximum of current status and previous status
          overallStatus = Math.max(updatedTestcase.status, overallStatus);
        }

        const updatedSubmission = await tx.submission.update({
          where: { id: updatedTestcase.submissionId },
          data: {
            evaluatedTestcases,
            acceptedTestcases,
            status: overallStatus,
            memory: Math.max(submissionData.memory, memory),
            time: submissionData.time + parsedTime,
          },
        });

        //sending the updated submission data to the client
        // const io = (req as any).io as Server | undefined;
        // if (!io) {
        //     console.error('Socket.IO not attached to request');
        //     throw new Error("IO object not found");
        // }

        // console.log('Attempting to emit with io:', !!io);
        // io.to(updatedTestcase.submissionId).emit("update", {
        //     success: true,
        //     message: "Testcase updated successfully",
        //     updatedSubmission
        // });

        //if the final testcase get accepted, then update the score of the participant
        if (overallStatus === 3) {
          //find difficulty type of problem
          const problem = await tx.problem.findUnique({
            where: {
              id: updatedSubmission.problemId,
            },
            select: {
              difficulty: true,
            },
          });

          // Check for existing accepted submission excluding the current one
          const alreadySolved = await tx.submission.findFirst({
            where: {
              userId: updatedSubmission.userId,
              problemId: updatedSubmission.problemId,
              status: 3,
              NOT: {
                id: updatedSubmission.id, // Exclude current submission
              },
            },
            select: { id: true }, // Only get ID for existence check
          });

          if (!alreadySolved) {
            await tx.user.update({
              where: { id: updatedSubmission.userId },
              data: {
                problemsSolved: {
                  push: JSON.stringify({
                    id: updatedSubmission.problemId,
                    type: problem?.difficulty || Difficulty.Easy, // Use enum instead of string literal
                  }),
                },
              },
            });
          }

          const participant = await tx.contestParticipants.findFirst({
            where: {
              contestId,
              userId: updatedSubmission.userId,
            },
            select: {
              problemsSolved: true,
            },
          });

          if (
            !participant?.problemsSolved.includes(updatedSubmission.problemId)
          ) {
            const contestProblem = await tx.contestProblem.findFirst({
              where: {
                contestId,

                problemId: updatedSubmission.problemId,
              },
              select: {
                score: true,
              },
            });

            if (contestProblem) {
              const [_updatedParticipant, contestParticipants] =
                await Promise.all([
                  tx.contestParticipants.updateMany({
                    where: {
                      contestId,
                      userId: updatedSubmission.userId,
                    },
                    data: {
                      score: {
                        increment: contestProblem.score,
                      },
                      problemsSolved: {
                        push: updatedSubmission.problemId,
                      },
                    },
                  }),
                  tx.contestParticipants.findMany({
                    where: {
                      contestId,
                    },
                    orderBy: [{ score: "desc" }, { updatedAt: "asc" }],
                    include: {
                      user: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  }),
                ]);

              //send the updated leaderboard details to the client
              const io = (req as any).io as Server | undefined;
              if (!io) {
                console.error("Socket.IO not attached to request");
                throw new Error("IO object not found");
              }

              console.log("Attempting to emit with io:", !!io);
              io.to(contestId + "-leaderboard").emit("update", {
                success: true,
                message: "Leaderboard updated successfully",
                leaderboard: contestParticipants,
              });
            }
          }
        }

        return {
          success: true,
          message: "Submission updated successfully.",
          updatedSubmission,
        };
      },
      {
        maxWait: 20000,
        timeout: 20000,
      }
    );

    return res.status(200).json(result);
  } catch (error) {
    // Update the submission to "Internal Error" status (14)
    try {
      const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: 13, // Internal Error
        },
      });

      // Sending the updated submission data to the client
      // const io = (req as any).io as Server | undefined;
      // if (io) {
      //     io.to(submissionId).emit("update", {
      //         success: false,
      //         message: "Internal error occurred in the backend.",
      //         updatedSubmission,

      //     });
      // } else {
      //     console.error("Socket.IO not attached to request");
      // }

      return res.status(500).json({
        success: false,
        message: "Internal server error. Submission marked as Internal Error.",
        updatedSubmission,
      });
    } catch (updateError) {
      console.error(
        "Failed to update submission to Internal Error:",
        updateError
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error. Submission marked as Internal Error.",
      });
    }
  } finally {
    ongoingUpdates.delete(subTestcaseId);
  }
};

// const handleSubmissionCallback = async (req: Request, res: Response) => {
//     try {
//         const subTestcaseId = req.params.id;
//
//         if (!subTestcaseId || !req.body) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid request. Testcase ID or request body missing.",
//             });
//         }
//
//         const { stdout, status } = req.body;
//         // // Update the specific submitted testcase
//         // const existingTestcase = await prisma.SubmittedTestcase.findUnique({
//         //     where: { id: subTestcaseId },
//         //     select: { status: true },
//         // });
//         //
//         // if (!existingTestcase) {
//         //     return res.status(404).json({
//         //         success: false,
//         //         message: "Testcase not found.",
//         //     });
//         // }
//         //
//         // console.log(exisitingTestcase);
//         //
//         // // If the testcase is already executed successfully (status > 2), return early
//         // if (existingTestcase.status > 2) {
//         //     return res.status(200).json({
//         //         success: true,
//         //         message: "Testcase already executed successfully.",
//         //     });
//         // }
//
//         await prisma.$transaction(
//             async (tx) => {
//                 // If the testcase is in queue (status = 1) or in processing (status = 2), proceed to update it
//                 const updatedTestcase = await tx.SubmittedTestcase.update({
//                     where: { id: subTestcaseId },
//                     data: {
//                         output: stdout ?? "",
//                         status: status.id,
//                     },
//                 });
//
//                 // Lock the submission row to prevent concurrent updates
//                 const submission = await tx.$queryRaw`
//                     SELECT *
//                     FROM "Submission"
//                     WHERE "id" = ${updatedTestcase.submissionId}
//                     FOR UPDATE
//                 `;
//
//                 if (!submission?.length) {
//                     throw new Error("Submission not found.");
//                 }
//
//                 const submissionData = submission[0];
//                 let overallStatus: SubmissionStatus = SubmissionStatus.Pending;
//                 const isRejected =
//                     submissionData.status === SubmissionStatus.Rejected ||
//                     updatedTestcase.status >= 4;
//
//                 const isLastTestcase =
//                     submissionData.evaluatedTestcases + 1 ===
//                     submissionData.totalTestcases;
//
//                 if (isRejected) {
//                     overallStatus = SubmissionStatus.Rejected;
//                 } else if (isLastTestcase) {
//                     overallStatus =
//                         updatedTestcase.status === 3
//                             ? SubmissionStatus.Accepted
//                             : SubmissionStatus.Rejected;
//                 }
//
//                 // Update the submission with new status and increment evaluated testcases
//                 await tx.submission.update({
//                     where: { id: updatedTestcase.submissionId },
//                     data: {
//                         evaluatedTestcases: { increment: 1 }, // Atomic increment
//                         status: overallStatus,
//                     },
//                 });
//             },
//             {
//                 maxWait: 10000, // default: 2000
//                 timeout: 10000, // default: 5000
//                 // isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
//             }
//         );
//
//         return res.status(200).json({
//             success: true,
//             message: "Submission updated successfully.",
//         });
//     } catch (error) {
//         console.error("Error in handleSubmissionCallback:", error);
//
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error. Please try again later.",
//         });
//     }
// };

export {
  handleSubmissionCallback,
  handleRunCallback,
  handleContestSubmissionCallback,
};
