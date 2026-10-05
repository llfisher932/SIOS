import prisma from "../db.js";
import type { AccountStatus, AccountType } from "../generated/prisma/client.js";
import { verifyPassword } from "../auth/password.js";
import { createSessionToken, verifySessionToken } from "../auth/session.js";

export type LoginResult =
  | { ok: true; account: { id: number; type: AccountType; email: string }; token: string }
  | { ok: false; reason: "INVALID_CREDENTIALS" | "INACTIVE" };

// Emails are stored lowercased so the unique constraint is effectively case-insensitive.
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Includes passwordHash for the login check. Never send this result to the client.
export function findAccountByEmail(email: string) {
  return prisma.account.findUnique({ where: { email: normalizeEmail(email) } });
}

// Checks credentials and account status, and issues a session token on success.
export async function login(email: string, password: string): Promise<LoginResult> {
  const account = await findAccountByEmail(email);

  // Unknown email and wrong password are the same failure so we don't reveal which emails exist.
  if (!account || !(await verifyPassword(account.passwordHash, password))) {
    return { ok: false, reason: "INVALID_CREDENTIALS" };
  }

  if (account.status !== "ACTIVE") {
    return { ok: false, reason: "INACTIVE" };
  }

  const token = await createSessionToken(account.id, account.type);
  return { ok: true, account: { id: account.id, type: account.type, email: account.email }, token };
}

// Restores a session from its token. Re-checks the database so a deactivated
// account loses access immediately, even if its token hasn't expired yet.
export async function getSessionAccount(token: string) {
  const accountId = await verifySessionToken(token);
  if (accountId === null) return null;

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { id: true, type: true, email: true, status: true },
  });
  if (!account || account.status !== "ACTIVE") return null;

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
