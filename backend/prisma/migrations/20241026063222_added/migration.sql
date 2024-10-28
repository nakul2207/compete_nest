/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Language` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Language` table. All the data in the column will be lost.
  - You are about to drop the column `contest_id` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `owner_code` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `UserCode` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `evaluated_testcase` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `total_testcases` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `submission_id` on the `Submitted_testcase` table. All the data in the column will be lost.
  - You are about to drop the column `testcase_id` on the `Submitted_testcase` table. All the data in the column will be lost.
  - The `status` column on the `Submitted_testcase` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `exp_output_path` on the `Testcase` table. All the data in the column will be lost.
  - You are about to drop the column `input_path` on the `Testcase` table. All the data in the column will be lost.
  - You are about to drop the column `problem_id` on the `Testcase` table. All the data in the column will be lost.
  - You are about to drop the `DefaultCode` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `DefaultCode` to the `Language` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerCode` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalTestcases` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userCode` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Made the column `updatedAt` on table `Submission` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `submissionId` to the `Submitted_testcase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testcaseId` to the `Submitted_testcase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expOutputPath` to the `Testcase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inputPath` to the `Testcase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `problemId` to the `Testcase` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "DefaultCode" DROP CONSTRAINT "DefaultCode_languageId_fkey";

-- DropForeignKey
ALTER TABLE "DefaultCode" DROP CONSTRAINT "DefaultCode_problemId_fkey";

-- DropForeignKey
ALTER TABLE "Submitted_testcase" DROP CONSTRAINT "Submitted_testcase_submission_id_fkey";

-- DropForeignKey
ALTER TABLE "Submitted_testcase" DROP CONSTRAINT "Submitted_testcase_testcase_id_fkey";

-- AlterTable
ALTER TABLE "Language" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "DefaultCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "contest_id",
DROP COLUMN "owner_code",
ADD COLUMN     "companies" TEXT[],
ADD COLUMN     "contestId" TEXT,
ADD COLUMN     "ownerCode" TEXT NOT NULL,
ADD COLUMN     "topics" TEXT[];

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "UserCode",
DROP COLUMN "evaluated_testcase",
DROP COLUMN "total_testcases",
ADD COLUMN     "evaluatedTestcases" INTEGER DEFAULT 0,
ADD COLUMN     "totalTestcases" INTEGER NOT NULL,
ADD COLUMN     "userCode" TEXT NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "ce" DROP NOT NULL,
ALTER COLUMN "ce" SET DEFAULT 0,
ALTER COLUMN "re" DROP NOT NULL,
ALTER COLUMN "re" SET DEFAULT 0,
ALTER COLUMN "tle" DROP NOT NULL,
ALTER COLUMN "tle" SET DEFAULT 0,
ALTER COLUMN "mle" DROP NOT NULL,
ALTER COLUMN "mle" SET DEFAULT 0,
ALTER COLUMN "ac" DROP NOT NULL,
ALTER COLUMN "ac" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Submitted_testcase" DROP COLUMN "submission_id",
DROP COLUMN "testcase_id",
ADD COLUMN     "submissionId" TEXT NOT NULL,
ADD COLUMN     "testcaseId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "SubmissionResult" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "time" DROP NOT NULL,
ALTER COLUMN "memory" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Testcase" DROP COLUMN "exp_output_path",
DROP COLUMN "input_path",
DROP COLUMN "problem_id",
ADD COLUMN     "expOutputPath" TEXT NOT NULL,
ADD COLUMN     "inputPath" TEXT NOT NULL,
ADD COLUMN     "isExample" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "problemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "DefaultCode";

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submitted_testcase" ADD CONSTRAINT "Submitted_testcase_testcaseId_fkey" FOREIGN KEY ("testcaseId") REFERENCES "Testcase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submitted_testcase" ADD CONSTRAINT "Submitted_testcase_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
