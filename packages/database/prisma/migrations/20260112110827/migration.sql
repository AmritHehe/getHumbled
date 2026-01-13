/*
  Warnings:

  - You are about to drop the column `contestTitile` on the `Code` table. All the data in the column will be lost.
  - You are about to drop the column `contestTitle` on the `LeaderBoard` table. All the data in the column will be lost.
  - You are about to drop the column `contestTitle` on the `MCQ` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contestId]` on the table `LeaderBoard` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contestId` to the `Code` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contestId` to the `LeaderBoard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contestId` to the `MCQ` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Code" DROP CONSTRAINT "Code_contestTitile_fkey";

-- DropForeignKey
ALTER TABLE "public"."LeaderBoard" DROP CONSTRAINT "LeaderBoard_contestTitle_fkey";

-- DropForeignKey
ALTER TABLE "public"."MCQ" DROP CONSTRAINT "MCQ_contestTitle_fkey";

-- DropIndex
DROP INDEX "public"."LeaderBoard_contestTitle_key";

-- AlterTable
ALTER TABLE "Code" DROP COLUMN "contestTitile",
ADD COLUMN     "contestId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LeaderBoard" DROP COLUMN "contestTitle",
ADD COLUMN     "contestId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MCQ" DROP COLUMN "contestTitle",
ADD COLUMN     "contestId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LeaderBoard_contestId_key" ON "LeaderBoard"("contestId");

-- AddForeignKey
ALTER TABLE "MCQ" ADD CONSTRAINT "MCQ_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderBoard" ADD CONSTRAINT "LeaderBoard_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
