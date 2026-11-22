// Creates local test accounts + form responses. Run with: npx prisma db seed
// Test-only credentials — never reuse this password anywhere real.
import prisma from "../src/db.js";
import { hashPassword } from "../src/auth/password.js";
import { normalizeEmail } from "../src/models/account.model.js";
import type { AccountStatus, StaffRole, FormResponseStatus} from "../src/generated/prisma/client.js";

const TEST_PASSWORD = "password";

type Name = { firstName: string; lastName: string };
type Seed = { email: string; status: AccountStatus } & (
  | { type: "STAFF"; profile: Name & { role: StaffRole; site?: string; team?: string } }
  | { type: "PARENT"; profile: Name & { phone?: string; address?: string } }
);

const accounts: Seed[] = [
  {
    email: "staff@sios.test",
    type: "STAFF",
    status: "ACTIVE",
    profile: { firstName: "Sam", lastName: "Staff", role: "STAFF", site: "Example Site", team: "Sierra" },
  },
  {
    email: "admin@sios.test",
    type: "STAFF",
    status: "ACTIVE",
    profile: { firstName: "Alex", lastName: "Admin", role: "ADMIN", site: "Example Site" },
  },
  {
    email: "superadmin@sios.test",
    type: "STAFF",
    status: "ACTIVE",
    profile: { firstName: "Sky", lastName: "Superadmin", role: "SUPER_ADMIN" },
  },
  {
    email: "parent@sios.test",
    type: "PARENT",
    status: "ACTIVE",
    profile: {
      firstName: "Pat",
      lastName: "Parent",
      phone: "5551234567",
      address: "111 Somewhere Blvd, Springfield, IL 62701",
    },
  },
  { email: "pending@sios.test", type: "PARENT", status: "PENDING", profile: { firstName: "Penny", lastName: "Pending" } },
  { email: "inactive@sios.test", type: "PARENT", status: "INACTIVE", profile: { firstName: "Ian", lastName: "Inactive" } },
];

const passwordHash = await hashPassword(TEST_PASSWORD);

for (const seed of accounts) {
  const email = normalizeEmail(seed.email);
  const { type, status, profile } = seed;
  const relation =
    seed.type === "PARENT"
      ? { parentProfile: { upsert: { create: seed.profile, update: seed.profile } } }
      : { staffProfile: { upsert: { create: seed.profile, update: seed.profile } } };
  const created =
    seed.type === "PARENT" ? { parentProfile: { create: seed.profile } } : { staffProfile: { create: seed.profile } };

  await prisma.account.upsert({
    where: { email },
    update: { type, status, passwordHash, ...relation },
    create: { email, type, status, passwordHash, ...created },
  });
  console.log(`Seeded ${status.padEnd(8)} ${type.padEnd(6)} ${email} (${profile.firstName} ${profile.lastName})`);
}

// Contacts for the active parent. Replaced on every run.
const parent = await prisma.account.findUniqueOrThrow({ where: { email: "parent@sios.test" } });
await prisma.parentProfile.update({
  where: { accountId: parent.id },
  data: {
    contacts: {
      deleteMany: {},
      create: [
        { firstName: "Jordan", lastName: "Parent", relationship: "Dad", phone: "5552345678", authorizedPickup: true },
        { firstName: "Rose", lastName: "Parent", relationship: "Grandma", phone: "5553456789", authorizedPickup: false },
      ],
    },
  },
});
console.log("Seeded contacts for parent@sios.test");

// Dummy Form Responses
type FormResponseSeed = {status: "COMPLETED", title: "Dummy Form", userID: number}
type FormResponseQuestionSeed = {formResponseID: number, questionText: string, answerText: string}

console.log("Clearing pre-existing form response info...")
await prisma.formResponseQuestion.deleteMany()
await prisma.formResponse.deleteMany()

console.log("Creating form responses...")
await prisma.formResponse.createMany({
  data: [
    {status: "COMPLETED", title: "Dummy Form Res A", userID: 4},
    {status: "COMPLETED", title: "Dummy Form Res B", userID: 4},
    {title: "Incomplete Dummy Form Res", userID: 4}
  ]
})

console.log("Creating form response questions...")
await prisma.formResponseQuestion.createMany({
  data: [
    {formResponseid: 1, questionText: "Is water wet?", answerText: "Yes"},
    {formResponseid: 1, questionText: "On a scale of 1 to 5, how satisfied are you?", answerText: "4"},
    {formResponseid: 1, questionText: "Is there anything else you'd like to add?", answerText: "Nah I'm good"},
    {formResponseid: 2, questionText: "Is water wet?", answerText: "No"},
    {formResponseid: 2, questionText: "On a scale of 1 to 5, how satisfied are you?", answerText: "2"},
    {formResponseid: 2, questionText: "Is there anything else you'd like to add?", answerText: "Yes, actually."}
  ]
});

await prisma.$disconnect();
