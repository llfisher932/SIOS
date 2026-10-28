import prisma from "../db.js";
import type { AccountStatus, AccountType, StaffRole } from "../generated/prisma/client.js";
import { verifyPassword } from "../auth/password.js";
import { createSessionToken, verifySessionToken } from "../auth/session.js";

// What the client sees about the signed-in account. Names come from the profile.
export type AccountSummary = {
  id: number;
  type: AccountType;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: StaffRole | null; // staff only
};

export type LoginResult =
  | { ok: true; account: AccountSummary; token: string }
  | { ok: false; reason: "INVALID_CREDENTIALS" | "INACTIVE" };

const nameSelect = { select: { firstName: true, lastName: true } } as const;
const profileInclude = {
  parentProfile: nameSelect,
  staffProfile: { select: { firstName: true, lastName: true, role: true } },
} as const;

type Name = { firstName: string; lastName: string } | null;

function toAccountSummary(account: {
  id: number;
  type: AccountType;
  email: string;
  parentProfile: Name;
  staffProfile: (Name & { role: StaffRole }) | null;
}): AccountSummary {
  const profile = account.type === "PARENT" ? account.parentProfile : account.staffProfile;
  return {
    id: account.id,
    type: account.type,
    email: account.email,
    firstName: profile?.firstName ?? null,
    lastName: profile?.lastName ?? null,
    role: account.type === "STAFF" ? (account.staffProfile?.role ?? null) : null,
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Includes passwordHash: never send this to the client.
export function findAccountByEmail(email: string) {
  return prisma.account.findUnique({ where: { email: normalizeEmail(email) } });
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const account = await prisma.account.findUnique({
    where: { email: normalizeEmail(email) },
    include: profileInclude,
  });

  // Same failure for both cases, so emails can't be probed.
  if (!account || !(await verifyPassword(account.passwordHash, password))) {
    return { ok: false, reason: "INVALID_CREDENTIALS" };
  }

  if (account.status !== "ACTIVE") {
    return { ok: false, reason: "INACTIVE" };
  }

  const token = await createSessionToken(account.id, account.type);
  return { ok: true, account: toAccountSummary(account), token };
}

// Re-checks the database so deactivation takes effect immediately.
export async function getSessionAccount(token: string): Promise<AccountSummary | null> {
  const session = await verifySessionToken(token);
  if (!session) return null;

  const account = await prisma.account.findUnique({
    where: { id: session.accountId },
    select: { id: true, type: true, email: true, status: true, passwordChangedAt: true, ...profileInclude },
  });
  if (!account || account.status !== "ACTIVE") return null;

  // Reject sessions issued before the last password change (iat is in seconds).
  if (account.passwordChangedAt && session.issuedAt < Math.floor(account.passwordChangedAt.getTime() / 1000)) {
    return null;
  }

  return toAccountSummary(account);
}

// Creates the account and its profile together, so an account never exists without a name.
export async function createAccount(data: {
  type: AccountType;
  email: string;
  passwordHash: string;
  status?: AccountStatus;
  firstName: string;
  lastName: string;
}): Promise<AccountSummary> {
  const { firstName, lastName, ...account } = data;
  const profile = { create: { firstName, lastName } };

  const created = await prisma.account.create({
    data: {
      ...account,
      email: normalizeEmail(account.email),
      ...(account.type === "PARENT" ? { parentProfile: profile } : { staffProfile: profile }),
    },
    include: profileInclude,
  });
  return toAccountSummary(created);
}
