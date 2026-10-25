import prisma from "../db.js";
import { hashPassword } from "../auth/password.js";
import { RESET_TOKEN_MINUTES, generateResetToken, hashResetToken } from "../auth/resetToken.js";
import { sendPasswordResetEmail } from "../mail/mailer.js";
import { normalizeEmail } from "./account.model.js";

export const MIN_PASSWORD_LENGTH = 8;
// One reset email per account per window, so the form can't flood an inbox.
const THROTTLE_MINUTES = 2;

const APP_URL = process.env.APP_URL ?? "http://localhost:5173";

// Returns nothing either way, so callers can't tell which emails have accounts.
export async function requestPasswordReset(email: string): Promise<void> {
  const account = await prisma.account.findUnique({ where: { email: normalizeEmail(email) } });
  if (!account || account.status !== "ACTIVE") return;

  const throttleStart = new Date(Date.now() - THROTTLE_MINUTES * 60 * 1000);
  const recent = await prisma.passwordResetToken.findFirst({
    where: { accountId: account.id, createdAt: { gt: throttleStart } },
  });
  if (recent) return;

  const { token, tokenHash } = generateResetToken();
  const now = new Date();
  await prisma.$transaction([
    // Only the newest link works.
    prisma.passwordResetToken.updateMany({
      where: { accountId: account.id, usedAt: null },
      data: { usedAt: now },
    }),
    prisma.passwordResetToken.create({
      data: {
        accountId: account.id,
        tokenHash,
        expiresAt: new Date(now.getTime() + RESET_TOKEN_MINUTES * 60 * 1000),
      },
    }),
  ]);

  const link = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await sendPasswordResetEmail(account.email, link, RESET_TOKEN_MINUTES, `password-reset/${tokenHash}`);
}

export type ResetResult = { ok: true } | { ok: false; reason: "INVALID_TOKEN" | "WEAK_PASSWORD" };

export async function resetPassword(token: string, newPassword: string): Promise<ResetResult> {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, reason: "WEAK_PASSWORD" };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
    include: { account: { select: { status: true } } },
  });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date() || resetToken.account.status !== "ACTIVE") {
    return { ok: false, reason: "INVALID_TOKEN" };
  }

  const passwordHash = await hashPassword(newPassword);
  const now = new Date();
  await prisma.$transaction([
    prisma.account.update({
      where: { id: resetToken.accountId },
      data: { passwordHash, passwordChangedAt: now },
    }),
    // Invalidate this and any other outstanding links.
    prisma.passwordResetToken.updateMany({
      where: { accountId: resetToken.accountId, usedAt: null },
      data: { usedAt: now },
    }),
  ]);

  return { ok: true };
}
