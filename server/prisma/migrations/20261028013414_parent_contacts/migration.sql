-- AlterTable
ALTER TABLE "parent_profiles" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL NOT NULL,
    "parentProfileId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "authorizedPickup" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contacts_parentProfileId_idx" ON "contacts"("parentProfileId");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_parentProfileId_fkey" FOREIGN KEY ("parentProfileId") REFERENCES "parent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Block Supabase's Data API from this table, matching the other tables.
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;
