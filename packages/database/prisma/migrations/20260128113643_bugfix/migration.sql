/*
  Warnings:

  - A unique constraint covering the columns `[userId,contestId,questionId]` on the table `submissions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Score" ADD CONSTRAINT "Score_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_userId_contestId_questionId_key" ON "submissions"("userId", "contestId", "questionId");
