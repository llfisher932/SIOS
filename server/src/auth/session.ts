import "dotenv/config";
import type { CookieOptions } from "express";
import { SignJWT } from "jose";
import type { AccountType } from "../generated/prisma/client.js";

export const SESSION_COOKIE = "sios_session";
const SESSION_HOURS = 8;

const secretValue = process.env.JWT_SECRET;
if (!secretValue || secretValue.length < 32) {
  throw new Error("JWT_SECRET must be set in server/.env and be at least 32 characters.");
}
const secret = new TextEncoder().encode(secretValue);

export function createSessionToken(accountId: number, type: AccountType): Promise<string> {
  return new SignJWT({ type })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(accountId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secret);
}

// httpOnly keeps the token away from page JavaScript; secure is required once we're on HTTPS.
export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_HOURS * 60 * 60 * 1000,
};
