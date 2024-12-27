-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dream" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "analysis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Dream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Symbol" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Symbol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emotion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "intensity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Emotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamPattern" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DreamPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamConnection" (
    "id" TEXT NOT NULL,
    "dreamId" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DreamConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInsight" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "actionable" BOOLEAN NOT NULL DEFAULT false,
    "recommendation" TEXT,

    CONSTRAINT "UserInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardStats" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "topSymbols" JSONB NOT NULL,
    "topThemes" JSONB NOT NULL,
    "topEmotions" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamStory" (
    "id" TEXT NOT NULL,
    "dreamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DreamStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryTheme" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorySymbol" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorySymbol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DreamToSymbol" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DreamToTheme" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DreamToEmotion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DreamToDreamPattern" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DreamPatternToSymbol" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DreamPatternToTheme" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DreamPatternToEmotion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DreamPatternToUserInsight" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Symbol_name_key" ON "Symbol"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_name_key" ON "Theme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Emotion_name_key" ON "Emotion"("name");

-- CreateIndex
CREATE INDEX "DreamStory_userId_idx" ON "DreamStory"("userId");

-- CreateIndex
CREATE INDEX "DreamStory_isPublic_publishedAt_idx" ON "DreamStory"("isPublic", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DreamStory_dreamId_userId_key" ON "DreamStory"("dreamId", "userId");

-- CreateIndex
CREATE INDEX "StoryTheme_storyId_idx" ON "StoryTheme"("storyId");

-- CreateIndex
CREATE INDEX "StoryTheme_name_idx" ON "StoryTheme"("name");

-- CreateIndex
CREATE INDEX "StorySymbol_storyId_idx" ON "StorySymbol"("storyId");

-- CreateIndex
CREATE INDEX "StorySymbol_name_idx" ON "StorySymbol"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamToSymbol_AB_unique" ON "_DreamToSymbol"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamToSymbol_B_index" ON "_DreamToSymbol"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamToTheme_AB_unique" ON "_DreamToTheme"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamToTheme_B_index" ON "_DreamToTheme"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamToEmotion_AB_unique" ON "_DreamToEmotion"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamToEmotion_B_index" ON "_DreamToEmotion"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamToDreamPattern_AB_unique" ON "_DreamToDreamPattern"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamToDreamPattern_B_index" ON "_DreamToDreamPattern"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamPatternToSymbol_AB_unique" ON "_DreamPatternToSymbol"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamPatternToSymbol_B_index" ON "_DreamPatternToSymbol"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamPatternToTheme_AB_unique" ON "_DreamPatternToTheme"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamPatternToTheme_B_index" ON "_DreamPatternToTheme"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamPatternToEmotion_AB_unique" ON "_DreamPatternToEmotion"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamPatternToEmotion_B_index" ON "_DreamPatternToEmotion"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DreamPatternToUserInsight_AB_unique" ON "_DreamPatternToUserInsight"("A", "B");

-- CreateIndex
CREATE INDEX "_DreamPatternToUserInsight_B_index" ON "_DreamPatternToUserInsight"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dream" ADD CONSTRAINT "Dream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamPattern" ADD CONSTRAINT "DreamPattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamConnection" ADD CONSTRAINT "DreamConnection_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamConnection" ADD CONSTRAINT "DreamConnection_relatedId_fkey" FOREIGN KEY ("relatedId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInsight" ADD CONSTRAINT "UserInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamStory" ADD CONSTRAINT "DreamStory_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamStory" ADD CONSTRAINT "DreamStory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryTheme" ADD CONSTRAINT "StoryTheme_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "DreamStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorySymbol" ADD CONSTRAINT "StorySymbol_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "DreamStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToSymbol" ADD CONSTRAINT "_DreamToSymbol_A_fkey" FOREIGN KEY ("A") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToSymbol" ADD CONSTRAINT "_DreamToSymbol_B_fkey" FOREIGN KEY ("B") REFERENCES "Symbol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToTheme" ADD CONSTRAINT "_DreamToTheme_A_fkey" FOREIGN KEY ("A") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToTheme" ADD CONSTRAINT "_DreamToTheme_B_fkey" FOREIGN KEY ("B") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToEmotion" ADD CONSTRAINT "_DreamToEmotion_A_fkey" FOREIGN KEY ("A") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToEmotion" ADD CONSTRAINT "_DreamToEmotion_B_fkey" FOREIGN KEY ("B") REFERENCES "Emotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToDreamPattern" ADD CONSTRAINT "_DreamToDreamPattern_A_fkey" FOREIGN KEY ("A") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamToDreamPattern" ADD CONSTRAINT "_DreamToDreamPattern_B_fkey" FOREIGN KEY ("B") REFERENCES "DreamPattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamPatternToSymbol" ADD CONSTRAINT "_DreamPatternToSymbol_A_fkey" FOREIGN KEY ("A") REFERENCES "DreamPattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamPatternToSymbol" ADD CONSTRAINT "_DreamPatternToSymbol_B_fkey" FOREIGN KEY ("B") REFERENCES "Symbol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamPatternToTheme" ADD CONSTRAINT "_DreamPatternToTheme_A_fkey" FOREIGN KEY ("A") REFERENCES "DreamPattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamPatternToTheme" ADD CONSTRAINT "_DreamPatternToTheme_B_fkey" FOREIGN KEY ("B") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamPatternToEmotion" ADD CONSTRAINT "_DreamPatternToEmotion_A_fkey" FOREIGN KEY ("A") REFERENCES "DreamPattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamPatternToEmotion" ADD CONSTRAINT "_DreamPatternToEmotion_B_fkey" FOREIGN KEY ("B") REFERENCES "Emotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamPatternToUserInsight" ADD CONSTRAINT "_DreamPatternToUserInsight_A_fkey" FOREIGN KEY ("A") REFERENCES "DreamPattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DreamPatternToUserInsight" ADD CONSTRAINT "_DreamPatternToUserInsight_B_fkey" FOREIGN KEY ("B") REFERENCES "UserInsight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
