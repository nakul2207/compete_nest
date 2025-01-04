/*
  Warnings:

  - Added the required column `inputFormat` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outputFormat` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerCodeLanguage` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContestStatus" AS ENUM ('Upcoming', 'Ongoing', 'Ended');

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "inputFormat" TEXT NOT NULL,
ADD COLUMN     "outputFormat" TEXT NOT NULL,
ADD COLUMN     "ownerCodeLanguage" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "AcceptedTestcases" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "memory" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "time" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SubmittedTestcase" ALTER COLUMN "time" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "memory" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'User';

-- CreateTable
CREATE TABLE "Contest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ContestStatus" NOT NULL DEFAULT 'Upcoming',
    "problems" TEXT[],
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestProblem" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContestProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestParticipants" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContestParticipants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestProblem" ADD CONSTRAINT "ContestProblem_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestProblem" ADD CONSTRAINT "ContestProblem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestParticipants" ADD CONSTRAINT "ContestParticipants_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestParticipants" ADD CONSTRAINT "ContestParticipants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
