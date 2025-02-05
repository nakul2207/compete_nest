import { Response, Request } from "express";
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
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

interface Topic{
    id: string;
    name: string;
}

interface Company{
    id: string;
    name: string;
}

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
    topics: Topic[];
    companies: Company[];
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

async function deleteObjectS3(key:string){
    const command = new DeleteObjectCommand({
        Bucket: 'compete-nest',
        Key : key
    });
    await s3client.send(command);
}

async function deleteDirectoryS3(prefix: string) {
    const bucketName = 'compete-nest';

    // Step 1: List all objects under the prefix
    const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
    });

    const listedObjects = await s3client.send(listCommand);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        console.log(`No objects found under the prefix: ${prefix}`);
        return;
    }

    // Step 2: Create delete parameters for all the listed objects
    const deleteParams = {
        Bucket: bucketName,
        Delete: {
            Objects: listedObjects.Contents.map((object) => ({
                Key: object.Key!,
            })),
        },
    };

    // Step 3: Delete the objects
    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    await s3client.send(deleteCommand);

    console.log(`Deleted all objects under the prefix: ${prefix}`);

    // Optional: Recursively handle paginated results
    if (listedObjects.IsTruncated) {
        await deleteDirectoryS3(prefix); // Call recursively to handle more objects
    }
}

const handleSubmitProblem = async (req:Request, res:Response) => {
    try {
        const { code, language_id } = req.body;
        const problem_id: string = req.params.id;
        const user_id: string = req.user.id;

        const problem = await prisma.problem.findUnique({
            where: {
                id: problem_id
            }
        });

        if(problem?.contestId){
            const contest = await prisma.contest.findUnique({
                where: {
                    id: problem.contestId
                },
                select: {
                    startTime: true,
                    endTime: true
                }
            });

            if(contest?.startTime && contest.startTime > new Date()){
                return res.status(400).json({error: "Contest has not started yet"});
            }
        }
        
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

                const sub_testcase_id = await prisma.submittedTestcase.create({
                    data: {
                        testcaseId: id,
                        submissionId: sub_id.id,
                    },
                    select: {
                        id: true // Only select the ID to return
                    }
                })

                let callback_url = `/api/submission/${sub_id.id}/submitted_testcase/${sub_testcase_id.id}`;

                if(problem?.contestId){
                    callback_url = `/api/submission/${sub_id.id}/contest/${problem.contestId}/submitted_testcase/${sub_testcase_id.id}`;
                }

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
    const userId = req.user.id;
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
                topics: topics.map(topic => JSON.stringify(topic)),
                companies: companies.map(company => JSON.stringify(company)),
            },
            select: {
                id: true
            }
        });

        //creating records in the query table using the problem_id, title, topics and company ids
        for (const topic of topics) {
            for (const company of companies) {
                await prisma.queryTable.create({
                    data: {
                        problemId: problemId.id,
                        topicId: topic.id,
                        companyId: company.id,
                        difficulty,
                        title,
                    },
                });
            }
        }

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

