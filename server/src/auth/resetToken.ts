import { createHash, randomBytes } from "node:crypto";

export const RESET_TOKEN_MINUTES = 30;

// A fast hash is fine: the token is 256 random bits, not a guessable password.
export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}
