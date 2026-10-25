import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations need a session connection (port 5432); the app uses DATABASE_URL instead.
// POSTGRES_URL_NON_POOLING comes from Vercel's Supabase integration.
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
