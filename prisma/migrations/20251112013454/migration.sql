/*
  Warnings:

  - A unique constraint covering the columns `[alias]` on the table `RichMenu` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "RichMenu" ADD COLUMN     "alias" TEXT,
ADD COLUMN     "barDisplayed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "RichMenu_alias_key" ON "RichMenu"("alias");
