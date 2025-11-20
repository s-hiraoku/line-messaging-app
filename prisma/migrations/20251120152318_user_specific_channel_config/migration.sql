/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `ChannelConfig` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `ChannelConfig` table without a default value. This is not possible if the table is not empty.

*/

-- Delete existing ChannelConfig records (they will need to be recreated per user)
DELETE FROM "ChannelConfig";

-- AlterTable
ALTER TABLE "ChannelConfig" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "ChannelConfig_userId_key" ON "ChannelConfig"("userId");

-- AddForeignKey
ALTER TABLE "ChannelConfig" ADD CONSTRAINT "ChannelConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
