import { Response, Request } from "express";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const s3client = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID as string,
        secretAccessKey: process.env.SECRET_ACCESS_KEY as string
    }
});

async function getObjectURL(key: string){
    const command = new GetObjectCommand({
        Bucket: 'compete-nest',
        Key: key,
    });

    const url = getSignedUrl(s3client, command);
    return url;
}

const handleSubmitProblem = async (req:Request, res:Response) => {
    try {
        const { code } = req.body;
        const problem_id: string = req.params.id;
        const user_id: string = "123";

        //getting all the testcases for the given problem
        const testcases = await prisma.testcase.findMany({
            where: {
                problemId: problem_id
            }
        });

        //creating a record in the submission table
        const sub_id = await prisma.submission.create({
            data: {
                problemId: problem_id,
                userId: user_id,
                userCode: code,
                totalTestcases: testcases.length,
            },
            select: {
                id: true,  // Only select the ID to return
            },
        });

        //generating the presigned urls for testcases input and output files using there path and aws s3 client
        const input_urls: string[] = [];
        const exp_output_urls: string[] = [];
        const callback_urls: string[] = [];

        await Promise.all(
            testcases.map(async ({ id, inputPath, expOutputPath }) => {
                const input_url = await getObjectURL(inputPath);
                const exp_output_url = await getObjectURL(expOutputPath);

                const sub_testcase_id = await prisma.submitted_testcase.create({
                    data: {
                        testcaseId: id,
                        submissionId: sub_id.id,
                    },
                    select: {
                        id: true // Only select the ID to return
                    }
                })

                const callback_url = `/api/submission/submitted_testcase/${sub_testcase_id.id}`;

                input_urls.push(input_url);
                exp_output_urls.push(exp_output_url);
                callback_urls.push(callback_url);
            })
        );

        return res.status(200).json({
            success: true,
            submission_id: sub_id.id,
            input_urls,
            exp_output_urls,
            callback_urls
        });
    } catch (e) {
        console.error("Error in handleSubmitProblem:", e);

        return res.status(500).json({
            success: false
        });
    }
};

export { handleSubmitProblem };
