// Creates local test accounts. Run with: npx prisma db seed
// Test-only credentials — never reuse this password anywhere real.
import prisma from "../src/db.js";
import { hashPassword } from "../src/auth/password.js";
import { normalizeEmail } from "../src/models/account.model.js";
import type { AccountStatus, AccountType } from "../src/generated/prisma/client.js";

const TEST_PASSWORD = "password";

const accounts: { email: string; type: AccountType; status: AccountStatus }[] = [
  { email: "staff@sios.test", type: "STAFF", status: "ACTIVE" },
  { email: "parent@sios.test", type: "PARENT", status: "ACTIVE" },
  { email: "pending@sios.test", type: "PARENT", status: "PENDING" },
  { email: "inactive@sios.test", type: "PARENT", status: "INACTIVE" },
];

const passwordHash = await hashPassword(TEST_PASSWORD);

for (const { email, type, status } of accounts) {
  const normalized = normalizeEmail(email);
  await prisma.account.upsert({
    where: { email: normalized },
    update: { type, status, passwordHash },
    create: { email: normalized, type, status, passwordHash },
  });
  console.log(`Seeded ${status.padEnd(8)} ${type.padEnd(6)} ${normalized}`);
}

await prisma.$disconnect();
