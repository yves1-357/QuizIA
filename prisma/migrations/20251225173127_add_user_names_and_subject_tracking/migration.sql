-- AlterTable
ALTER TABLE "ExerciseHistory" ADD COLUMN     "userName" TEXT;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "userId" TEXT,
ADD COLUMN     "userName" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentSubject" TEXT;

-- AlterTable
ALTER TABLE "UserTopicProgress" ADD COLUMN     "subjectName" TEXT,
ADD COLUMN     "userName" TEXT;

-- CreateIndex
CREATE INDEX "ExerciseHistory_userName_idx" ON "ExerciseHistory"("userName");

-- CreateIndex
CREATE INDEX "Topic_userId_idx" ON "Topic"("userId");

-- CreateIndex
CREATE INDEX "UserTopicProgress_subjectName_idx" ON "UserTopicProgress"("subjectName");
