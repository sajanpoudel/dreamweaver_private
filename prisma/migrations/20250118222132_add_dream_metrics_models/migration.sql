/*
  Warnings:

  - You are about to drop the `Dream` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Dream" DROP CONSTRAINT "Dream_userId_fkey";

-- DropForeignKey
ALTER TABLE "DreamPattern" DROP CONSTRAINT "DreamPattern_userId_fkey";

-- DropForeignKey
ALTER TABLE "DreamStory" DROP CONSTRAINT "DreamStory_dreamId_fkey";

-- DropForeignKey
ALTER TABLE "DreamStory" DROP CONSTRAINT "DreamStory_userId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "MentalStateSnapshot" DROP CONSTRAINT "MentalStateSnapshot_dreamId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "_DreamToDreamPattern" DROP CONSTRAINT "_DreamToDreamPattern_A_fkey";

-- DropForeignKey
ALTER TABLE "_DreamToEmotion" DROP CONSTRAINT "_DreamToEmotion_A_fkey";

-- DropForeignKey
ALTER TABLE "_DreamToSymbol" DROP CONSTRAINT "_DreamToSymbol_A_fkey";

-- DropForeignKey
ALTER TABLE "_DreamToTheme" DROP CONSTRAINT "_DreamToTheme_A_fkey";

-- DropTable
DROP TABLE "Dream";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dreams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "analysis" JSONB,
    "rawAnalysis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "dreams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStatus" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stressLevel" INTEGER NOT NULL DEFAULT 0,
    "moodScore" INTEGER NOT NULL DEFAULT 0,
    "anxiety" INTEGER NOT NULL DEFAULT 0,
    "physicalHealth" INTEGER NOT NULL DEFAULT 0,
    "lifeEvents" JSONB,
    "dailyActivities" TEXT[],
    "notes" TEXT,

    CONSTRAINT "UserStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SleepData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" DOUBLE PRECISION NOT NULL,
    "quality" INTEGER NOT NULL DEFAULT 0,
    "deepSleep" DOUBLE PRECISION,
    "remSleep" DOUBLE PRECISION,
    "interruptions" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "SleepData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamMetrics" (
    "id" TEXT NOT NULL,
    "dreamId" TEXT NOT NULL,
    "clarity" INTEGER NOT NULL DEFAULT 0,
    "vividness" INTEGER NOT NULL DEFAULT 0,
    "emotionalIntensity" INTEGER NOT NULL DEFAULT 0,
    "recallQuality" INTEGER NOT NULL DEFAULT 0,
    "lucidity" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "timeOfNight" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "DreamMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamCorrelation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "factor" TEXT NOT NULL,
    "correlation" DOUBLE PRECISION NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "timeRange" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DreamCorrelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "UserStatus_userId_timestamp_idx" ON "UserStatus"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "SleepData_userId_date_idx" ON "SleepData"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DreamMetrics_dreamId_key" ON "DreamMetrics"("dreamId");

-- CreateIndex
CREATE INDEX "DreamMetrics_dreamId_idx" ON "DreamMetrics"("dreamId");

-- CreateIndex
CREATE INDEX "DreamCorrelation_userId_factor_idx" ON "DreamCorrelation"("userId", "factor");

-- CreateIndex
CREATE UNIQUE INDEX "DreamCorrelation_userId_factor_key" ON "DreamCorrelation"("userId", "factor");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreams" ADD CONSTRAINT "dreams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamPattern" ADD CONSTRAINT "DreamPattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentalStateSnapshot" ADD CONSTRAINT "MentalStateSnapshot_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "dreams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamStory" ADD CONSTRAINT "DreamStory_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "dreams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamStory" ADD CONSTRAINT "DreamStory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStatus" ADD CONSTRAINT "UserStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SleepData" ADD CONSTRAINT "SleepData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamMetrics" ADD CONSTRAINT "DreamMetrics_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "dreams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamCorrelation" ADD CONSTRAINT "DreamCorrelation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToTheme" ADD CONSTRAINT "_DreamToTheme_A_fkey" FOREIGN KEY ("A") REFERENCES "dreams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToSymbol" ADD CONSTRAINT "_DreamToSymbol_A_fkey" FOREIGN KEY ("A") REFERENCES "dreams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToEmotion" ADD CONSTRAINT "_DreamToEmotion_A_fkey" FOREIGN KEY ("A") REFERENCES "dreams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToDreamPattern" ADD CONSTRAINT "_DreamToDreamPattern_A_fkey" FOREIGN KEY ("A") REFERENCES "dreams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
