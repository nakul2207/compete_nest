import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  addContestStartJob,
  addContestEndJob,
  removeContestStartJob,
  removeContestEndJob,
  addContestEmailJob,
  removeContestEmailJob
} from "../bullmq/queues/contestQueues";

const prisma = new PrismaClient();

interface Problem {
  id: string;
  score: number;
}

interface JobIds {
  startJobId?: string; // Change to string, as job IDs are strings
  endJobId?: string;
  emailJobId?: string;
}

const handleStartContest = async (contestId: string) => {
  try {
    // Update the contest's status to Ongoing
    await prisma.contest.update({
      where: {
        id: contestId, // Use contestId to identify the contest
      },
      data: {
        status: "Ongoing", // Update status to Ongoing
      },
    });
  } catch (error) {
    console.error("Error starting contest:", error);
  }
};

const handleEndContest = async (contestId: string) => {
  try {
    // Update the contest's status to Ongoing
    await prisma.contest.update({
      where: {
        id: contestId, // Use contestId to identify the contest
      },
      data: {
        status: "Ended", // Update status to Ended
      },
    });
  } catch (error) {
    console.error("Error ending contest:", error);
  }
};

const handleCreateContest = async (req: Request, res: Response) => {
  try {
    const { title, description, startTime, endTime, problems } = req.body; // Assuming `req.body` is an array of contest objects

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const contest = await prisma.$transaction(async (prisma) => {
      const createdContest = await prisma.contest.create({
        data: {
          title,
          description,
          startTime,
          endTime,
          problems: problems.map((problem: Problem) => problem.id),
          userId: req.user.id,
        },
        select: {
          id: true,
        },
      });

      if (!createdContest || !createdContest.id) {
        throw new Error("Failed to create contest.");
      }

      await Promise.all(
        problems.map(async (problem: Problem) => {
          await prisma.contestProblem.create({
            data: {
              contestId: createdContest.id,
              problemId: problem.id,
              score: problem.score,
            },
          });

          await prisma.problem.update({
            where: {
              id: problem.id,
            },
            data: {
              contestId: createdContest.id,
            },
          });
        })
      );

      return createdContest;
    });

    //adding the contest to the queue for scheduling
    const contestStartJobId = await addContestStartJob(contest.id, new Date(startTime));
    const contestEndJobId = await addContestEndJob(contest.id, new Date(endTime));

    // Determine notification time
    const parsedStartTime = new Date(startTime);
    let notificationTime = new Date(parsedStartTime.getTime() - 10 * 60000);

    if (parsedStartTime.getTime() - Date.now() < 10 * 60000) {
      notificationTime = new Date();
    }
    const contestEmailJobId  = await addContestEmailJob(contest.id, notificationTime);

    //adding the queue id's to the contest table -> (later used for deleting the scheduled jobs)
    const jobIds = {
      startJobId: contestStartJobId,
      endJobId: contestEndJobId,
      emailJobId: contestEmailJobId,
    };

    await prisma.contest.update({
      where: { id: contest.id },
      data: {
        jobIds: JSON.stringify(jobIds),
      },
    });

    res
      .status(201)
      .json({ message: "Contest added successfully", contestId: contest.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding companies", error });
  }
};

//not completed
const handleDeleteContest = async (req: Request, res: Response) => {
  try {
    //getting the contestId from parameters
    const contestId = req.params.id;

    const contest = await prisma.contest.findUnique({
      where: {
        id: contestId,
      },
    });

    if (!contest) {
      return res.status(404).json({
        message: "No such contest found.",
      });
    }

    // if the user is organiser, then the owner or the contest must be the same user to delete it
    if (req.user?.role === "Organiser" && contest?.userId !== req.user.id) {
      return res.status(403).json({
        message: "You aren't authorized to delete this contest.",
      });
    }

    //deleting the contest id from the problems in the problem table
    await prisma.$transaction(async (prisma) => {
      //deleting the contest id from the problems in the problem table
      await Promise.all(contest.problems.map(async (problemId: string) => {
        await prisma.problem.update({
          where: {
            id: problemId,
          },
          data: {
            contestId: null,
          },
        });
      }));

      //delete all the problems from the contestProblem table
      await prisma.contestProblem.deleteMany({
        where: {
          contestId,
        },
      });

      //delete all the users from the contestParticipants table
      await prisma.contestParticipants.deleteMany({
        where: {
          contestId,
        },
      });

      //delete the jobs scheduled for this contest from all queues
      if (contest.jobIds) {
        const jobIds: JobIds = JSON.parse(contest.jobIds as string); // Type assertion, as jobIds is Json type
        if (jobIds.startJobId) await removeContestStartJob(jobIds.startJobId);
        if (jobIds.endJobId) await removeContestEndJob(jobIds.endJobId);
        if (jobIds.emailJobId) await removeContestEmailJob(jobIds.emailJobId);
      }

      //now delete the contest from the contest table
      await prisma.contest.delete({
        where: {
          id: contestId,
        },
      });
    });

    return res.status(200).json({ message: `${contest?.title} contest deleted successfully` });
  } catch (error) {
    console.error("Error deleting contest:", error);
    return res.status(500).json({ message: "Error deleting contest", error });
  }
};

//not completed
const handleEditContest = async (_req: Request, res: Response) => {
  try {
    //edit contest logic

    res.status(200).json({ message: "Contest updated successfully" });
  } catch (error) {
    console.error("Error updating contest:", error);
    res.status(500).json({ message: "Error updating contest", error });
  }
};

const handleGetContestByID = async (req: Request, res: Response) => {
  try {
    //get contest by id logic
    const requiredContest = await prisma.contest.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!requiredContest) {
      res.status(404).json({
        message: "No such contest found.",
      });
    }

    //check if the user is registered for the contest
    const isRegistered = await prisma.contestParticipants.findFirst({
      where: {
        contestId: req.params.id,
        userId: req.user?.id,
      },
    });

    //getting the number of participants in the contest
    const participants = await prisma.contestParticipants.count({
      where: {
        contestId: req.params.id,
      },
    });

    //get the problem title, difficulty and score using problem Ids in contestData
    const problemDetails = await Promise.all(
      requiredContest!.problems.map(async (problemId: string) => {
        const problem = await prisma.problem.findUnique({
          where: {
            id: problemId,
          },
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        });

        //get the score of the problem from the contestProblem table
        const participant = await prisma.contestProblem.findFirst({
          where: {
            problemId: problemId,
            contestId: req.params.id,
          },
          select: {
            score: true,
          },
        });

        //getting the solved problems of the user
        const solvedProblems = await prisma.contestParticipants.findFirst({
          where: {
            contestId: req.params.id,
            userId: req.user?.id,
          },
          select: {
            problemsSolved: true,
          },
        });

        return {
          ...problem,
          score: participant?.score || 0,
          solved: solvedProblems?.problemsSolved || [],
        };
      })
    );

    res.status(200).json({
      message: "Contest fetched successfully",
      contestData: {
        ...requiredContest,
        participants,
        registered: isRegistered ? true : false,
        problems: problemDetails,
        server_time: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching contest:", error);
    res.status(500).json({ message: "Error fetching contest", error });
  }
};

const handleGetAll = async (req: Request, res: Response) => {
  try {
    // Get all contests
    const contests = await prisma.contest.findMany({
      orderBy: {
        endTime: "desc",
      },
    });

    // Get all the user's contests from contestParticipants
    const userContests = await prisma.contestParticipants.findMany({
      where: {
        userId: req.user?.id, // Ensure req.user exists; otherwise, handle unauthorized error
      },
      select: {
        contestId: true,
      },
    });

    // Create a Set of attended contest IDs for quick lookup
    const userAttended = new Set<string>(
      userContests.map((uc) => uc.contestId)
    );

    // Add isAttended field to each contest
    const enrichedContests = contests.map((contest) => ({
      ...contest,
      server_time: new Date().toISOString(),
      attended: userAttended.has(contest.id),
    }));

    res.status(200).json({
      message: "Contests fetched successfully",
      contests: enrichedContests,
    });
  } catch (error) {
    console.error("Error fetching contests:", error);
    res.status(500).json({
      message: "Error fetching contests",
      error: error instanceof Error ? error.message : "Unknown error occured",
    });
  }
};

const handleContestRegister = async (req: Request, res: Response) => {
  try {
    //register/unregister user for the contest
    const contestId = req.params.id;
    const { register } = req.query;

    //check for the contest timing the user can only register/unregister before the start time
    const contest = await prisma.contest.findUnique({
      where: {
        id: contestId,
      },
    });

    if (!contest) {
      res.status(404).json({
        message: "No such contest found.",
      });
    }

    if (contest && contest?.startTime && contest?.startTime < new Date()) {
      res.status(400).json({
        message: "Contest has already started.",
      });
    }

    //create a record for the user in the ContestParticipants table to register
    if (register === "true") {
      await prisma.contestParticipants.create({
        data: {
          contestId: contestId,
          userId: req.user?.id,
        },
      });

      return res.status(200).json({
        message:
          "Contest registration successful.",
      });
    } else {
      await prisma.contestParticipants.deleteMany({
        where: {
          contestId: contestId,
          userId: req.user?.id,
        },
      });

      return res.status(200).json({
        message: "Contest unregistration successful.",
      });
    }
  } catch (error) {
    console.error("Error in handling registration:", error);
    res.status(500).json({
      message: "Error in handling registration. Please try after sometime",
      error,
    });
  }
};

const handleGetLeaderboard = async (req: Request, res: Response) => {
  try {
    const contestParticipants = await prisma.contestParticipants.findMany({
      where: {
        contestId: req.params.id,
      },
      orderBy: [{ score: "desc" }, { updatedAt: "asc" }],
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Leaderboard fetched successfully",
      leaderboard: contestParticipants,
    });
  } catch (error) {
    console.error("Error in handling leaderboard:", error);
    res.status(500).json({
      message: "Error in handling leaderboard. Please try after sometime",
      error,
    });
  }
};

export {
  handleCreateContest,
  handleDeleteContest,
  handleEditContest,
  handleGetAll,
  handleGetContestByID,
  handleContestRegister,
  handleStartContest,
  handleEndContest,
  handleGetLeaderboard,
};
