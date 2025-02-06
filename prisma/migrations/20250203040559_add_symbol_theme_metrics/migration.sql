/*
  Warnings:

  - Added the required column `updatedAt` to the `Symbol` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Theme` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DreamStory" DROP CONSTRAINT "DreamStory_dreamId_fkey";

-- DropForeignKey
ALTER TABLE "DreamStory" DROP CONSTRAINT "DreamStory_userId_fkey";

-- DropIndex
DROP INDEX "DreamStory_userId_idx";

-- AlterTable
ALTER TABLE "Symbol" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "significance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'personal';

-- AlterTable
ALTER TABLE "Theme" ADD COLUMN     "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "category" SET DEFAULT 'personal_growth';

-- CreateTable
CREATE TABLE "DashboardStats" (
    "id" TEXT NOT NULL,
    "topSymbols" JSONB NOT NULL,
    "topThemes" JSONB NOT NULL,
    "topEmotions" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardStats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DreamStory" ADD CONSTRAINT "DreamStory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamStory" ADD CONSTRAINT "DreamStory_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
