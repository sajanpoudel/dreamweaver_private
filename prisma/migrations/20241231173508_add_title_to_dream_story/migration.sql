/*
  Warnings:

  - Added the required column `title` to the `DreamStory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DreamStory" ADD COLUMN     "title" TEXT NOT NULL;
