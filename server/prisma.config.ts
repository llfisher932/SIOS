import "dotenv/config";
import { defineConfig } from "prisma/config";

// Config for the Prisma CLI (migrate, db pull, studio).
// The CLI uses DIRECT_URL (Supabase session pooler, port 5432) because migrations
// need a session connection. The app itself connects with DATABASE_URL in src/db.ts.
// POSTGRES_URL_NON_POOLING is the name Vercel's Supabase integration uses for the same URL.
const directUrl = process.env.DIRECT_URL ?? process.env.POSTGRES_URL_NON_POOLING;
if (!directUrl) {
  throw new Error("DIRECT_URL is not set. Add it to server/.env.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: directUrl,
  },
});
