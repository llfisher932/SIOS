import type { Request, Response } from "express";
import * as studentModel from "../models/student.model.js";
import type { StudentInput } from "../models/student.model.js";
import { currentAccount } from "../middleware/requireAuth.js";

const DENIED = {
  FORBIDDEN: { status: 403, error: "You don't have access to student records." },
  NOT_FOUND: { status: 404, error: "That student wasn't found." },
  DUPLICATE: {
    status: 409,
    error: "A student with the same name and date of birth already exists.",
  },
  BAD_PARENT: { status: 400, error: "One of the linked parent accounts wasn't found." },
} as const;

function parseId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function sendDenied(res: Response, reason: keyof typeof DENIED) {
  const { status, error } = DENIED[reason];
  res.status(status).json({ error });
}

const STATUSES = ["ACTIVE", "INACTIVE"] as const;

// Returns the value only if it's one of the allowed options.
function pick<T extends string>(value: unknown, options: readonly T[]): T | undefined {
  return options.find((option) => option === value);
}

// Trimmed string, or null for anything empty or missing.
function optional(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

// Dates arrive as "yyyy-mm-dd"; anything else is invalid.
function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

// Mirrors the client-side checks; the server is the gatekeeper (see use case 3.4.1).
function parseStudentInput(body: unknown): { ok: true; input: StudentInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Missing request body." };
  const b = body as Record<string, unknown>;

  const firstName = optional(b.firstName);
  const lastName = optional(b.lastName);
  if (!firstName || !lastName) return { ok: false, error: "First and last name are required." };

  const dateOfBirth = parseDate(b.dateOfBirth);
  if (!dateOfBirth) return { ok: false, error: "Enter a valid date of birth." };
  if (dateOfBirth.getTime() > Date.now()) return { ok: false, error: "Date of birth can't be in the future." };

  const program = optional(b.program);
  const site = optional(b.site);
  if (!program || !site) return { ok: false, error: "Program and site are required." };

  const enrollmentDate = parseDate(b.enrollmentDate);
  if (!enrollmentDate) return { ok: false, error: "Enter a valid enrollment date." };

  const status = pick(b.status, STATUSES);
  if (!status) return { ok: false, error: "Status is required." };

  const guardianName = optional(b.guardianName);
  if (!guardianName) return { ok: false, error: "Guardian name is required." };

  const guardianPhone = digitsOnly(optional(b.guardianPhone) ?? "");
  if (guardianPhone.length !== 10) return { ok: false, error: "Enter a valid 10-digit guardian phone number." };

  const guardianEmail = optional(b.guardianEmail);
  if (!guardianEmail || !/^\S+@\S+\.\S+$/.test(guardianEmail))
    return { ok: false, error: "Enter a valid guardian email address." };

  const emergencyContactPhone = optional(b.emergencyContactPhone);
  const emergencyDigits = emergencyContactPhone ? digitsOnly(emergencyContactPhone) : null;
  if (emergencyDigits && emergencyDigits.length !== 10)
    return { ok: false, error: "Enter a valid 10-digit emergency contact phone number." };

  const parentAccountIds = Array.isArray(b.parentAccountIds)
    ? b.parentAccountIds.filter((id): id is number => Number.isInteger(id) && (id as number) > 0)
    : [];
  if (Array.isArray(b.parentAccountIds) && parentAccountIds.length !== b.parentAccountIds.length)
    return { ok: false, error: "One of the linked parent accounts wasn't found." };

  return {
    ok: true,
    input: {
      firstName,
      lastName,
      dateOfBirth,
      gender: optional(b.gender),
      school: optional(b.school),
      grade: optional(b.grade),
      program,
      site,
      enrollmentDate,
      status,
      guardianName,
      guardianPhone,
      guardianEmail: guardianEmail.toLowerCase(),
      emergencyContactName: optional(b.emergencyContactName),
      emergencyContactPhone: emergencyDigits,
      emergencyContactRelationship: optional(b.emergencyContactRelationship),
      medicalNotes: optional(b.medicalNotes),
      parentAccountIds,
    },
  };
}

export async function searchStudents(req: Request, res: Response) {
  const { q, program, site, status } = req.query;
  const result = await studentModel.searchStudents(currentAccount(res), {
    q: typeof q === "string" ? q : undefined,
    program: typeof program === "string" && program ? program : undefined,
    site: typeof site === "string" && site ? site : undefined,
    status: pick(status, STATUSES),
  });
  if (!result.ok) return sendDenied(res, result.reason);
  res.json({ students: result.students });
}

export async function getStudent(req: Request, res: Response) {
  const id = parseId(req);
  if (!id) return sendDenied(res, "NOT_FOUND");

  const result = await studentModel.getStudent(currentAccount(res), id);
  if (!result.ok) return sendDenied(res, result.reason);
  res.json({ student: result.student });
}

export async function createStudent(req: Request, res: Response) {
  const parsed = parseStudentInput(req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  const result = await studentModel.createStudent(
    currentAccount(res),
    parsed.input,
    req.body?.allowDuplicate === true,
  );
  if (!result.ok) return sendDenied(res, result.reason);
  res.status(201).json({ student: result.student });
}

export async function updateStudent(req: Request, res: Response) {
  const id = parseId(req);
  if (!id) return sendDenied(res, "NOT_FOUND");

  const parsed = parseStudentInput(req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  const result = await studentModel.updateStudent(
    currentAccount(res),
    id,
    parsed.input,
    req.body?.allowDuplicate === true,
  );
  if (!result.ok) return sendDenied(res, result.reason);
  res.json({ student: result.student });
}

// Archives rather than deletes; see the model.
export async function deleteStudent(req: Request, res: Response) {
  const id = parseId(req);
  if (!id) return sendDenied(res, "NOT_FOUND");

  const result = await studentModel.archiveStudent(currentAccount(res), id);
  if (!result.ok) return sendDenied(res, result.reason);
  res.status(204).end();
}
