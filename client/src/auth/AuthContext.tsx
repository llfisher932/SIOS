import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import * as api from "../api/api";
import type { Account } from "../api/api";

type AuthContextValue = {
  account: Account | null;
  login: (email: string, password: string) => Promise<Account>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Holds the signed-in account for the whole app.
// Note: this lives in memory only, so a page refresh returns you to login
// until the server has an endpoint to restore the session from the cookie.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<Account | null>(null);

  const login = async (email: string, password: string) => {
    const signedIn = await api.login(email, password);
    setAccount(signedIn);
    return signedIn;
  };

  // Client-side only for now; the session cookie stays until it expires.
  const logout = () => setAccount(null);

  return <AuthContext.Provider value={{ account, login, logout }}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>.");
  return ctx;
};
