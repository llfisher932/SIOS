import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

// POSTGRES_PRISMA_URL comes from Vercel's Supabase integration.
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to server/.env.");
}

// pg treats the integration's sslmode=require as verify-full, which rejects Supabase's CA.
const url = new URL(connectionString);
url.searchParams.set("uselibpqcompat", "true");

const adapter = new PrismaPg({ connectionString: url.toString() });

const prisma = new PrismaClient({ adapter });

export default prisma;
