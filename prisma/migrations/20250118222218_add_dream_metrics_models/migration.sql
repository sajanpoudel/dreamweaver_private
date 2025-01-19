/*
  Warnings:

  - Changed the type of `content` on the `dreams` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "dreams" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;

-- CreateIndex
CREATE INDEX "dreams_userId_idx" ON "dreams"("userId");
