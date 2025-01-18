import { Request,Response } from "express";
import {PrismaClient } from "@prisma/client";
import {addContestStartJob, addContestEndJob} from "../bullmq/queues/contestQueues"
import {tryCatch} from "bullmq";

const prisma = new PrismaClient();

const handleCreateContest = async(req:Request, res:Response)=>{
    try {
        const contestData = req.body; // Assuming `req.body` is an array of contest objects
        console.log(contestData);

        //create record in contest table
        // const contest = prisma.contest.create({
        //     data:{
        //
        //     }
        // })

        //create record int contestProblem table

        //adding the contest to the queue for scheduling
        await addContestStartJob(contestData.title, new Date(contestData.startTime));
        await addContestEndJob(contestData.title, new Date(contestData.endTime));

        res.status(201).json({ message: 'Contest added successfully', contestData});
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
        const requiredContest = prisma.contest.findUnique({
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

const handleGetAll = async(req:Request, res:Response)=>{
    try {
        //get all contests
        const contests = prisma.contest.findMany({});

        res.status(200).json({ message: 'Contests fetched successfully', contests});
    } catch (error) {
        console.error('Error fetching contest:', error);
        res.status(500).json({ message: 'Error fetching contest', error });
    }
}

const handleContestRegister = async (req: Request, res: Response)=>{
    try {
        //register user for the contest
        const contestId = req.params.id;
        const userId = "123";

        //check for the contest timing the user can only register before the start time

        //create a record for the user in the ContestParticipants table to register


        res.status(200).json({ message: 'Contest registration successful. You will be notified 10 minutes before starting the contest.', });
    } catch (error) {
        console.error('Error in registering:', error);
        res.status(500).json({ message: 'Error in registering. Please try after sometime', error });
    }
}

const handleContestUnregister = async (req: Request, res: Response)=>{
    try {
        //register user for the contest
        const contestId = req.params.id;
        const userId = "123";

        //check for the contest timing the user can only un-register before the start time

        //create a record for the user in the ContestParticipants table to unregister


        res.status(200).json({ message: 'Contest unregister successful.', });
    } catch (error) {
        console.error('Error in registering:', error);
        res.status(500).json({ message: 'Error in registering. Please try after sometime', error });
    }
}

export {handleCreateContest, handleDeleteContest, handleEditContest, handleGetAll, handleGetContestByID, handleContestRegister, handleContestUnregister};