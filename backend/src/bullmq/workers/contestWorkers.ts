import {Worker} from 'bullmq'

const redisOptions = { host: "localhost", port: 6379 };

//contest start worker
const contestStartWorker= new Worker(
    'contestStart',
    async (job) => {
        const {contestId} = job.data;
        console.log(`Starting Contest: ${contestId}`);

        //start the contest and change its status to Ongoing
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

