import type { RequestHandler, Response } from "express";
import * as accountModel from "../models/account.model.js";
import type { AccountSummary } from "../models/account.model.js";
import { SESSION_COOKIE } from "../auth/session.js";

// Rejects requests without a valid session; otherwise stores the account on res.locals.
export const requireAuth: RequestHandler = async (req, res, next) => {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  const account = typeof token === "string" ? await accountModel.getSessionAccount(token) : null;

  if (!account) {
    res.status(401).json({ error: "Not signed in." });
    return;
  }
  res.locals.account = account;
  next();
};

// Only valid after requireAuth.
export function currentAccount(res: Response): AccountSummary {
  return res.locals.account as AccountSummary;
}
