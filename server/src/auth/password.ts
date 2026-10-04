import argon2 from "argon2";

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    // Malformed hash in the DB so treat as a failed match.
    return false;
  }
}
