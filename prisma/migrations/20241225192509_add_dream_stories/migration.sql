/*
  Warnings:

  - You are about to drop the `DreamStory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StorySymbol` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StoryTheme` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DreamStory" DROP CONSTRAINT "DreamStory_dreamId_fkey";

-- DropForeignKey
ALTER TABLE "DreamStory" DROP CONSTRAINT "DreamStory_userId_fkey";

-- DropForeignKey
ALTER TABLE "StorySymbol" DROP CONSTRAINT "StorySymbol_storyId_fkey";

-- DropForeignKey
ALTER TABLE "StoryTheme" DROP CONSTRAINT "StoryTheme_storyId_fkey";

-- DropTable
DROP TABLE "DreamStory";

-- DropTable
DROP TABLE "StorySymbol";

-- DropTable
DROP TABLE "StoryTheme";

-- CreateTable
CREATE TABLE "dream_stories" (
    "id" TEXT NOT NULL,
    "dreamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dream_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_themes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "story_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_symbols" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "story_symbols_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dream_stories_userId_idx" ON "dream_stories"("userId");

-- CreateIndex
CREATE INDEX "dream_stories_dreamId_idx" ON "dream_stories"("dreamId");

-- CreateIndex
CREATE UNIQUE INDEX "dream_stories_dreamId_userId_key" ON "dream_stories"("dreamId", "userId");

-- CreateIndex
CREATE INDEX "story_themes_storyId_idx" ON "story_themes"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "story_themes_name_storyId_key" ON "story_themes"("name", "storyId");

-- CreateIndex
CREATE INDEX "story_symbols_storyId_idx" ON "story_symbols"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "story_symbols_name_storyId_key" ON "story_symbols"("name", "storyId");

-- AddForeignKey
ALTER TABLE "dream_stories" ADD CONSTRAINT "dream_stories_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dream_stories" ADD CONSTRAINT "dream_stories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_themes" ADD CONSTRAINT "story_themes_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "dream_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_symbols" ADD CONSTRAINT "story_symbols_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "dream_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
