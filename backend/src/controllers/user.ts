import { Response, Request } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const handleAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            },
        });
        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const  userId  = req.params.id;
        const { role } = req.body;

        // Validate the input
        if (!userId || !role) {
            return res.status(400).json({ error: "Missing userId or role in request" });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role }, 
        });

        
        return res.status(200).json({ message: "User role updated successfully", user: updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;

        // Validate the input
        if (!userId) {
            return res.status(400).json({ error: "Missing userId in request" });
        }

        // Delete the user
        const deletedUser = await prisma.user.delete({
            where: { id: userId },
        });

        return res.status(200).json({ message: "User deleted successfully", user: deletedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};