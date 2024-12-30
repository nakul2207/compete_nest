import { Request,Response } from "express";
import {PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handleCreateTopic = async(req:Request, res:Response)=>{
    try {
        const {topics} = req.body; // Assuming `req.body` is an array of topic objects
        await prisma.topic.createMany({
            data: topics,
            skipDuplicates: true, // Optional: Skips duplicates based on unique constraints
        });
        res.status(201).json({ message: 'Topics added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding topics', error });
    }
}
const handleDeleteTopic = async (req: Request, res: Response) => {
    try {
        const deletedTopic = await prisma.topic.delete({
            where: {
                id: req.params.id,
            },
        });
        res.status(200).json({ message: 'Topic deleted successfully', deletedTopic });
    } catch (error) {
        console.error('Error deleting topic:', error);
        res.status(500).json({ message: 'Error deleting topic', error });
    }
};

const handleEditTopic = async (req: Request, res: Response) => {
    try {
        const topicData = req.body;
        await prisma.topic.update({
            where: {
                id: req.params.id,
            },
            data: topicData,
        });

        res.status(200).json({ message: 'Topic updated successfully' });
    } catch (error) {
        console.error('Error updating topic:', error);
        res.status(500).json({ message: 'Error updating topic', error });
    }
};
const handleGetAll = async(req:Request,res:Response)=>{
    try {
        const topics = await prisma.topic.findMany({});

        res.status(200).json({ message: 'Topic fetched successfully', topics });
    } catch (error) {
        console.error('Error fetching topic:', error);
        res.status(500).json({ message: 'Error fetching topic', error });
    }
}

export {handleCreateTopic, handleDeleteTopic, handleEditTopic, handleGetAll};
