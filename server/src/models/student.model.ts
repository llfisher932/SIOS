import prisma from "../db.js";
import type { Prisma, StudentStatus } from "../generated/prisma/client.js";
import type { AccountSummary } from "./account.model.js";

export type StudentListItem = {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  grade: string | null;
  program: string;
  site: string;
  status: StudentStatus;
  updatedAt: Date;
};

export type StudentParent = {
  accountId: number;
  firstName: string;
  lastName: string;
  email: string;
};

export type StudentView = {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string | null;
  school: string | null;
  grade: string | null;
  program: string;
  site: string;
  enrollmentDate: Date;
  status: StudentStatus;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;
  medicalNotes: string | null;
  updatedAt: Date;
  parents: StudentParent[];
};

export type StudentFilters = {
  q: string | undefined;
  program: string | undefined;
  site: string | undefined;
  status: StudentStatus | undefined;
};

export type StudentInput = {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string | null;
  school: string | null;
  grade: string | null;
  program: string;
  site: string;
  enrollmentDate: Date;
  status: StudentStatus;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;
  medicalNotes: string | null;
  parentAccountIds: number[];
};

type Denied = {
  ok: false;
  reason: "FORBIDDEN" | "NOT_FOUND" | "DUPLICATE" | "BAD_PARENT";
};

