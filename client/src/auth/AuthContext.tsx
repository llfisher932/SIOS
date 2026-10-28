import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import * as api from "../api/api";
import type { Account } from "../api/api";

type AuthContextValue = {
  account: Account | null;
  // True until the session check finishes.
  loading: boolean;
  login: (email: string, password: string) => Promise<Account>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        setAccount(await api.getSession());
      } catch {
        setAccount(null); // server unreachable
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

  // Clear local state even if the request fails.
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
