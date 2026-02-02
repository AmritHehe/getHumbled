/*
  Warnings:

  - A unique constraint covering the columns `[user,leaderboardId]` on the table `Score` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Score_user_leaderboardId_key" ON "Score"("user", "leaderboardId");
