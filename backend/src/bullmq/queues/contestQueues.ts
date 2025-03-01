import { Queue } from "bullmq";

// const redisOptions = { host: "localhost", port: 6379 };
//contest start queue
export const contestStartQueue = new Queue("contestStart", {
  connection: { url: process.env.REDIS_URL },
  defaultJobOptions: {
    removeOnComplete: true,
  },
});

export const addContestStartJob = async (
  contestId: string,
  startTime: Date
) => {
  // console.log(startTime.getTime() - Date.now());
  await contestStartQueue.add(
    "startContest",
    { contestId },
    { delay: startTime.getTime() - Date.now() }
  );
};

//contest end queue
export const contestEndQueue = new Queue("contestEnd", {
  connection: { url: process.env.REDIS_URL },
  defaultJobOptions: {
    removeOnComplete: true,
  },
});

export const addContestEndJob = async (contestId: string, endTime: Date) => {
  await contestEndQueue.add(
    "endContest",
    { contestId },
    { delay: endTime.getTime() - Date.now() }
  );
};
