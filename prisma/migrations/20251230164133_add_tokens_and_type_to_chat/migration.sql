-- AlterTable
ALTER TABLE "ChatConversation" ADD COLUMN     "tokensIn" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tokensOut" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'chat',
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "messages" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ChatConversation_type_idx" ON "ChatConversation"("type");
