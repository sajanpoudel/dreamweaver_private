/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Symbol` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Symbol" ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Symbol_name_key" ON "Symbol"("name");
