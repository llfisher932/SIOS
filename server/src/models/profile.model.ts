import prisma from "../db.js";
import type { AccountStatus, StaffRole } from "../generated/prisma/client.js";
import type { AccountSummary } from "./account.model.js";

// Who is looking decides which fields come back:
//   SELF        your own profile (no status)
//   ADMIN       admin viewing a parent (no address or status)
//   SUPER_ADMIN everything
type ViewLevel = "SELF" | "ADMIN" | "SUPER_ADMIN";

type Contact = {
  id: number;
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  authorizedPickup: boolean;
};

export type ParentProfileView = {
  kind: "PARENT";
  accountId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address?: string | null;
  status?: AccountStatus;
  contacts: Contact[];
};

export type StaffProfileView = {
  kind: "STAFF";
  accountId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: StaffRole;
  site: string | null;
  team: string | null;
  status?: AccountStatus; // super admins only
};

export type ProfileListItem = {
  accountId: number;
  kind: "PARENT" | "STAFF";
  firstName: string;
  lastName: string;
  email: string;
  role: StaffRole | null;
};

type Denied = { ok: false; reason: "FORBIDDEN" | "NOT_FOUND" };

const contactSelect = {
  id: true,
  firstName: true,
  lastName: true,
  relationship: true,
  phone: true,
  authorizedPickup: true,
} as const;

function viewerRole(viewer: AccountSummary): StaffRole | null {
  return viewer.type === "STAFF" ? viewer.role : null;
}

export function canViewOtherProfiles(viewer: AccountSummary): boolean {
  const role = viewerRole(viewer);
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

async function findParentProfile(accountId: number, level: ViewLevel): Promise<ParentProfileView | null> {
  const profile = await prisma.parentProfile.findUnique({
    where: { accountId },
    select: {
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
      account: { select: { email: true, status: true } },
      contacts: { select: contactSelect, orderBy: { createdAt: "asc" } },
    },
  });
  if (!profile) return null;

  return {
    kind: "PARENT",
    accountId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.account.email,
    phone: profile.phone,
    ...(level !== "ADMIN" && { address: profile.address }),
    ...(level === "SUPER_ADMIN" && { status: profile.account.status }),
    contacts: profile.contacts,
  };
}

async function findStaffProfile(accountId: number, level: "SELF" | "SUPER_ADMIN"): Promise<StaffProfileView | null> {
  const profile = await prisma.staffProfile.findUnique({
    where: { accountId },
    select: {
      firstName: true,
      lastName: true,
      role: true,
      site: true,
      team: true,
      account: { select: { email: true, status: true } },
    },
  });
  if (!profile) return null;

  const { account, ...rest } = profile;
  return {
    kind: "STAFF",
    accountId,
    ...rest,
    email: account.email,
    ...(level === "SUPER_ADMIN" && { status: account.status }),
  };
}

export async function getOwnProfile(
  viewer: AccountSummary,
): Promise<{ ok: true; profile: ParentProfileView | StaffProfileView } | Denied> {
  const profile =
    viewer.type === "PARENT" ? await findParentProfile(viewer.id, "SELF") : await findStaffProfile(viewer.id, "SELF");
  return profile ? { ok: true, profile } : { ok: false, reason: "NOT_FOUND" };
}

// Admins see parents; super admins see parents and staff.
export async function listProfiles(viewer: AccountSummary): Promise<{ ok: true; profiles: ProfileListItem[] } | Denied> {
  if (!canViewOtherProfiles(viewer)) return { ok: false, reason: "FORBIDDEN" };
  const includeStaff = viewerRole(viewer) === "SUPER_ADMIN";

  const accounts = await prisma.account.findMany({
    where: includeStaff ? {} : { type: "PARENT" },
    select: {
      id: true,
      type: true,
      email: true,
      parentProfile: { select: { firstName: true, lastName: true } },
      staffProfile: { select: { firstName: true, lastName: true, role: true } },
    },
  });

  const profiles = accounts.flatMap((a): ProfileListItem[] => {
    const profile = a.type === "PARENT" ? a.parentProfile : a.staffProfile;
    if (!profile) return [];
    return [
      {
        accountId: a.id,
        kind: a.type,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: a.email,
        role: a.staffProfile?.role ?? null,
      },
    ];
  });
  profiles.sort((x, y) => x.lastName.localeCompare(y.lastName) || x.firstName.localeCompare(y.firstName));
  return { ok: true, profiles };
}

export async function getProfile(
  viewer: AccountSummary,
  accountId: number,
): Promise<{ ok: true; profile: ParentProfileView | StaffProfileView } | Denied> {
  if (!canViewOtherProfiles(viewer)) return { ok: false, reason: "FORBIDDEN" };
  const role = viewerRole(viewer);

  const account = await prisma.account.findUnique({ where: { id: accountId }, select: { type: true } });
  if (!account) return { ok: false, reason: "NOT_FOUND" };

  if (account.type === "STAFF") {
    if (role !== "SUPER_ADMIN") return { ok: false, reason: "FORBIDDEN" };
    const profile = await findStaffProfile(accountId, "SUPER_ADMIN");
    return profile ? { ok: true, profile } : { ok: false, reason: "NOT_FOUND" };
  }

  const profile = await findParentProfile(accountId, role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN");
  return profile ? { ok: true, profile } : { ok: false, reason: "NOT_FOUND" };
}
