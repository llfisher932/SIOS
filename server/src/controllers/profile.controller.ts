import type { Request, Response } from "express";
import * as profileModel from "../models/profile.model.js";
import * as accountModel from "../models/account.model.js";
import { currentAccount } from "../middleware/requireAuth.js";

const DENIED = {
  FORBIDDEN: { status: 403, error: "You don't have access to this profile." },
  NOT_FOUND: { status: 404, error: "That profile wasn't found." },
  SELF: { status: 400, error: "You can't deactivate your own profile." },
  ALREADY_DEACTIVATED: { status: 409, error: "This profile is already deactivated." },
} as const;

// Profile ids are account ids; anything else is treated as not found.
function parseId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function sendDenied(res: Response, reason: keyof typeof DENIED) {
  const { status, error } = DENIED[reason];
  res.status(status).json({ error });
}

export async function getOwnProfile(_req: Request, res: Response) {
  const result = await profileModel.getOwnProfile(currentAccount(res));
  if (!result.ok) return sendDenied(res, result.reason);
  res.json({ profile: result.profile });
}

const TYPES = ["PARENT", "STAFF"] as const;
const STATUSES = ["ACTIVE", "PENDING", "INACTIVE"] as const;

// Returns the value only if it's one of the allowed options.
function pick<T extends string>(value: unknown, options: readonly T[]): T | undefined {
  return options.find((option) => option === value);
}

export async function searchProfiles(req: Request, res: Response) {
  const { q, type, status } = req.query;
  const result = await profileModel.searchProfiles(currentAccount(res), {
    q: typeof q === "string" ? q : undefined,
    type: pick(type, TYPES),
    status: pick(status, STATUSES),
  });
  if (!result.ok) return sendDenied(res, result.reason);
  res.json({ profiles: result.profiles });
}

export async function getProfile(req: Request, res: Response) {
  const accountId = parseId(req);
  if (!accountId) return sendDenied(res, "NOT_FOUND");

  const result = await profileModel.getProfile(currentAccount(res), accountId);
  if (!result.ok) return sendDenied(res, result.reason);
  res.json({ profile: result.profile });
}

// Responds with the updated profile so the page can show the new status.
export async function deactivateProfile(req: Request, res: Response) {
  const accountId = parseId(req);
  if (!accountId) return sendDenied(res, "NOT_FOUND");

  const viewer = currentAccount(res);
  const result = await accountModel.deactivateAccount(viewer, accountId);
  if (!result.ok) return sendDenied(res, result.reason);

  const updated = await profileModel.getProfile(viewer, accountId);
  if (!updated.ok) return sendDenied(res, updated.reason);
  res.json({ profile: updated.profile });
}
