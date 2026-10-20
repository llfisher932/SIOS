// Runs during Vercel builds (the "vercel-build" script) to apply pending Prisma migrations.
// Production only: preview builds of unmerged branches must never change the live schema.
// If a migration fails, the build fails and the deploy is aborted.
import { execSync } from "node:child_process";

if (process.env.VERCEL_ENV === "production") {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
} else {
  console.log(`Skipping prisma migrate deploy (VERCEL_ENV=${process.env.VERCEL_ENV ?? "unset"}).`);
}
