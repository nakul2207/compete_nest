import { Request,Response } from "express";
import {PrismaClient } from "@prisma/client";
import {addContestStartJob, addContestEndJob} from "../bullmq/queues/contestQueues"

const prisma = new PrismaClient();

interface Problem{
    id: string,
    score: number
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

const handleCreateContest = async(req:Request, res:Response)=>{
    try {
        const {title, description, startTime, endTime, problems} = req.body; // Assuming `req.body` is an array of contest objects

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        //create record in contest table
        const contest = await prisma.contest.create({
            data:{
                title,
                description,
                startTime,
                endTime,
                problems: problems.map((problem: Problem) => problem.id),
                userId: req.user.id
            },
            select:{
                id: true
            }
        })

        // Ensure the contest is created before proceeding
        if (!contest || !contest.id) {
            throw new Error("Failed to create contest.");
        }

        //create record in contestProblem table
        await Promise.all(
            problems.map(async (problem:Problem) => {
                await prisma.contestProblem.create({
                    data:{
                        contestId: contest.id,
                        problemId: problem.id,
                        score: problem.score
                    }
                })

                //add the contestid field to the problem table
                await prisma.problem.update({
                    where: {
                        id: problem.id
                    },
                    data: {
                        contestId: contest.id
                    }
                })
            })
        );

        //adding the contest to the queue for scheduling
        await addContestStartJob(contest.id, new Date(startTime));
        await addContestEndJob(contest.id, new Date(endTime));

        res.status(201).json({ message: 'Contest added successfully', contestId: contest.id});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding companies', error });
    }
}

const handleDeleteContest = async (req: Request, res: Response) => {
    try {
        //delete contest logic
        //delete all the problems from the contestProblem table

        //delete all the users from the contestParticipants table

        //now delete the contest from the contest table

        res.status(200).json({ message: 'Contest deleted successfully', });
    } catch (error) {
        console.error('Error deleting contest:', error);
        res.status(500).json({ message: 'Error deleting contest', error });
    }
};

const handleEditContest = async (req: Request, res: Response) => {
    try {
        //edit contest logic


        res.status(200).json({ message: 'Contest updated successfully' });
    } catch (error) {
        console.error('Error updating contest:', error);
        res.status(500).json({ message: 'Error updating contest', error });
    }
};

const handleGetContestByID = async(req:Request, res:Response)=>{
    try {
        //get contest by id logic
        const requiredContest = await prisma.contest.findUnique({
            where: {
                id: req.params.id,
            },
        })

        if(!requiredContest){
            res.status(404).json({
                message: "No such contest found."
            })
        }

        res.status(200).json({ message: 'Contest fetched successfully', contestData: requiredContest });
    } catch (error) {
        console.error('Error fetching contest:', error);
        res.status(500).json({ message: 'Error fetching contest', error });
    }
}

const handleGetAll = async (req: Request, res: Response) => {
    try {
        // Get all contests
        const contests = await prisma.contest.findMany();

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
        const userAttended = new Set<string>(userContests.map((uc) => uc.contestId));

        // Add isAttended field to each contest
        const enrichedContests = contests.map((contest) => ({
            ...contest,
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
            error: error.message,
        });
    }
};

const handleContestRegister = async (req: Request, res: Response)=>{
    try {
        //register/unregister user for the contest
        const contestId = req.params.id;
        const {register} = req.query;

        //check for the contest timing the user can only register/unregister before the start time
        const contest = await prisma.contest.findUnique({
            where: {
                id: contestId
            }
        });

        if(!contest){
            res.status(404).json({
                message: "No such contest found."
            })
        }

        if(contest && contest?.startTime && contest?.startTime < new Date()){
            res.status(400).json({
                message: "Contest has already started."
            })
        }

        //create a record for the user in the ContestParticipants table to register
        if(register === "true"){
            await prisma.contestParticipants.create({
                data: {
                    contestId: contestId,
                    userId: req.user?.id
                }
            })

            return res.status(200).json({
                message: "Contest registration successful. You will be notified 10 minutes before starting the contest.",
            });
        }else{
            await prisma.contestParticipants.deleteMany({
                where: {
                    contestId: contestId,
                    userId: req.user?.id
                }
            })

            return res.status(200).json({
                message: "Contest unregistration successful.",
            });
        }
    } catch (error) {
        console.error('Error in handling registration:', error);
        res.status(500).json({ message: 'Error in handling registration. Please try after sometime', error });
    }
}

export {handleCreateContest, handleDeleteContest, handleEditContest, handleGetAll, handleGetContestByID, handleContestRegister, handleStartContest, handleEndContest};