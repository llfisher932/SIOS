-- Block Supabase's Data API (anon/authenticated roles) from these tables.
-- No policies on purpose: the server connects as the table owner, which RLS doesn't apply to.
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;

-- Skipped in migrate dev's shadow database, where this table doesn't exist.
DO $$
BEGIN
  IF to_regclass('"_prisma_migrations"') IS NOT NULL THEN
    ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
