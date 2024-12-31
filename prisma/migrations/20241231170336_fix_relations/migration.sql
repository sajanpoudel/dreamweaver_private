/*
  Warnings:

  - You are about to drop the column `analysis` on the `Dream` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `Dream` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Emotion` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Emotion` table. All the data in the column will be lost.
  - You are about to drop the column `intensity` on the `Emotion` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Emotion` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Symbol` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Symbol` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Symbol` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `DashboardStats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DreamConnection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DreamPattern` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserInsight` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DreamPatternToEmotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DreamPatternToSymbol` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DreamPatternToTheme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DreamPatternToUserInsight` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DreamToDreamPattern` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dream_stories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `story_symbols` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `story_themes` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `title` on table `Dream` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "DreamConnection" DROP CONSTRAINT "DreamConnection_dreamId_fkey";

-- DropForeignKey
ALTER TABLE "DreamConnection" DROP CONSTRAINT "DreamConnection_relatedId_fkey";

-- DropForeignKey
ALTER TABLE "DreamPattern" DROP CONSTRAINT "DreamPattern_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserInsight" DROP CONSTRAINT "UserInsight_userId_fkey";

-- DropForeignKey
ALTER TABLE "_DreamPatternToEmotion" DROP CONSTRAINT "_DreamPatternToEmotion_A_fkey";

-- DropForeignKey
ALTER TABLE "_DreamPatternToEmotion" DROP CONSTRAINT "_DreamPatternToEmotion_B_fkey";

-- DropForeignKey
ALTER TABLE "_DreamPatternToSymbol" DROP CONSTRAINT "_DreamPatternToSymbol_A_fkey";

-- DropForeignKey
ALTER TABLE "_DreamPatternToSymbol" DROP CONSTRAINT "_DreamPatternToSymbol_B_fkey";

-- DropForeignKey
ALTER TABLE "_DreamPatternToTheme" DROP CONSTRAINT "_DreamPatternToTheme_A_fkey";

-- DropForeignKey
ALTER TABLE "_DreamPatternToTheme" DROP CONSTRAINT "_DreamPatternToTheme_B_fkey";

-- DropForeignKey
ALTER TABLE "_DreamPatternToUserInsight" DROP CONSTRAINT "_DreamPatternToUserInsight_A_fkey";

-- DropForeignKey
ALTER TABLE "_DreamPatternToUserInsight" DROP CONSTRAINT "_DreamPatternToUserInsight_B_fkey";

-- DropForeignKey
ALTER TABLE "_DreamToDreamPattern" DROP CONSTRAINT "_DreamToDreamPattern_A_fkey";

-- DropForeignKey
ALTER TABLE "_DreamToDreamPattern" DROP CONSTRAINT "_DreamToDreamPattern_B_fkey";

-- DropForeignKey
ALTER TABLE "dream_stories" DROP CONSTRAINT "dream_stories_dreamId_fkey";

-- DropForeignKey
ALTER TABLE "dream_stories" DROP CONSTRAINT "dream_stories_userId_fkey";

-- DropForeignKey
ALTER TABLE "story_symbols" DROP CONSTRAINT "story_symbols_storyId_fkey";

-- DropForeignKey
ALTER TABLE "story_themes" DROP CONSTRAINT "story_themes_storyId_fkey";

-- DropIndex
DROP INDEX "Emotion_name_key";

-- DropIndex
DROP INDEX "Symbol_name_key";

-- DropIndex
DROP INDEX "Theme_name_key";

-- AlterTable
ALTER TABLE "Dream" DROP COLUMN "analysis",
DROP COLUMN "isPublic",
ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "Emotion" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "intensity",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Symbol" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Theme" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "password",
DROP COLUMN "updatedAt",
ALTER COLUMN "email" DROP NOT NULL;

-- DropTable
DROP TABLE "DashboardStats";

-- DropTable
DROP TABLE "DreamConnection";

-- DropTable
DROP TABLE "DreamPattern";

-- DropTable
DROP TABLE "UserInsight";

-- DropTable
DROP TABLE "_DreamPatternToEmotion";

-- DropTable
DROP TABLE "_DreamPatternToSymbol";

-- DropTable
DROP TABLE "_DreamPatternToTheme";

-- DropTable
DROP TABLE "_DreamPatternToUserInsight";

-- DropTable
DROP TABLE "_DreamToDreamPattern";

-- DropTable
DROP TABLE "dream_stories";

-- DropTable
DROP TABLE "story_symbols";

-- DropTable
DROP TABLE "story_themes";

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "DreamStory" (
    "id" TEXT NOT NULL,
    "dreamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DreamStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DreamStoryToTheme" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DreamStoryToSymbol" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "DreamStory_dreamId_key" ON "DreamStory"("dreamId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_storyId_userId_key" ON "Like"("storyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamStoryToTheme_AB_unique" ON "_DreamStoryToTheme"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamStoryToTheme_B_index" ON "_DreamStoryToTheme"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamStoryToSymbol_AB_unique" ON "_DreamStoryToSymbol"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamStoryToSymbol_B_index" ON "_DreamStoryToSymbol"("B");

-- AddForeignKey
ALTER TABLE "DreamStory" ADD CONSTRAINT "DreamStory_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamStory" ADD CONSTRAINT "DreamStory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "DreamStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "DreamStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamStoryToTheme" ADD CONSTRAINT "_DreamStoryToTheme_A_fkey" FOREIGN KEY ("A") REFERENCES "DreamStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamStoryToTheme" ADD CONSTRAINT "_DreamStoryToTheme_B_fkey" FOREIGN KEY ("B") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamStoryToSymbol" ADD CONSTRAINT "_DreamStoryToSymbol_A_fkey" FOREIGN KEY ("A") REFERENCES "DreamStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamStoryToSymbol" ADD CONSTRAINT "_DreamStoryToSymbol_B_fkey" FOREIGN KEY ("B") REFERENCES "Symbol"("id") ON DELETE CASCADE ON UPDATE CASCADE;
