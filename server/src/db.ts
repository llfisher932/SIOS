import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

// POSTGRES_PRISMA_URL is the name Vercel's Supabase integration uses for the same pooled URL.
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to server/.env.");
}

// Runtime connection goes through Supabase's transaction pooler (port 6543).
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

export default prisma;
