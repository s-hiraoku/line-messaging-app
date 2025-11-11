-- CreateEnum
CREATE TYPE "RichMenuStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "RichMenu" ADD COLUMN     "status" "RichMenuStatus" NOT NULL DEFAULT 'DRAFT';
