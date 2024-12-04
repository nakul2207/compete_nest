import { Response, Request } from "express";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { SubmissionStatus } from '@prisma/client';

const handleSubmissionCallback = async (req: Request, res: Response) => {
    try {
        const subTestcaseId = req.params.id;

        // Validate required fields
        if (!subTestcaseId || !req.body) {
            return res.status(400).json({
                success: false,
                message: "Invalid request. Testcase ID or request body missing.",
            });
        }

        const { stdout, status } = req.body;

        if (typeof status?.id !== 'number') {
            return res.status(400).json({
                success: false,
                message: "Invalid status ID in request body.",
            });
        }

        // Update the specific submitted testcase
        const updatedTestcase = await prisma.SubmittedTestcase.update({
            where: { id: subTestcaseId },
            data: {
                output: stdout ?? "",
                status: status.id,
            },
        });

        // Retrieve related submission details
        const submission = await prisma.submission.findUnique({
            where: { id: updatedTestcase.submissionId },
            select: {
                evaluatedTestcases: true,
                status: true,
                totalTestcases: true,
            },
        });

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found.",
            });
        }

        let overallStatus: SubmissionStatus = SubmissionStatus.Pending;

        // Determine the overall submission status
        const isRejected =
            submission.status === SubmissionStatus.Rejected || updatedTestcase.status >= 4;

        const isLastTestcase =
            submission.evaluatedTestcases + 1 === submission.totalTestcases;

        if (isRejected) {
            overallStatus = SubmissionStatus.Rejected;
        } else if (isLastTestcase) {
            overallStatus = updatedTestcase.status === 3
                ? SubmissionStatus.Accepted
                : SubmissionStatus.Rejected;
        }

        // Update the submission with new status and increment evaluated testcases
        const updatedSubmission = await prisma.submission.update({
            where: { id: updatedTestcase.submissionId },
            data: {
                evaluatedTestcases: submission.evaluatedTestcases + 1,
                status: overallStatus,
            },
        });

        console.log("Submission updated successfully:", updatedSubmission);

        return res.status(200).json({
            success: true,
            data: updatedSubmission,
        });
    } catch (error) {
        console.error("Error in handleSubmissionCallback:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
};

export { handleSubmissionCallback };
