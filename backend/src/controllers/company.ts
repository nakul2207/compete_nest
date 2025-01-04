import { Request,Response } from "express";
import {PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handleCreateCompany = async(req:Request, res:Response)=>{
    try {
        const {companies} = req.body; // Assuming `req.body` is an array of company objects
        await prisma.company.createMany({
            data: companies,
            skipDuplicates: true,
        });
        res.status(201).json({ message: 'Companies added successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding companies', error });
    }
}

const handleDeleteCompany = async (req: Request, res: Response) => {
    try {
        const deletedCompany = await prisma.company.delete({
            where: {
                id: req.params.id, //company id
            },
        });
        res.status(200).json({ message: 'Company deleted successfully', deletedCompany });
    } catch (error) {
        console.error('Error deleting company:', error);
        res.status(500).json({ message: 'Error deleting company', error });
    }
};

const handleEditCompany = async (req: Request, res: Response) => {
    try {
        const companyData = req.body;
        await prisma.company.update({
            where: {
                id: req.params.id, //company id
            },
            data: companyData, 
        });

        res.status(200).json({ message: 'Company updated successfully' });
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ message: 'Error updating company', error });
    }
};

const handleGetAll = async(req:Request, res:Response)=>{
    try {
        const companies = await prisma.company.findMany({});

        res.status(200).json({ message: 'Company fetched successfully', companies });
    } catch (error) {
        console.error('Error fetching company:', error);
        res.status(500).json({ message: 'Error fetching company', error });
    }
}

export {handleCreateCompany, handleDeleteCompany, handleEditCompany, handleGetAll};