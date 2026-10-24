-- Block Supabase's Data API (anon/authenticated roles) from these tables.
-- No policies on purpose: the server connects as the table owner, which RLS doesn't apply to.
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
