import type { Request, Response } from "express";
import * as passwordResetModel from "../models/passwordReset.model.js";

const RESET_ERRORS = {
  INVALID_TOKEN: { status: 400, error: "This reset link is invalid or has expired. Please request a new one." },
  WEAK_PASSWORD: {
    status: 400,
    error: `Your new password must be at least ${passwordResetModel.MIN_PASSWORD_LENGTH} characters.`,
  },
} as const;

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body ?? {};
  if (typeof email !== "string" || !email.trim()) {
    res.status(400).json({ error: "Email is required." });
    return;
  }

  await passwordResetModel.requestPasswordReset(email);
  // Same response either way, so emails can't be probed.
  res.json({ message: "If an account exists for that email, we've sent a link to reset your password." });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body ?? {};
  if (typeof token !== "string" || !token || typeof password !== "string") {
    res.status(400).json({ error: "Reset token and new password are required." });
    return;
  }

  const result = await passwordResetModel.resetPassword(token, password);
  if (!result.ok) {
    const { status, error } = RESET_ERRORS[result.reason];
    res.status(status).json({ error });
    return;
  }

  res.json({ message: "Your password has been updated. You can now sign in." });
}
