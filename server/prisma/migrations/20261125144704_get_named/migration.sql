/*
  Warnings:

  - You are about to drop the column `completedAt` on the `form_response` table. All the data in the column will be lost.
  - Added the required column `assignedName` to the `form_response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `form_response` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "form_response_question" DROP CONSTRAINT "form_response_question_formResponseid_fkey";

-- AlterTable
ALTER TABLE "form_response" DROP COLUMN "completedAt",
ADD COLUMN     "assignedName" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "form_response_question" ADD CONSTRAINT "form_response_question_formResponseid_fkey" FOREIGN KEY ("formResponseid") REFERENCES "form_response"("id") ON DELETE CASCADE ON UPDATE CASCADE;
