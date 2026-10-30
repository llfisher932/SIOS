// Same-origin by default: Vercel and the Vite dev proxy both route /api/* to the server.
const API_URL = `${import.meta.env.VITE_API_URL ?? ""}/api`;

export type Account = {
  id: number;
  type: "STAFF" | "PARENT";
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: StaffRole | null; // staff only
};

export type StaffRole = "STAFF" | "ADMIN" | "SUPER_ADMIN";

export const ROLE_LABELS: Record<StaffRole, string> = {
  STAFF: "Staff",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

export function canViewOtherProfiles(account: Account): boolean {
  return account.role === "ADMIN" || account.role === "SUPER_ADMIN";
}

// Falls back to email for accounts without a profile.
export function displayName(account: Account): string {
  const name = [account.firstName, account.lastName].filter(Boolean).join(" ");
  return name || account.email;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      credentials: "include", // send the session cookie
    });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body (e.g. 204)
  }
  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? "Something went wrong. Please try again.");
  }
  return body as T;
}

export async function login(email: string, password: string): Promise<Account> {
  const { account } = await request<{ account: Account }>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return account;
}

export async function getSession(): Promise<Account | null> {
  try {
    const { account } = await request<{ account: Account }>("/login/session");
    return account;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

export async function logout(): Promise<void> {
  await request<null>("/login/logout", { method: "POST" });
}

export async function requestPasswordReset(email: string): Promise<string> {
  const { message } = await request<{ message: string }>("/password/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return message;
}

export async function resetPassword(token: string, password: string): Promise<string> {
  const { message } = await request<{ message: string }>("/password/reset", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
  return message;
}

export type AccountStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export type Contact = {
  id: number;
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  authorizedPickup: boolean;
};

// Fields the viewer isn't allowed to see are left out.
export type ParentProfile = {
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

export type StaffProfile = {
  kind: "STAFF";
  accountId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: StaffRole;
  site: string | null;
  team: string | null;
  status?: AccountStatus;
};

export type ProfileListItem = {
  accountId: number;
  kind: "PARENT" | "STAFF";
  firstName: string;
  lastName: string;
  email: string;
  role: StaffRole | null;
  site: string | null;
  team: string | null;
  status?: AccountStatus;
};

// Empty values are left off; the server ignores filters the viewer can't use.
export type ProfileFilters = { q: string; type: "" | "PARENT" | "STAFF"; status: "" | AccountStatus };

export async function getMyProfile(): Promise<ParentProfile | StaffProfile> {
  const { profile } = await request<{ profile: ParentProfile | StaffProfile }>("/profiles/me");
  return profile;
}

export async function searchProfiles(filters: ProfileFilters): Promise<ProfileListItem[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
  const { profiles } = await request<{ profiles: ProfileListItem[] }>(`/profiles?${params}`);
  return profiles;
}

export async function getProfile(accountId: number): Promise<ParentProfile | StaffProfile> {
  const { profile } = await request<{ profile: ParentProfile | StaffProfile }>(`/profiles/${accountId}`);
  return profile;
}

// Permanent. Returns the updated profile.
export async function deactivateProfile(accountId: number): Promise<ParentProfile | StaffProfile> {
  const { profile } = await request<{ profile: ParentProfile | StaffProfile }>(`/profiles/${accountId}/deactivate`, {
    method: "POST",
  });
  return profile;
}

// FormTemplates:

export type FormTemplate = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  editedAt: string;
};

export type CreatedFormTemplate = {
  title: string;
  description: string;
};

export async function getFormTemplate(id: number): Promise<FormTemplate> {
  const formTemplate = await request<FormTemplate>(`/formTemplates/manager/${id}`);
  return formTemplate;
}

export async function getAllForms(): Promise<FormTemplate[]> {
  const formTemplates = await request<FormTemplate[]>(`/formTemplates`);
  return formTemplates;
}

export async function updateFormTemplate(id: number, template: CreatedFormTemplate): Promise<FormTemplate> {
  return request<FormTemplate>(`/formTemplates/manager/${id}`, {
    method: "PUT",
    body: JSON.stringify(template),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function createFormTemplate(template: CreatedFormTemplate): Promise<FormTemplate> {
  return request<FormTemplate>(`/formTemplates`, {
    method: "POST",
    body: JSON.stringify(template),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
export async function deleteFormTemplate(id: number) {
  return request<FormTemplate>(`/formTemplates/${id}`, {
    method: "DELETE",
  });
}
