-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('STAFF', 'ADMIN', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "staff_profiles" ADD COLUMN     "role" "StaffRole" NOT NULL DEFAULT 'STAFF',
ADD COLUMN     "site" TEXT,
ADD COLUMN     "team" TEXT;
