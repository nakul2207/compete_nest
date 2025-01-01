import { Response, Request } from "express";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

import {Difficulty, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const s3client = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID as string,
        secretAccessKey: process.env.SECRET_ACCESS_KEY as string
    }
});

interface SaveProblemRequest {
    userId: string;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    resources: string[];
    constraints: string;
    difficulty: Difficulty;
    ownerCode: string;
    ownerCodeLanguage: string;
    contestId?: string | null;
    topics: string[];
    companies: string[];
    testCases: boolean[]
}

async function getObjectURL(key: string){
    const command = new GetObjectCommand({
        Bucket: 'compete-nest',
        Key: key,
    });

    return getSignedUrl(s3client, command)
}

async function putObjectURL(key: string){
    const command = new PutObjectCommand({
        Bucket: 'compete-nest',
        Key: key,
        ContentType: "text/plain",
    })

    return getSignedUrl(s3client, command, { expiresIn: 3600 })
}

const handleSubmitProblem = async (req:Request, res:Response) => {
    try {
        const { code, language_id } = req.body;
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
                language: language_id,
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

                const sub_testcase_id = await prisma.SubmittedTestcase.create({
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

const handleRunProblem = async (req: Request, res: Response) => {
    const problem_id = req.params.id;

    //creating a random unique id for websocket connection
    const uid = problem_id + Date.now();

    return res.status(200).json({
        success: true,
        uid
    })
}

const handleCreateProblem  = async (req: Request, res:Response) =>{
    const userId = "123";
    const {
        title,
        description,
        inputFormat,
        outputFormat,
        resources,
        constraints,
        difficulty,
        ownerCode,
        ownerCodeLanguage,
        contestId = null,
        topics = [],
        companies = [],
        testCases = []
    }: SaveProblemRequest = req.body;

    // Validate required fields
    if (!userId || !title || !description || !inputFormat || !outputFormat || !difficulty || !ownerCode || ownerCodeLanguage == null || testCases.length <= 0) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    try {
        // Save the problem to the database
        const problemId = await prisma.problem.create({
            data: {
                userId,
                title,
                description,
                inputFormat,
                outputFormat,
                resourcesPath: resources,
                constraints,
                difficulty,
                ownerCode,
                ownerCodeLanguage: parseInt(ownerCodeLanguage),
                contestId,
                topics,
                companies,
            },
            select: {
                id: true
            }
        });

        //generating psURLs for resources
        const resourceURLs = await Promise.all(
            resources.map(async (caption, index) => {
                const resourceKey = `Problems/${problemId.id}/resource/resource_${index}`;

                //generating psURL and returning it
                return await putObjectURL(resourceKey);
            })
        )

        //create records in testcases table & generate psURLs
        const testcasesURLs = await Promise.all(
            testCases.map(async (isExample, index) => {
                const inputKey = `Problems/${problemId.id}/input/input_${index}.txt`;
                const outputKey = `Problems/${problemId.id}/output/output_${index}.txt`;

                const inputUrl = await putObjectURL(inputKey);
                const outputUrl = await putObjectURL(outputKey);

                //create a record in the testcase table
                await prisma.testcase.create({
                    data:{
                        problemId: problemId.id,
                        inputPath: inputKey,
                        expOutputPath: outputKey,
                        isExample
                    }
                });

                return {
                    inputUrl,
                    outputUrl
                };
            })
        );

        res.status(201).json({ id: problemId, testcasesURLs, resourceURLs });
    } catch (error) {
        console.error('Error saving problem:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

const handleGetAllProblem =  async (req: Request, res:Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    try{
        const problems = await prisma.queryTable.findMany({
            skip,
            take: limit,
            distinct: ['problemId'],
        });
        // console.log(problems);
        const totalPages = Math.ceil(problems.length / limit);
        res.status(200).json({ problems,totalPages });
    }catch (error) {
        console.error('Error saving problem:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

const handleGetFilterProblems = async (req: Request, res: Response) => {
    try {
        const {
            searchTerm,
            difficulty,
            topic,
            company,
            page,
            pageSize,
        } = req.query;

        const pageNum = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNum - 1) * limit;

        const filter: any = {};

        if (searchTerm) {
            filter.title = { contains: searchTerm, mode: "insensitive" };
        }

        if (difficulty) {
            filter.difficulty = difficulty as string; // Assuming difficulty is an enum
        }

        if (topic) {
            const topics = Array.isArray(topic) ? topic : [topic];
            filter.topicId = { in: topics };
        }

        if (company) {
            const companies = Array.isArray(company) ? company : [company];
            filter.companyId = { in: companies };
        }

        if (
            !searchTerm &&
            !difficulty &&
            !topic &&
            !company
        ) {
            return res.status(200).json({
                problems: [],
                totalPages: 0,
                currentPage: pageNum,
            });
        }

        // Fetch filtered problems with pagination
        const problems = await prisma.queryTable.findMany({
            where: filter,
            skip: offset,
            take: limit,
            distinct: ['problemId'],
        });

        const totalPages = Math.ceil(problems.length / limit);

        res.status(200).json({
            problems,
            totalPages,
            currentPage: pageNum,
        });
    } catch (error) {
        console.error("Error fetching problems:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const handleGetProblemById = async (req: Request, res: Response) => {
    try {
        const problem = await prisma.problem.findUnique({
            where: {
                id: req.params.id,
            },
        });

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found.' });
        }

        res.status(200).json({ problem });
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const handleGetAllExampleTestcases = async (req: Request, res: Response) => {
    try{
        const testcases = await prisma.testcase.findMany({
            where: {
                problemId: req.params.id,
                isExample: true
            }
        });

        const input_urls: string[] = [];
        const output_urls: string[] = [];
        await Promise.all(
            testcases.map(async (testcase, index) => {
                const inputUrl = await getObjectURL(testcase.inputPath);
                const outputUrl = await getObjectURL(testcase.expOutputPath);

                input_urls.push(inputUrl);
                output_urls.push(outputUrl);
            })
        );

        res.status(200).json({
            success: true,
            testcasesURls: {input_urls, output_urls}
        })
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

const handleGetSubmissions = async (req: Request, res: Response) => {
    try{
        const userId = "123";
        const problemId = req.params.id;

        const submissions = await prisma.submission.findMany({
            where:{
                userId,
                problemId
            }
        })

        res.status(200).json({
            success: true,
            submissions
        })
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

export { handleSubmitProblem, handleRunProblem, handleCreateProblem, handleGetAllProblem, handleGetProblemById, handleGetAllExampleTestcases, handleGetSubmissions, handleGetFilterProblems };