const studentSelect = {
  id: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  gender: true,
  school: true,
  grade: true,
  program: true,
  site: true,
  enrollmentDate: true,
  status: true,
  guardianName: true,
  guardianPhone: true,
  guardianEmail: true,
  emergencyContactName: true,
  emergencyContactPhone: true,
  emergencyContactRelationship: true,
  medicalNotes: true,
  updatedAt: true,
  parents: {
    select: {
      parentProfile: {
        select: {
          accountId: true,
          firstName: true,
          lastName: true,
          account: { select: { email: true, deactivatedEmail: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.StudentSelect;

type StudentRow = Prisma.StudentGetPayload<{ select: typeof studentSelect }>;

function toView(student: StudentRow): StudentView {
  const { parents, ...rest } = student;
  return {
    ...rest,
    parents: parents.map(({ parentProfile }) => ({
      accountId: parentProfile.accountId,
      firstName: parentProfile.firstName,
      lastName: parentProfile.lastName,
      email: parentProfile.account.deactivatedEmail ?? parentProfile.account.email,
    })),
  };
}

// The whole staff can see the directory; parents get their own view in a later use case.
export function canViewStudents(viewer: AccountSummary): boolean {
  return viewer.type === "STAFF";
}

// Creating, editing and deleting students is admin work.
export function canManageStudents(viewer: AccountSummary): boolean {
  return viewer.role === "ADMIN" || viewer.role === "SUPER_ADMIN";
}

// "S-00042" or a plain number finds that student id; other terms match first or last name.
function matchesTerm(term: string): Prisma.StudentWhereInput {
  const idMatch = /^s-?0*(\d+)$/i.exec(term);
  if (idMatch) return { id: Number(idMatch[1]) };
  const contains = { contains: term, mode: "insensitive" } as const;
  return { OR: [{ firstName: contains }, { lastName: contains }] };
}

export async function searchStudents(
  viewer: AccountSummary,
  filters: StudentFilters,
): Promise<{ ok: true; students: StudentListItem[] } | Denied> {
  if (!canViewStudents(viewer)) return { ok: false, reason: "FORBIDDEN" };
  const terms = filters.q?.trim().split(/\s+/).filter(Boolean) ?? [];

  const students = await prisma.student.findMany({
    where: {
      archivedAt: null,
      ...(filters.program && { program: filters.program }),
      ...(filters.site && { site: filters.site }),
      ...(filters.status && { status: filters.status }),
      AND: terms.map(matchesTerm),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      grade: true,
      program: true,
      site: true,
      status: true,
      updatedAt: true,
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return { ok: true, students };
}

export async function getStudent(
  viewer: AccountSummary,
  id: number,
): Promise<{ ok: true; student: StudentView } | Denied> {
  if (!canViewStudents(viewer)) return { ok: false, reason: "FORBIDDEN" };

  const student = await prisma.student.findFirst({
    where: { id, archivedAt: null },
    select: studentSelect,
  });
  if (!student) return { ok: false, reason: "NOT_FOUND" };
  return { ok: true, student: toView(student) };
}

// Same name (ignoring case) and date of birth counts as a duplicate (see use case 3.4.2).
async function findDuplicate(input: StudentInput, excludeId?: number): Promise<boolean> {
  const match = await prisma.student.findFirst({
    where: {
      archivedAt: null,
      ...(excludeId && { id: { not: excludeId } }),
      firstName: { equals: input.firstName, mode: "insensitive" },
      lastName: { equals: input.lastName, mode: "insensitive" },
      dateOfBirth: input.dateOfBirth,
    },
    select: { id: true },
  });
  return match !== null;
}

// Every linked id must be an existing parent profile.
async function validParentIds(ids: number[]): Promise<boolean> {
  if (ids.length === 0) return true;
  const count = await prisma.parentProfile.count({ where: { accountId: { in: ids } } });
  return count === ids.length;
}

export async function createStudent(
  viewer: AccountSummary,
  input: StudentInput,
  allowDuplicate: boolean,
): Promise<{ ok: true; student: StudentView } | Denied> {
  if (!canManageStudents(viewer)) return { ok: false, reason: "FORBIDDEN" };
  if (!(await validParentIds(input.parentAccountIds))) return { ok: false, reason: "BAD_PARENT" };
  if (!allowDuplicate && (await findDuplicate(input))) return { ok: false, reason: "DUPLICATE" };

  const { parentAccountIds, ...data } = input;
  const student = await prisma.student.create({
    data: {
      ...data,
      parents: { create: parentAccountIds.map((parentAccountId) => ({ parentAccountId })) },
    },
    select: studentSelect,
  });
  return { ok: true, student: toView(student) };
}

export async function updateStudent(
  viewer: AccountSummary,
  id: number,
  input: StudentInput,
  allowDuplicate: boolean,
): Promise<{ ok: true; student: StudentView } | Denied> {
  if (!canManageStudents(viewer)) return { ok: false, reason: "FORBIDDEN" };

  const existing = await prisma.student.findUnique({ where: { id }, select: { archivedAt: true } });
  if (!existing || existing.archivedAt) return { ok: false, reason: "NOT_FOUND" };
  if (!(await validParentIds(input.parentAccountIds))) return { ok: false, reason: "BAD_PARENT" };
  if (!allowDuplicate && (await findDuplicate(input, id))) return { ok: false, reason: "DUPLICATE" };

  const { parentAccountIds, ...data } = input;
  const student = await prisma.student.update({
    where: { id },
    data: {
      ...data,
      parents: {
        deleteMany: { parentAccountId: { notIn: parentAccountIds } },
        connectOrCreate: parentAccountIds.map((parentAccountId) => ({
          where: { studentId_parentAccountId: { studentId: id, parentAccountId } },
          create: { parentAccountId },
        })),
      },
    },
    select: studentSelect,
  });
  return { ok: true, student: toView(student) };
}

// Archive, never delete: the student and their records disappear from every view,
// and a super admin can restore them later.
export async function archiveStudent(
  viewer: AccountSummary,
  id: number,
): Promise<{ ok: true } | Denied> {
  if (!canManageStudents(viewer)) return { ok: false, reason: "FORBIDDEN" };

  const existing = await prisma.student.findUnique({ where: { id }, select: { archivedAt: true } });
  if (!existing || existing.archivedAt) return { ok: false, reason: "NOT_FOUND" };

  await prisma.student.update({ where: { id }, data: { archivedAt: new Date() } });
  return { ok: true };
}
