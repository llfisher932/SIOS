import type { Request, Response } from "express";
import * as accountModel from "../models/account.model.js";
import { SESSION_COOKIE, sessionCookieOptions } from "../auth/session.js";

const LOGIN_ERRORS = {
  INVALID_CREDENTIALS: { status: 401, error: "That email and password combination didn't match our records." },
  INACTIVE: { status: 403, error: "This account is not active. Please contact your site's front desk." },
} as const;

export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const result = await accountModel.login(email, password);
  if (!result.ok) {
    const { status, error } = LOGIN_ERRORS[result.reason];
    res.status(status).json({ error });
    return;
  }

  res.cookie(SESSION_COOKIE, result.token, sessionCookieOptions);
  res.json({ account: result.account });
}

// Lets the client restore who's signed in (e.g. after a page refresh) from the session cookie.
export async function session(req: Request, res: Response) {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  const account = typeof token === "string" ? await accountModel.getSessionAccount(token) : null;

  if (!account) {
    res.status(401).json({ error: "Not signed in." });
    return;
  }
  res.json({ account });
}
