/*
  Warnings:

  - Made the column `evaluatedTestcases` on table `Submission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "status" SET DEFAULT 'Pending',
ALTER COLUMN "evaluatedTestcases" SET NOT NULL,
ALTER COLUMN "evaluatedTestcases" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "SubmittedTestcase" ALTER COLUMN "status" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Testcase" ALTER COLUMN "isExample" SET DEFAULT false;
