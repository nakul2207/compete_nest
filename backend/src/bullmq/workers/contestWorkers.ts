import {Worker} from 'bullmq'
import {PrismaClient} from "@prisma/client";
// import {handleStartContest, handleEndContest} from "../../controllers/contest"

const redisOptions = { host: "localhost", port: 6379 };

const prisma = new PrismaClient();

const handleStartContest = async (contestId: string) => {
    try {
        // Update the contest's status to Ongoing
        await prisma.contest.update({
            where: {
                id: contestId, // Use contestId to identify the contest
            },
            data: {
                status: "Ongoing", // Update status to Ongoing
            },
        });
    } catch (error) {
        console.error("Error starting contest:", error);
    }
};

const handleEndContest = async (contestId: string) => {
    try {
        // Update the contest's status to Ongoing
        await prisma.contest.update({
            where: {
                id: contestId, // Use contestId to identify the contest
            },
            data: {
                status: "Ended", // Update status to Ended
            },
        });
    } catch (error) {
        console.error("Error ending contest:", error);
    }
};

//contest start worker
const contestStartWorker= new Worker(
    'contestStart',
    async (job) => {
        const {contestId} = job.data;
        console.log(`Starting Contest: ${contestId}`);

        //start the contest and change its status to Ongoing
        await handleStartContest(contestId);
    },
    {
        connection: redisOptions
    }
)

contestStartWorker.on("completed", (job) => {
    console.log(`${job.id} has completed!`);
});

contestStartWorker.on('failed', (job, err) => {
    console.error(`Job failed: ${job}`, err);
})

contestStartWorker.on('error', (err) => {
    console.error('Worker error:', err);
});


//contest end worker
const contestEndWorker = new Worker(
    'contestEnd',
    async (job) => {
        const { contestId } = job.data;
        console.log(`Ending Contest: ${contestId}`);

        //end the contest and change its status to Ended
        await handleEndContest(contestId);
    },
    {
        connection: redisOptions
    }
)

contestEndWorker.on("completed", (job) => {
    console.log(`${job.id} has completed!`);
});

contestEndWorker.on('failed', (job, err) =>{
    console.error(`Job failed: ${job}`, err);
})

contestEndWorker.on('error', (err) => {
    console.error('Worker error:', err);
});

console.log("Worker started");

export { contestStartWorker, contestEndWorker}

