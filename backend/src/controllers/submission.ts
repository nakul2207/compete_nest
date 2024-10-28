import { Response, Request } from "express";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { SubmissionResult } from '@prisma/client';

const statuses: { [key: number]: SubmissionResult } = {
    1: SubmissionResult.IN_QUEUE,
    2: SubmissionResult.PENDING,
    3: SubmissionResult.AC,
    4: SubmissionResult.WA,
    5: SubmissionResult.TLE,
    6: SubmissionResult.CE,
    7: SubmissionResult.RE,
    8: SubmissionResult.RE,
    9: SubmissionResult.RE,
    10: SubmissionResult.RE,
    11: SubmissionResult.RE,
    12: SubmissionResult.RE,
    13: SubmissionResult.INTERNAL_ERROR,
    14: SubmissionResult.EXEC_FORMAT_ERROR
};


const handleSubmissionCallback = async (req:Request, res:Response) => {
    try {
        const sub_testcase_id = req.params.id;
        // console.log(sub_testcase_id);
        console.log(req.body);

        const updatedtestcase = await prisma.submitted_testcase.update({
            where:{
                id:sub_testcase_id
            },
            data:{
                output:(req.body.stdout==null?"":req.body.stdout),
                status: statuses[req.body.status.id]
            }
        })
        console.log(updatedtestcase)

        const submission = await prisma.submission.findUnique({
            where: {
                id: updatedtestcase.submissionId,
            },
            select: {
                evaluatedTestcases: true,
            },
        });

        if (submission) {
            const updateSubmission = await prisma.submission.update({
                where: {
                    id: updatedtestcase.submissionId,
                },
                data: {
                    evaluatedTestcases: submission.evaluatedTestcases as number + 1 , // Increment by 1
                },
            });

            console.log(updateSubmission);
        } else {
            console.log("Submission not found");
        }

        return res.status(200).json({
            success: true,
            data: req.body
        });
    } catch (e) {
        console.error("Error in handleSubmitProblem:", e);

        return res.status(500).json({
            success: false
        });
    }
};



export { handleSubmissionCallback };
