import prisma from "../db.js";
import type { AccountStatus, AccountType } from "../generated/prisma/client.js";
import { verifyPassword } from "../auth/password.js";
import { createSessionToken, verifySessionToken } from "../auth/session.js";

export type LoginResult =
  | { ok: true; account: { id: number; type: AccountType; email: string }; token: string }
  | { ok: false; reason: "INVALID_CREDENTIALS" | "INACTIVE" };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Includes passwordHash: never send this to the client.
export function findAccountByEmail(email: string) {
  return prisma.account.findUnique({ where: { email: normalizeEmail(email) } });
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const account = await findAccountByEmail(email);

  // Same failure for both cases, so emails can't be probed.
  if (!account || !(await verifyPassword(account.passwordHash, password))) {
    return { ok: false, reason: "INVALID_CREDENTIALS" };
  }

  if (account.status !== "ACTIVE") {
    return { ok: false, reason: "INACTIVE" };
  }

  const token = await createSessionToken(account.id, account.type);
  return { ok: true, account: { id: account.id, type: account.type, email: account.email }, token };
}

// Re-checks the database so deactivation takes effect immediately.
export async function getSessionAccount(token: string) {
  const session = await verifySessionToken(token);
  if (!session) return null;

  const account = await prisma.account.findUnique({
    where: { id: session.accountId },
    select: { id: true, type: true, email: true, status: true, passwordChangedAt: true },
  });
  if (!account || account.status !== "ACTIVE") return null;

  // Reject sessions issued before the last password change (iat is in seconds).
  if (account.passwordChangedAt && session.issuedAt < Math.floor(account.passwordChangedAt.getTime() / 1000)) {
    return null;
  }

  return { id: account.id, type: account.type, email: account.email };
}

//needed for testing now
export function createAccount(data: {
  type: AccountType;
  email: string;
  passwordHash: string;
  status?: AccountStatus;
}) {
  return prisma.account.create({
    data: { ...data, email: normalizeEmail(data.email) },
    select: { id: true, type: true, email: true, status: true },
  });
}
