// Creates local test accounts. Run with: npx prisma db seed
// Test-only credentials — never reuse this password anywhere real.
import prisma from "../src/db.js";
import { hashPassword } from "../src/auth/password.js";
import { normalizeEmail } from "../src/models/account.model.js";
import type { AccountStatus, AccountType } from "../src/generated/prisma/client.js";

const TEST_PASSWORD = "password";

const accounts: { email: string; type: AccountType; status: AccountStatus; firstName: string; lastName: string }[] = [
  { email: "staff@sios.test", type: "STAFF", status: "ACTIVE", firstName: "Sam", lastName: "Staff" },
  { email: "parent@sios.test", type: "PARENT", status: "ACTIVE", firstName: "Pat", lastName: "Parent" },
  { email: "pending@sios.test", type: "PARENT", status: "PENDING", firstName: "Penny", lastName: "Pending" },
  { email: "inactive@sios.test", type: "PARENT", status: "INACTIVE", firstName: "Ian", lastName: "Inactive" },
];

const passwordHash = await hashPassword(TEST_PASSWORD);

for (const { email, type, status, firstName, lastName } of accounts) {
  const normalized = normalizeEmail(email);
  const name = { firstName, lastName };
  const profile = { upsert: { create: name, update: name } };

  await prisma.account.upsert({
    where: { email: normalized },
    update: { type, status, passwordHash, ...(type === "PARENT" ? { parentProfile: profile } : { staffProfile: profile }) },
    create: {
      email: normalized,
      type,
      status,
      passwordHash,
      ...(type === "PARENT" ? { parentProfile: { create: name } } : { staffProfile: { create: name } }),
    },
  });
  console.log(`Seeded ${status.padEnd(8)} ${type.padEnd(6)} ${normalized}`);
}

await prisma.$disconnect();