const handleAdminGetAllProblem =  async (req: Request, res:Response) => {
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
        // const totalPages = Math.ceil(problems.length / limit);
        res.status(200).json({
            problems,
            // totalPages
        });
    }catch (error) {
        console.error('Error saving problem:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

const handleAdminGetFilterProblems = async (req: Request, res: Response) => {
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

        // if (
        //     !searchTerm &&
        //     !difficulty &&
        //     !topic &&
        //     !company
        // ) {
        //     return res.status(200).json({
        //         problems: [],
        //         totalPages: 0,
        //         currentPage: pageNum,
        //     });
        // }

        // Fetch filtered problems with pagination
        const problems = await prisma.queryTable.findMany({
            where: filter,
            skip: offset,
            take: limit,
            distinct: ['problemId'],
        });

        // const totalPages = Math.ceil(problems.length / limit);

        res.status(200).json({
            problems,
            // totalPages,
            currentPage: pageNum,
        });
    } catch (error) {
        console.error("Error fetching problems:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const handleGetAllProblem =  async (req: Request, res:Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    //only show the problems that are not in the contest        
    try{
        
        const problems = await prisma.queryTable.findMany({
            skip,
            take: limit,
            distinct: ['problemId'],
        });

        //filter out the problems from problems table and only return the problems that are not in the contest using map
        //extract all teh problems which has contestId set and store in a set
        const contestProblems = await prisma.problem.findMany({
            where:{
                contestId: {
                    not: null
                }
            },
            select: {
                id: true
            }
        })

        const contestProblemsSet = new Set(contestProblems.map(problem => problem.id));

        //filter out the problems from problems table and only return the problems that are not in the contest using map
        const filteredProblems = problems.filter(problem => !contestProblemsSet.has(problem.problemId));

        // console.log(problems);
        // const totalPages = Math.ceil(problems.length / limit);
        res.status(200).json({
            problems: filteredProblems,
            // totalPages
        });
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

        // if (
        //     !searchTerm &&
        //     !difficulty &&
        //     !topic &&
        //     !company
        // ) {
        //     return res.status(200).json({
        //         problems: [],
        //         totalPages: 0,
        //         currentPage: pageNum,
        //     });
        // }

        // Fetch filtered problems with pagination
        const problems = await prisma.queryTable.findMany({
            where: filter,
            skip: offset,
            take: limit,
            distinct: ['problemId'],
        });

        //filter out the problems from problems table and only return the problems that are not in the contest using map
        //extract all teh problems which has contestId set and store in a set
        const contestProblems = await prisma.problem.findMany({
            where:{
                contestId: {
                    not: null
                }
            },
            select: {
                id: true
            }
        })

        const contestProblemsSet = new Set(contestProblems.map(problem => problem.id));

        //filter out the problems from problems table and only return the problems that are not in the contest using map
        const filteredProblems = problems.filter(problem => !contestProblemsSet.has(problem.problemId));

        // const totalPages = Math.ceil(problems.length / limit);

        res.status(200).json({
            problems,
            // totalPages,
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

        return res.status(200).json({ problem });
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
        const userId = req.user.id;
        console.log(userId);
        const problemId = req.params.id;
        
        const problem = await prisma.problem.findUnique({
            where: {
                id: problemId
            },
            select: {
                contestId: true
            }
        })


        //fetch all the submissions in the descending order of createdAt
        let submissions = await prisma.submission.findMany({
            where:{
                userId,
                problemId,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        if(problem?.contestId){
            const contest = await prisma.contest.findUnique({
                where: {
                    id: problem.contestId
                },
                select: {
                    startTime: true,
                }
            })

            submissions = submissions.filter(submission => {
                if(contest?.startTime && contest.startTime <= submission.createdAt){
                    return submission;
                }
            })
        }

        res.status(200).json({
            success: true,
            submissions
        })
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

const handleEditProblem = async (req: Request, res: Response) => {
    const {
        problemId, // Retrieve problem ID from the request body
        description,
        inputFormat,
        outputFormat,
        constraints,
        ownerCode,
        ownerCodeLanguage,
        testCases = []
    } = req.body;

    try {
        if (!problemId) {
            return res.status(400).json({ error: "Problem ID is required." });
        }

        // Update the problem in the database
        await prisma.problem.update({
            where: { id: problemId },
            data: {
                description,
                inputFormat,
                outputFormat,
                constraints,
                ownerCode,
                ownerCodeLanguage: parseInt(ownerCodeLanguage),
            },
        });

        // Get the current count of test cases for this problem
        const currentTestCaseCount = await prisma.testcase.count({
            where: { problemId },
        });

        let testcasesURLs = [];
        if (testCases.length > 0) {
            // Create records in testcases table & generate pre-signed URLs
            testcasesURLs = await Promise.all(
                testCases.map(async (isExample:boolean, index: number) => {
                    const currentIndex = currentTestCaseCount + index; // Start index from the current count
                    const inputKey = `Problems/${problemId}/input/input_${currentIndex}.txt`;
                    const outputKey = `Problems/${problemId}/output/output_${currentIndex}.txt`;

                    const inputUrl = await putObjectURL(inputKey);
                    const outputUrl = await putObjectURL(outputKey);

                    // Create a record in the testcase table
                    await prisma.testcase.create({
                        data: {
                            problemId,
                            inputPath: inputKey,
                            expOutputPath: outputKey,
                            isExample
                        },
                    });

                    return {
                        inputUrl,
                        outputUrl,
                    };
                })
            );
        }

        // Respond with the updated data
        res.status(200).json({ id: problemId, testcasesURLs });
    } catch (error) {
        console.error("Error updating problem:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const handleDeleteProblem = async (req: Request, res: Response) => {
    try {
        // Extract problemId from the request
        const problemId = req.params.id;
        console.log("Deleting problem with ID:", problemId);

        // Check if the problem exists
        const problemExists = await prisma.problem.findUnique({
            where: { id: problemId },
        });

        if (!problemExists) {
            return res.status(404).json({ error: 'Problem not found.' });
        }

        // Find all testcases associated with the problemId
        const testcases = await prisma.testcase.findMany({
            where: { problemId },
        });

        const testcaseIds = testcases.map(testcase => testcase.id);

        // Delete records from SubmittedTestcase table based on the testcase IDs
        if (testcaseIds.length > 0) {
            await prisma.submittedTestcase.deleteMany({
                where: {
                    testcaseId: { in: testcaseIds },
                },
            });
        }

        // Delete records from the QueryTable
        await prisma.queryTable.deleteMany({
            where: { problemId },
        });

        // Delete records from the Testcase table
        await prisma.testcase.deleteMany({
            where: { problemId },
        });

        // Delete records from the Submission table
        await prisma.submission.deleteMany({
            where: { problemId },
        });

        // Delete the problem itself
        await prisma.problem.delete({
            where: { id: problemId },
        });

        // Delete resources from S3
        const key = `Problems/${problemId}/`;
        await deleteDirectoryS3(key);

        res.status(200).json({
            message: "Problem deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting problem:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export { handleSubmitProblem, handleRunProblem, handleCreateProblem, handleEditProblem, handleDeleteProblem, handleGetAllProblem, handleGetProblemById, handleGetAllExampleTestcases, handleGetSubmissions, handleGetFilterProblems, handleAdminGetAllProblem, handleAdminGetFilterProblems };