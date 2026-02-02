-- DropForeignKey
ALTER TABLE "public"."submissions" DROP CONSTRAINT "submissions_contestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."submissions" DROP CONSTRAINT "submissions_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."submissions" DROP CONSTRAINT "submissions_userId_fkey";

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "MCQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;
