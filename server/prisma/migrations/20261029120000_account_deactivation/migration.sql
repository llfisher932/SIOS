-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "deactivatedAt" TIMESTAMP(3),
ADD COLUMN     "deactivatedEmail" TEXT;
