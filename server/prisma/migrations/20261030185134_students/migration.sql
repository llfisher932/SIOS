-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT,
    "school" TEXT,
    "grade" TEXT,
    "program" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "guardianName" TEXT NOT NULL,
    "guardianPhone" TEXT NOT NULL,
    "guardianEmail" TEXT NOT NULL,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelationship" TEXT,
    "medicalNotes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_parent_links" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "parentAccountId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_parent_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_parent_links_parentAccountId_idx" ON "student_parent_links"("parentAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "student_parent_links_studentId_parentAccountId_key" ON "student_parent_links"("studentId", "parentAccountId");

-- AddForeignKey
ALTER TABLE "student_parent_links" ADD CONSTRAINT "student_parent_links_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_parent_links" ADD CONSTRAINT "student_parent_links_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "parent_profiles"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- Block Supabase's Data API from these tables, matching the other tables.
ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_parent_links" ENABLE ROW LEVEL SECURITY;
