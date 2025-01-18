import {Queue} from 'bullmq'

const redisOptions = { host: "localhost", port: 6379 };
//contest start queue
export const contestStartQueue = new Queue('contestStart', {
    connection: redisOptions,
    defaultJobOptions:{
        removeOnComplete: true
    }
})

export const addContestStartJob = async (contestId: string, startTime: Date) =>{
    console.log(startTime.getTime() - Date.now());
    await contestStartQueue.add(
        'startContest',
        {contestId},
        {delay: startTime.getTime() - Date.now()}
    )
}

//contest end queue
export const contestEndQueue = new Queue('contestEnd', {
    connection: redisOptions,
    defaultJobOptions:{
        removeOnComplete: true
    }
})

export const addContestEndJob = async (contestID: string, endTime: Date) =>{
    await contestEndQueue.add(
        'endContest',
        {contestID},
        {delay: endTime.getTime() - Date.now()}
    )
}




