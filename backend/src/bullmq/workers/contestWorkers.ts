import { Worker, Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import nodemailer from 'nodemailer';
// const redisOptions = { host: "localhost", port: 6379 };

const prisma = new PrismaClient();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
    // Update the contest's status to Ended
    const contest = await prisma.contest.update({
      where: {
        id: contestId,
      },
      data: {
        status: "Ended",
      },
      select: {
        problems: true,
      },
    });

    //update the problems table to remove the contestId
    contest.problems.forEach(async (problemId) => {
      await prisma.problem.update({
        where: { id: problemId },
        data: { contestId: null },
      });
    });
  } catch (error) {
    console.error("Error ending contest:", error);
  }
};

const sendContestEmailNotification = async(contestId: string) => {  
  try {
    //find the contest 
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      select: {
        title: true,
        startTime: true,
        endTime: true,
      },
    })

    if (!contest) {
      console.error(`Contest with ID ${contestId} not found.`);
      return;
    }

    //find all the users registered for the contest
    const participants = await prisma.contestParticipants.findMany({
      where: {
        contestId: contestId,
      },
      include: {
        user: true, // Include the user data in the result
      },
    })

    // Sending email to the registered users
    await Promise.all(participants.map(async (participant) => {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: participant.user.email,
        subject: `🚀 Reminder: ${contest.title} Contest Starts Soon!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #4CAF50; text-align: center;">📢 Contest Notification</h2>
            <p>Dear Participant,</p>
            <p>We are excited to remind you that the <strong>${contest.title}</strong> is starting soon!</p>
            
            <h3>📝 Contest Details:</h3>
            <ul>
              <li><strong>Contest Name:</strong> ${contest.title}</li>
              <li><strong>Start Time:</strong> ${new Date(contest.startTime).toLocaleString()}</li>
              <li><strong>End Time:</strong> ${new Date(contest.endTime).toLocaleString()}</li>
              <li><strong>Platform:</strong> CompeteNest</li>
            </ul>

            <p>Make sure you're ready with your setup and login before the contest begins. Stay sharp and give it your best shot! 🎯</p>
            
            <p style="text-align: center; margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL}/contests" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Contest</a>
            </p>

            <p>Best of luck! 🚀</p>
            <p>Regards,</p>
            <p><strong>The CompeteNest Team</strong></p>
          </div>
        `,
      });
    }));

    console.log(`Contest email notifications sent successfully for ${contest.title}`);
  } catch (error) {
    console.error("Error scheduling contest email notification:", error);
  }
}

//contest start worker
const contestStartWorker = new Worker(
  "contestStart",
  async (job: Job) => {
    const { contestId } = job.data;
    console.log(`Starting Contest: ${contestId}`);

    //start the contest and change its status to Ongoing
    await handleStartContest(contestId);
  },
  {
    connection: { url: process.env.REDIS_URL },
  }
);

contestStartWorker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

contestStartWorker.on("failed", (job, err) => {
  console.error(`Job failed: ${job}`, err);
});

contestStartWorker.on("error", (err) => {
  console.error("Worker error:", err);
});

//contest end worker
const contestEndWorker = new Worker(
  "contestEnd",
  async (job: Job) => {
    const { contestId } = job.data;
    console.log(`Ending Contest: ${contestId}`);

    //end the contest and change its status to Ended
    await handleEndContest(contestId);
  },
  {
    connection: { url: process.env.REDIS_URL },
  }
);

contestEndWorker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

contestEndWorker.on("failed", (job, err) => {
  console.error(`Job failed: ${job}`, err);
});

contestEndWorker.on("error", (err) => {
  console.error("Worker error:", err);
});


// contest email notification worker
const emailWorker = new Worker(
  "emailQueue",
  async (job: Job) => {
    const {name, data} = job;

    switch(name){
      case "contestSendNotification":
        await sendContestEmailNotification(data.contestId);
        break;

      // Add more cases for other email types in the future
      default:
        console.warn(`Unknown jobType: ${name}`);
    }
  },
  {
    connection: { url: process.env.REDIS_URL },
  }
)

emailWorker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Job failed: ${job}`, err);
});

emailWorker.on("error", (err) => {
  console.error("Worker error:", err);
});

console.log("Worker started");

export { contestStartWorker, contestEndWorker };
