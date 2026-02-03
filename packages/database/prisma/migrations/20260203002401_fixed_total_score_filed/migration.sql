/*
  Warnings:

  - Changed the type of `TotalScore` on the `Score` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Score" DROP COLUMN "TotalScore",
ADD COLUMN     "TotalScore" INTEGER NOT NULL;
