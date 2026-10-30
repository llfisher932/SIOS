// Creates local test accounts. Run with: npx prisma db seed
// Test-only credentials — never reuse this password anywhere real.
import prisma from "../src/db.js";
import { hashPassword } from "../src/auth/password.js";
import { normalizeEmail } from "../src/models/account.model.js";
import type { AccountStatus, StaffRole } from "../src/generated/prisma/client.js";

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

// Students from the wireframes. Matched by name + date of birth so reruns don't duplicate them.
const students = [
  {
    firstName: "Jordan",
    lastName: "Smith",
    dateOfBirth: new Date("2014-03-12T00:00:00.000Z"),
    grade: "6th",
    program: "Youth MMA",
    site: "Impact",
    school: "Springfield Middle School",
    enrollmentDate: new Date("2026-08-15T00:00:00.000Z"),
    guardianName: "Maria Smith",
    guardianPhone: "9045550142",
    guardianEmail: "maria.smith@example.com",
    linkParent: true,
  },
  {
    firstName: "Ava",
    lastName: "Johnson",
    dateOfBirth: new Date("2018-06-02T00:00:00.000Z"),
    grade: "3rd",
    program: "Little Ninjas",
    site: "Impact",
    enrollmentDate: new Date("2026-09-01T00:00:00.000Z"),
    guardianName: "Pat Parent",
    guardianPhone: "5551234567",
    guardianEmail: "parent@sios.test",
    linkParent: true,
  },
  {
    firstName: "Liam",
    lastName: "Brown",
    dateOfBirth: new Date("2012-11-23T00:00:00.000Z"),
    grade: "8th",
    program: "Youth MMA",
    site: "Zarephath",
    enrollmentDate: new Date("2026-07-20T00:00:00.000Z"),
    guardianName: "Dana Brown",
    guardianPhone: "5559876543",
    guardianEmail: "dana.brown@example.com",
    linkParent: false,
  },
];

for (const { linkParent, ...data } of students) {
  const existing = await prisma.student.findFirst({
    where: { firstName: data.firstName, lastName: data.lastName, dateOfBirth: data.dateOfBirth },
    select: { id: true },
  });
  const student = existing
    ? await prisma.student.update({ where: { id: existing.id }, data })
    : await prisma.student.create({ data });
  if (linkParent) {
    await prisma.studentParentLink.upsert({
      where: { studentId_parentAccountId: { studentId: student.id, parentAccountId: parent.id } },
      update: {},
      create: { studentId: student.id, parentAccountId: parent.id },
    });
  }
  console.log(`Seeded student ${data.firstName} ${data.lastName}${linkParent ? " (linked to parent@sios.test)" : ""}`);
}

await prisma.$disconnect();
