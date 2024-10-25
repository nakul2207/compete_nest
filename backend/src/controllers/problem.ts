import { Response, Request } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handleSubmitProblem = async (req:Request, res:Response) => {
    try {
        const { problem_id, code } = req.body;
        // Fetch test cases for the given problem_id
        const testcases = await prisma.testcase.findMany({
            where: {
                problem_id
            }
        });

        return res.status(200).json({
            success: true,
            problem_id,
            code,
            testcases // Return the fetched test cases
        });
    } catch (e) {
        console.error("Error in handleSubmitProblem:", e);

        return res.status(500).json({
            success: false
        });
    }
};

export { handleSubmitProblem };
