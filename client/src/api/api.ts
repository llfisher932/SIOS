// All calls to the SIOS server go through this file.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type Account = {
  id: number;
  type: "STAFF" | "PARENT";
  email: string;
};

// Error thrown for non-2xx responses; status lets callers tell "not signed in" from real failures.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

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

  // Some responses (e.g. 204) have no JSON body.
  let body = null;
  try {
    body = await res.json();
  } catch {
    // leave body as null
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

// Who's signed in according to the session cookie, or null if nobody is.
export async function getSession(): Promise<Account | null> {
  try {
    const { account } = await request<{ account: Account }>("/login/session");
    return account;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}
