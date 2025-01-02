/*
  Warnings:

  - Added the required column `name` to the `QueryTable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QueryTable" ADD COLUMN     "name" TEXT NOT NULL;
