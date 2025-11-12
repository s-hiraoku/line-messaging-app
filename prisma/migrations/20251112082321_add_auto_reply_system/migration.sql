-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('EXACT', 'CONTAINS', 'STARTS_WITH', 'ENDS_WITH');

-- CreateTable
CREATE TABLE "AutoReply" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keywords" TEXT[],
    "replyText" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "matchType" "MatchType" NOT NULL DEFAULT 'CONTAINS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutoReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutoReplyLog" (
    "id" TEXT NOT NULL,
    "autoReplyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inboundMessage" TEXT NOT NULL,
    "matchedKeyword" TEXT,
    "replySent" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutoReplyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultAutoReply" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "replyText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefaultAutoReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AutoReply_isActive_priority_createdAt_idx" ON "AutoReply"("isActive", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "AutoReplyLog_createdAt_idx" ON "AutoReplyLog"("createdAt");

-- CreateIndex
CREATE INDEX "AutoReplyLog_autoReplyId_createdAt_idx" ON "AutoReplyLog"("autoReplyId", "createdAt");

-- CreateIndex
CREATE INDEX "AutoReplyLog_userId_createdAt_idx" ON "AutoReplyLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "AutoReplyLog" ADD CONSTRAINT "AutoReplyLog_autoReplyId_fkey" FOREIGN KEY ("autoReplyId") REFERENCES "AutoReply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoReplyLog" ADD CONSTRAINT "AutoReplyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
