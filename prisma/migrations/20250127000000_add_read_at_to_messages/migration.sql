-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ChatMessage_readAt_idx" ON "ChatMessage"("readAt"); 