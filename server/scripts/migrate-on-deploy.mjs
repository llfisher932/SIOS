// Vercel's build step. Production only: preview builds must never change the live schema.
// A failed migration fails the build, so the deploy is aborted.
import { execSync } from "node:child_process";

if (process.env.VERCEL_ENV === "production") {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
} else {
  console.log(`Skipping prisma migrate deploy (VERCEL_ENV=${process.env.VERCEL_ENV ?? "unset"}).`);
}
