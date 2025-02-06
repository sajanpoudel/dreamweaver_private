-- CreateTable
CREATE TABLE "DreamSpace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "primarySymbol" TEXT NOT NULL,
    "relatedSymbols" TEXT[],
    "dominantTheme" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DreamSpace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DreamToDreamSpace" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DreamSpaceToSymbol" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DreamSpaceToTheme" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "DreamSpace_primarySymbol_idx" ON "DreamSpace"("primarySymbol");

-- CreateIndex
CREATE INDEX "DreamSpace_dominantTheme_idx" ON "DreamSpace"("dominantTheme");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamToDreamSpace_AB_unique" ON "_DreamToDreamSpace"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamToDreamSpace_B_index" ON "_DreamToDreamSpace"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamSpaceToSymbol_AB_unique" ON "_DreamSpaceToSymbol"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamSpaceToSymbol_B_index" ON "_DreamSpaceToSymbol"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamSpaceToTheme_AB_unique" ON "_DreamSpaceToTheme"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamSpaceToTheme_B_index" ON "_DreamSpaceToTheme"("B");

-- AddForeignKey
ALTER TABLE "_DreamToDreamSpace" ADD CONSTRAINT "_DreamToDreamSpace_A_fkey" FOREIGN KEY ("A") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToDreamSpace" ADD CONSTRAINT "_DreamToDreamSpace_B_fkey" FOREIGN KEY ("B") REFERENCES "DreamSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamSpaceToSymbol" ADD CONSTRAINT "_DreamSpaceToSymbol_A_fkey" FOREIGN KEY ("A") REFERENCES "DreamSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamSpaceToSymbol" ADD CONSTRAINT "_DreamSpaceToSymbol_B_fkey" FOREIGN KEY ("B") REFERENCES "Symbol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamSpaceToTheme" ADD CONSTRAINT "_DreamSpaceToTheme_A_fkey" FOREIGN KEY ("A") REFERENCES "DreamSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamSpaceToTheme" ADD CONSTRAINT "_DreamSpaceToTheme_B_fkey" FOREIGN KEY ("B") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
