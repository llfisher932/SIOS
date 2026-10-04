import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Config for the Prisma CLI (migrate, db pull, studio).
// The CLI uses DIRECT_URL (Supabase session pooler, port 5432) because migrations
// need a session connection. The app itself connects with DATABASE_URL in src/db.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
