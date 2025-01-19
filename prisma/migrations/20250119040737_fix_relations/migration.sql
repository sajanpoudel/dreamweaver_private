/*
  Warnings:

  - You are about to drop the column `duration` on the `DreamMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `emotionalIntensity` on the `DreamMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `DreamMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `recallQuality` on the `DreamMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `timeOfNight` on the `DreamMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `correlations` on the `DreamPattern` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `DreamPattern` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `DreamPattern` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `DreamStory` table. All the data in the column will be lost.
  - You are about to drop the column `dominantEmotions` on the `MentalStateSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `MentalStateSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `meaning` on the `Symbol` table. All the data in the column will be lost.
  - You are about to drop the `_DreamStoryToSymbol` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DreamStoryToTheme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dreams` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `content` on the `DreamStory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "DreamMetrics" DROP CONSTRAINT "DreamMetrics_dreamId_fkey";

-- DropForeignKey
ALTER TABLE "DreamStory" DROP CONSTRAINT "DreamStory_dreamId_fkey";

-- DropForeignKey
ALTER TABLE "MentalStateSnapshot" DROP CONSTRAINT "MentalStateSnapshot_dreamId_fkey";

-- DropForeignKey
ALTER TABLE "_DreamStoryToSymbol" DROP CONSTRAINT "_DreamStoryToSymbol_A_fkey";

-- DropForeignKey
ALTER TABLE "_DreamStoryToSymbol" DROP CONSTRAINT "_DreamStoryToSymbol_B_fkey";

-- DropForeignKey
ALTER TABLE "_DreamStoryToTheme" DROP CONSTRAINT "_DreamStoryToTheme_A_fkey";

-- DropForeignKey
ALTER TABLE "_DreamStoryToTheme" DROP CONSTRAINT "_DreamStoryToTheme_B_fkey";

-- DropForeignKey
ALTER TABLE "_DreamToDreamPattern" DROP CONSTRAINT "_DreamToDreamPattern_A_fkey";

-- DropForeignKey
ALTER TABLE "_DreamToEmotion" DROP CONSTRAINT "_DreamToEmotion_A_fkey";

-- DropForeignKey
ALTER TABLE "_DreamToSymbol" DROP CONSTRAINT "_DreamToSymbol_A_fkey";

-- DropForeignKey
ALTER TABLE "_DreamToTheme" DROP CONSTRAINT "_DreamToTheme_A_fkey";

-- DropForeignKey
ALTER TABLE "dreams" DROP CONSTRAINT "dreams_userId_fkey";

-- DropIndex
DROP INDEX "MentalStateSnapshot_dreamId_key";

-- AlterTable
ALTER TABLE "DreamMetrics" DROP COLUMN "duration",
DROP COLUMN "emotionalIntensity",
DROP COLUMN "notes",
DROP COLUMN "recallQuality",
DROP COLUMN "timeOfNight",
ADD COLUMN     "impact" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "recall" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "DreamPattern" DROP COLUMN "correlations",
DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "impact" DOUBLE PRECISION,
ALTER COLUMN "confidence" DROP DEFAULT;

-- AlterTable
ALTER TABLE "DreamStory" DROP COLUMN "publishedAt",
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Emotion" ADD COLUMN     "frequency" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "MentalStateSnapshot" DROP COLUMN "dominantEmotions",
DROP COLUMN "notes",
ADD COLUMN     "clarity" DOUBLE PRECISION,
ADD COLUMN     "energyLevel" DOUBLE PRECISION,
ADD COLUMN     "improvements" JSONB,
ADD COLUMN     "sleepQuality" DOUBLE PRECISION,
ADD COLUMN     "triggers" JSONB,
ALTER COLUMN "stressLevel" DROP DEFAULT,
ALTER COLUMN "stressLevel" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "anxietyLevel" DROP DEFAULT,
ALTER COLUMN "anxietyLevel" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "moodScore" DROP DEFAULT,
ALTER COLUMN "moodScore" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Symbol" DROP COLUMN "meaning";

-- DropTable
DROP TABLE "_DreamStoryToSymbol";

-- DropTable
DROP TABLE "_DreamStoryToTheme";

-- DropTable
DROP TABLE "dreams";

-- CreateTable
CREATE TABLE "Dream" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "analysis" JSONB,
    "rawAnalysis" TEXT,

    CONSTRAINT "Dream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamCheckpoint" (
    "id" TEXT NOT NULL,
    "dreamId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "similarity" DOUBLE PRECISION,

    CONSTRAINT "DreamCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DreamStoryThemes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DreamStorySymbols" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Dream_userId_idx" ON "Dream"("userId");

-- CreateIndex
CREATE INDEX "DreamCheckpoint_dreamId_idx" ON "DreamCheckpoint"("dreamId");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamStoryThemes_AB_unique" ON "_DreamStoryThemes"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamStoryThemes_B_index" ON "_DreamStoryThemes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamStorySymbols_AB_unique" ON "_DreamStorySymbols"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamStorySymbols_B_index" ON "_DreamStorySymbols"("B");

-- CreateIndex
CREATE INDEX "DreamPattern_userId_idx" ON "DreamPattern"("userId");

-- CreateIndex
CREATE INDEX "DreamStory_userId_idx" ON "DreamStory"("userId");

-- CreateIndex
CREATE INDEX "MentalStateSnapshot_dreamId_idx" ON "MentalStateSnapshot"("dreamId");

-- AddForeignKey
ALTER TABLE "Dream" ADD CONSTRAINT "Dream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamCheckpoint" ADD CONSTRAINT "DreamCheckpoint_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentalStateSnapshot" ADD CONSTRAINT "MentalStateSnapshot_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamStory" ADD CONSTRAINT "DreamStory_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamMetrics" ADD CONSTRAINT "DreamMetrics_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToSymbol" ADD CONSTRAINT "_DreamToSymbol_A_fkey" FOREIGN KEY ("A") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToTheme" ADD CONSTRAINT "_DreamToTheme_A_fkey" FOREIGN KEY ("A") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToEmotion" ADD CONSTRAINT "_DreamToEmotion_A_fkey" FOREIGN KEY ("A") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToDreamPattern" ADD CONSTRAINT "_DreamToDreamPattern_A_fkey" FOREIGN KEY ("A") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamStoryThemes" ADD CONSTRAINT "_DreamStoryThemes_A_fkey" FOREIGN KEY ("A") REFERENCES "DreamStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamStoryThemes" ADD CONSTRAINT "_DreamStoryThemes_B_fkey" FOREIGN KEY ("B") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamStorySymbols" ADD CONSTRAINT "_DreamStorySymbols_A_fkey" FOREIGN KEY ("A") REFERENCES "DreamStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamStorySymbols" ADD CONSTRAINT "_DreamStorySymbols_B_fkey" FOREIGN KEY ("B") REFERENCES "Symbol"("id") ON DELETE CASCADE ON UPDATE CASCADE;
