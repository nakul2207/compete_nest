/*
  Warnings:

  - You are about to drop the column `AcceptedTestcases` on the `Submission` table. All the data in the column will be lost.
  - The `status` column on the `Submission` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "AcceptedTestcases",
ADD COLUMN     "acceptedTestcases" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 2;

-- DropEnum
DROP TYPE "SubmissionStatus";
