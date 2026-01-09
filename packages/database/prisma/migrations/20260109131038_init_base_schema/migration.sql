-- CreateEnum
CREATE TYPE "Role" AS ENUM ('User', 'Admin');

-- CreateEnum
CREATE TYPE "ContestType" AS ENUM ('DEV', 'DSA');

-- CreateEnum
CREATE TYPE "ContestStatus" AS ENUM ('UPCOMING', 'LIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "MCQs" AS ENUM ('A', 'B', 'C', 'D');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'User',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contests" (
    "id" TEXT NOT NULL,
    "srNo" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "discription" TEXT NOT NULL,
    "type" "ContestType" NOT NULL,
    "status" "ContestStatus" NOT NULL,
    "createdBy" TEXT NOT NULL,
    "StartDate" TIMESTAMP(3),
    "StartTime" TIMESTAMP(3),

    CONSTRAINT "Contests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MCQ" (
    "id" TEXT NOT NULL,
    "srNo" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "Solution" "MCQs" NOT NULL,
    "contestTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3),
    "points" INTEGER NOT NULL,
    "avgTTinMins" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "MCQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Code" (
    "id" TEXT NOT NULL,
    "srNo" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "Solution" TEXT NOT NULL,
    "contestTitile" TEXT NOT NULL,
    "avgTTinMins" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderBoard" (
    "id" TEXT NOT NULL,
    "contestTitle" TEXT NOT NULL,

    CONSTRAINT "LeaderBoard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "Rank" TEXT NOT NULL,
    "leaderboardId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Contests_id_key" ON "Contests"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Contests_title_key" ON "Contests"("title");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderBoard_id_key" ON "LeaderBoard"("id");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderBoard_contestTitle_key" ON "LeaderBoard"("contestTitle");

-- CreateIndex
CREATE UNIQUE INDEX "Score_id_key" ON "Score"("id");

-- AddForeignKey
ALTER TABLE "Contests" ADD CONSTRAINT "Contests_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MCQ" ADD CONSTRAINT "MCQ_contestTitle_fkey" FOREIGN KEY ("contestTitle") REFERENCES "Contests"("title") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_contestTitile_fkey" FOREIGN KEY ("contestTitile") REFERENCES "Contests"("title") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderBoard" ADD CONSTRAINT "LeaderBoard_contestTitle_fkey" FOREIGN KEY ("contestTitle") REFERENCES "Contests"("title") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "LeaderBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
