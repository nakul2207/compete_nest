import { Response, Request } from "express";

import {Server} from "socket.io"
import {Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { SubmissionStatus } from '@prisma/client';

const ongoingUpdates = new Set<string>();

const handleRunCallback = async (req: Request, res: Response) => {
    const problem_id = req.params.id;
    const uid = req.body.uid;

    try {
        const io = (req as any).io as Server | undefined;

        if (!io) {
            console.error('Socket.IO not attached to request');
            return res.status(500).json({
                success: false,
                message: "Socket.IO not initialized"
            });
        }

        if (uid) {
            console.log('Attempting to emit with io:', !!io);
            io.to(uid).emit("update", {
                success: true,
                message: "Testcase updated successfully",
                problem_id,
                uid
            });
            console.log(`Emitted to room ${uid}`);
        } else {
            console.log("UID not found in callback");
        }

        return res.status(200).json({
            success: true,
            message: "callback called properly"
        });
    } catch (error) {
        console.error('Error in handleRunCallback:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const handleSubmissionCallback = async (req: Request, res: Response) => {
    const subTestcaseId = req.params.id;

    if (!subTestcaseId || !req.body) {
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
        const { stdout, status } = req.body;

        await prisma.$transaction(
            async (tx) => {
                const updatedTestcase = await tx.SubmittedTestcase.update({
                    where: { id: subTestcaseId },
                    data: {
                        output: stdout ?? "",
                        status: status.id,
                    },
                });

                const submission = await tx.$queryRaw`
                    SELECT * 
                    FROM "Submission"
                    WHERE "id" = ${updatedTestcase.submissionId}
                    FOR UPDATE
                `;

                if (!submission?.length) {
                    throw new Error("Submission not found.");
                }

                const submissionData = submission[0];
                let overallStatus: SubmissionStatus = SubmissionStatus.Pending;

                const isRejected =
                    submissionData.status === SubmissionStatus.Rejected ||
                    updatedTestcase.status >= 4;

                const isLastTestcase =
                    submissionData.evaluatedTestcases + 1 ===
                    submissionData.totalTestcases;

                if (isRejected) {
                    overallStatus = SubmissionStatus.Rejected;
                } else if (isLastTestcase) {
                    overallStatus =
                        updatedTestcase.status === 3
                            ? SubmissionStatus.Accepted
                            : SubmissionStatus.Rejected;
                }

                const updatedSubmission = await tx.submission.update({
                    where: { id: updatedTestcase.submissionId },
                    data: {
                        evaluatedTestcases: { increment: 1 },
                        status: overallStatus,
                    },
                });

                //sending the updated submission data to the client
                const io = (req as any).io as Server | undefined;
                if (!io) {
                    console.error('Socket.IO not attached to request');
                    throw new Error("IO object not found");
                }

                console.log('Attempting to emit with io:', !!io);
                io.to(updatedTestcase.submissionId).emit("update", {
                    success: true,
                    message: "Testcase updated successfully",
                    updatedSubmission
                });
            },
            {
                maxWait: 10000,
                timeout: 10000,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Submission updated successfully.",
        });
    } catch (error) {
        console.error("Error in handleSubmissionCallback:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
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

export { handleSubmissionCallback, handleRunCallback };
