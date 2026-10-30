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

// Students:

export type StudentStatus = "ACTIVE" | "INACTIVE";

// On hold until the client confirms they want students created in SIOS.
// Flip to true here and in server/src/router/student.router.ts to turn it back on.
export const STUDENT_CREATION_ENABLED = false;

// Programs and sites Team Nitro runs today. The server stores plain strings,
// so changing these lists doesn't break existing students.
export const PROGRAMS = ["Youth MMA", "Little Ninjas", "Teen Mentoring"] as const;
export const SITES = ["Impact", "Zarephath"] as const;
export const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"] as const;
export const GRADES = ["K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"] as const;

export type StudentListItem = {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  grade: string | null;
  program: string;
  site: string;
  status: StudentStatus;
  updatedAt: string;
};

export type StudentParent = {
  accountId: number;
  firstName: string;
  lastName: string;
  email: string;
};

export type Student = {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string | null;
  school: string | null;
  grade: string | null;
  program: string;
  site: string;
  enrollmentDate: string;
  status: StudentStatus;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;
  medicalNotes: string | null;
  updatedAt: string;
  parents: StudentParent[];
};

// Dates are "yyyy-mm-dd"; phones are 10 digits, no formatting.
export type StudentInput = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  school: string;
  grade: string;
  program: string;
  site: string;
  enrollmentDate: string;
  status: StudentStatus;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  medicalNotes: string;
  parentAccountIds: number[];
};

export type StudentFilters = { q: string; program: string; site: string; status: "" | StudentStatus };

export function canManageStudents(account: Account): boolean {
  return account.role === "ADMIN" || account.role === "SUPER_ADMIN";
}

// "S-00042" — the Student ID shown everywhere in the UI.
export function displayStudentId(id: number): string {
  return `S-${String(id).padStart(5, "0")}`;
}

export function studentAge(dateOfBirth: string): number {
  const dob = new Date(`${dateOfBirth.slice(0, 10)}T00:00:00`);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) age--;
  return age;
}

export async function searchStudents(filters: StudentFilters): Promise<StudentListItem[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
  const { students } = await request<{ students: StudentListItem[] }>(`/students?${params}`);
  return students;
}

export async function getStudent(id: number): Promise<Student> {
  const { student } = await request<{ student: Student }>(`/students/${id}`);
  return student;
}

// A 409 means a student with the same name and date of birth exists;
// pass allowDuplicate after the admin confirms (see use case 3.4.2).
export async function createStudent(input: StudentInput, allowDuplicate = false): Promise<Student> {
  const { student } = await request<{ student: Student }>("/students", {
    method: "POST",
    body: JSON.stringify({ ...input, allowDuplicate }),
  });
  return student;
}

export async function updateStudent(id: number, input: StudentInput, allowDuplicate = false): Promise<Student> {
  const { student } = await request<{ student: Student }>(`/students/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...input, allowDuplicate }),
  });
  return student;
}

// Archives the student; a super admin can restore them later.
export async function deleteStudent(id: number): Promise<void> {
  await request<null>(`/students/${id}`, { method: "DELETE" });
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
