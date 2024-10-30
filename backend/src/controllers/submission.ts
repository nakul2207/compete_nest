import { Response, Request } from "express";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { SubmissionStatus } from '@prisma/client';

const handleSubmissionCallback = async (req:Request, res:Response) => {
    try {
        const sub_testcase_id = req.params.id;
        // console.log(sub_testcase_id);
        // console.log(req.body);

        const updatedtestcase = await prisma.SubmittedTestcase.update({
            where:{
                id: sub_testcase_id
            },
            data:{
                output: (req.body.stdout==null?"": req.body.stdout),
                status: req.body.status.id
            }
        })
        // console.log(updatedtestcase)

        const submission = await prisma.submission.findUnique({
            where: {
                id: updatedtestcase.submissionId,
            },
            select: {
                evaluatedTestcases: true,
                status: true,
                totalTestcases: true
            },
        });

        if (submission) {
            let overall_status: SubmissionStatus = SubmissionStatus.Pending;

            if (submission.status === SubmissionStatus.Rejected || updatedtestcase.status >= 4) {
                overall_status = SubmissionStatus.Rejected;
            }

            if (submission.evaluatedTestcases + 1 === submission.totalTestcases) {
                if (submission.status === SubmissionStatus.Rejected || updatedtestcase.status !== 3) {
                    overall_status = SubmissionStatus.Rejected;
                } else {
                    overall_status = SubmissionStatus.Accepted;
                }
            }

            const updateSubmission = await prisma.submission.update({
                where: {
                    id: updatedtestcase.submissionId,
                },
                data: {
                    evaluatedTestcases: submission.evaluatedTestcases as number + 1 , // Increment by 1
                    status: overall_status
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
