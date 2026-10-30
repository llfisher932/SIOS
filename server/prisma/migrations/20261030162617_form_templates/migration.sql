-- CreateTable
CREATE TABLE "form_templates" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_templates_pkey" PRIMARY KEY ("id")
);

-- Block Supabase's Data API from this table, matching the other tables.
ALTER TABLE "form_templates" ENABLE ROW LEVEL SECURITY;
