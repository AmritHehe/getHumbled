-- CreateEnum
CREATE TYPE "Mode" AS ENUM ('real', 'practice');

-- AlterTable
ALTER TABLE "Contests" ADD COLUMN     "mode" "Mode" NOT NULL DEFAULT 'real';
