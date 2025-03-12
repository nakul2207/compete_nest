import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";
import { formatDistanceToNow } from 'date-fns';
import { s3client } from './problem';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const prisma = new PrismaClient();


export const getProfile = async (req: Request, res: Response) => {
    try {
        const username = req.params.username;

        const user = await prisma.user.findUnique({
            where: { username: username }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const [submissions, contestsdata, problemsSolved, problems] = await Promise.all([
            prisma.submission.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'asc' },
                select: {
                    problem: { select: { title: true } },
                    totalTestcases: true,
                    acceptedTestcases: true,
                    createdAt: true
                }
            }),
            prisma.contestParticipants.findMany({
                where: { userId: user.id },
                select: {
                    contestId: true,
                    contest: { select: {
                        title: true, 
                        startTime: true,
                    } },
                    rank: true,
                }
            }),
            prisma.user.findUnique({
                where: { id: user.id },
                select: { problemsSolved: true }
            }),
            prisma.problem.findMany({
                select: { difficulty: true }
            })
        ]);

        const totalProblems = problems.reduce((acc, problem) => {
            acc[problem.difficulty]++;
            return acc;
        }, { Easy: 0, Medium: 0, Hard: 0 });

        const contests = {
            participated: contestsdata.length,
            won: contestsdata.filter(contest => contest.rank === 1).length
        };

        let activeDays = 1;

        if(submissions.length > 0){
            const firstSubmissionDate = submissions[0]?.createdAt;
            const lastSubmissionDate = submissions[submissions.length - 1]?.createdAt;
            activeDays = firstSubmissionDate && lastSubmissionDate ? Math.ceil((lastSubmissionDate.getTime() - firstSubmissionDate.getTime()) / (1000 * 60 * 60 * 24)) : 1;
        }



        const recentActivityMap = new Map<string, any>();

        if(submissions.length > 0){
            submissions.forEach(submission => {
                const key = `submission-${submission.problem.title}`;
                if (!recentActivityMap.has(key) || recentActivityMap.get(key).date < submission.createdAt) {
                    recentActivityMap.set(key, {
                        date: submission.createdAt,
                        action: submission.totalTestcases === submission.acceptedTestcases ? 'Solved' : 'Attempted',
                        problem: submission.problem.title,
                        result: submission.totalTestcases === submission.acceptedTestcases ? 'solved' : 'attempted'
                    });
                }
            });
        }

        if(contestsdata.length > 0){
            contestsdata.forEach(contest => {
                const key = `contest-${contest.contest.title}`;
                if (!recentActivityMap.has(key) || recentActivityMap.get(key).date < contest.contest.startTime) {
                    recentActivityMap.set(key, {
                        date: contest.contest.startTime,
                        action: 'Participated in',
                        problem: contest.contest.title,
                        result: 'contest'
                    });
                }
            });
        }

        const recentActivity = Array.from(recentActivityMap.values())
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 7)
            .map(activity => ({
                ...activity,
                date: formatDistanceToNow(new Date(activity.date), { addSuffix: true })
        }));

        const profileData = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                linkedin: user.linkedin,
                github: user.github,
                extraURL: user.extraURL,
                joinDate: user.createdAt.toDateString()
            },
            stats: {
                activeDays,
                contests,
                skills: user.skills,
                totalProblems,
                solved: problemsSolved?.problemsSolved || [],
                recentActivity
            }
        };

        res.status(200).json(profileData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getSolvedProblems = async (req: Request, res: Response) => {
    try{

        const username = req.params.username;
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = 3;
        const skip = (page - 1) * pageSize;

        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userId = user.id;

        const [submissions, totalSolvedProblems] = await Promise.all([
            prisma.submission.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            distinct: ['problemId'],
            skip,
            take: pageSize,
            select: {
                problem: { select: { title: true, difficulty: true, topics: true } },
                totalTestcases: true,
                acceptedTestcases: true,
                createdAt: true
            }
            }),
            prisma.submission.findMany({
                where: { userId }
            })
        ]);
        const uniqueProblemIds = new Set(totalSolvedProblems.filter(submission => submission.totalTestcases === submission.acceptedTestcases).map(submission => submission.problemId));
        const total = uniqueProblemIds.size;


        const latestSubmissions = submissions.filter(submission => submission.totalTestcases === submission.acceptedTestcases);
        const solvedProblems = latestSubmissions.map(submission => ({
            name: submission.problem.title,
            type: submission.problem.difficulty,
            category: submission.problem.topics ,
            dateSolved: formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })
        }));

        res.status(200).json({solvedProblems, total});
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const getContestParticipated = async (req: Request, res: Response) => {
    try{
        const username =  req.params.username;
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = 3;
        const skip = (page - 1) * pageSize;

        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        });
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const userId = user.id;
        const [contests,totalcontests] = await Promise.all([
            prisma.contestParticipants.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
            select: {
                contest: {
                    select: {
                        title: true,
                        startTime: true,
                    }
                },
                rank: true,
                score: true
            }
            }),
            prisma.contestParticipants.count({
                where: { userId }
            })
        ]);
        const contestData = contests.map(contest => ({
            name: contest.contest.title,    
            date: formatDistanceToNow(new Date(contest.contest.startTime), { addSuffix: true }),
            rank: contest.rank,
            score: contest.score
        }));           

        res.status(200).json({contestData,totalcontests});

    }catch(error){
        console.error(error);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const getUser = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id as string;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
export async function putObjectURL(key: string,contentType: string) {
  const command = new PutObjectCommand({
    Bucket: "compete-nest",
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3client, command, { expiresIn: 3600 });
}


export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id as string;
        const { name,imagechange,contentType,linkedin,github ,extraURL, skills, bio } = req.body;
        let updatedUser;
        let url;
    
        if (imagechange) {
            const path = `profileimages/${userId}`;
            url = await putObjectURL(path,contentType);
            const avatar = `https://compete-nest.s3.ap-south-1.amazonaws.com/profileimages/${userId}`;
    
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { name,linkedin,github , extraURL, skills, avatar, bio }
            });
        } else {
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { name, linkedin,github ,extraURL, skills, bio }
            });
        }
    
        res.status(200).json(imagechange ? { url, updatedUser } : updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}