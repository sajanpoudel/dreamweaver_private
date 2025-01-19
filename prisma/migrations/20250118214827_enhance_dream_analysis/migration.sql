/*
  Warnings:

  - The `analysis` column on the `Dream` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[name]` on the table `Emotion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Theme` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Dream" ADD COLUMN     "rawAnalysis" TEXT,
DROP COLUMN "analysis",
ADD COLUMN     "analysis" JSONB;

-- AlterTable
ALTER TABLE "Emotion" ADD COLUMN     "arousal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'primary',
ADD COLUMN     "valence" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Symbol" ADD COLUMN     "frequency" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "meaning" JSONB,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'cultural';

-- AlterTable
ALTER TABLE "Theme" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'psychological',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "frequency" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "DreamPattern" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "elements" JSONB NOT NULL,
    "correlations" JSONB,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DreamPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentalStateSnapshot" (
    "id" TEXT NOT NULL,
    "dreamId" TEXT NOT NULL,
    "stressLevel" INTEGER NOT NULL DEFAULT 0,
    "anxietyLevel" INTEGER NOT NULL DEFAULT 0,
    "moodScore" INTEGER NOT NULL DEFAULT 0,
    "dominantEmotions" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "MentalStateSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DreamToDreamPattern" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MentalStateSnapshot_dreamId_key" ON "MentalStateSnapshot"("dreamId");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamToDreamPattern_AB_unique" ON "_DreamToDreamPattern"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamToDreamPattern_B_index" ON "_DreamToDreamPattern"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Emotion_name_key" ON "Emotion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_name_key" ON "Theme"("name");

-- AddForeignKey
ALTER TABLE "DreamPattern" ADD CONSTRAINT "DreamPattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentalStateSnapshot" ADD CONSTRAINT "MentalStateSnapshot_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToDreamPattern" ADD CONSTRAINT "_DreamToDreamPattern_A_fkey" FOREIGN KEY ("A") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToDreamPattern" ADD CONSTRAINT "_DreamToDreamPattern_B_fkey" FOREIGN KEY ("B") REFERENCES "DreamPattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;
