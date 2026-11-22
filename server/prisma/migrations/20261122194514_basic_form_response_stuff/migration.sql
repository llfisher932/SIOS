-- CreateEnum
CREATE TYPE "FormResponseStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "form_response" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "status" "FormResponseStatus" NOT NULL DEFAULT 'PENDING',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "userID" INTEGER NOT NULL,

    CONSTRAINT "form_response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_response_question" (
    "id" SERIAL NOT NULL,
    "formResponseid" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,

    CONSTRAINT "form_response_question_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "form_response" ADD CONSTRAINT "form_response_userID_fkey" FOREIGN KEY ("userID") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_response_question" ADD CONSTRAINT "form_response_question_formResponseid_fkey" FOREIGN KEY ("formResponseid") REFERENCES "form_response"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
