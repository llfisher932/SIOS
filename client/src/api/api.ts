// All calls to the SIOS server go through this file.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type Account = {
  id: number;
  type: "STAFF" | "PARENT";
  email: string;
};

// Sends a JSON request and returns the parsed body.
// Throws an Error with the server's message so callers can show it directly (e.g. in a toast).
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      credentials: "include", // send/receive the session cookie
    });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error ?? "Something went wrong. Please try again.");
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
