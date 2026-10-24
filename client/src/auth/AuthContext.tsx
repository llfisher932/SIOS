import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import * as api from "../api/api";
import type { Account } from "../api/api";

type AuthContextValue = {
  account: Account | null;
  // True until we've asked the server whether the session cookie is still valid.
  loading: boolean;
  login: (email: string, password: string) => Promise<Account>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Holds the signed-in account for the whole app, restoring it from the session cookie on load.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        setAccount(await api.getSession());
      } catch {
        setAccount(null); // server unreachable: treat as signed out
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const signedIn = await api.login(email, password);
    setAccount(signedIn);
    return signedIn;
  };

  // Clears the cookie on the server, then the local account. The local state is
  // cleared even if the request fails, so the user is never left looking signed in.
  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setAccount(null);
    }
  };

  return <AuthContext.Provider value={{ account, loading, login, logout }}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>.");
  return ctx;
};
