/**
 * Zentraler Auth-Zustand: aktuelle Sitzung plus Aktionen
 * (login, signup, redeem, logout). Persistiert die Sitzung in localStorage,
 * sodass ein Neuladen der Seite eingeloggt bleibt.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authClient } from "@/lib/authClient";
import type { Credentials, LicenseInfo, Session } from "@/lib/types";

const SESSION_KEY = "keyauth.session";

interface AuthContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  signup: (credentials: Credentials) => Promise<void>;
  redeemLicense: (licenseKey: string) => Promise<LicenseInfo>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession);

  // Sitzung gespiegelt in localStorage halten.
  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const login = useCallback(async (credentials: Credentials) => {
    const next = await authClient.login(credentials);
    setSession(next);
  }, []);

  const signup = useCallback(async (credentials: Credentials) => {
    const next = await authClient.signup(credentials);
    setSession(next);
  }, []);

  const redeemLicense = useCallback(
    async (licenseKey: string): Promise<LicenseInfo> => {
      const active = loadSession();
      if (!active) {
        throw new Error("Keine aktive Sitzung.");
      }
      const license = await authClient.redeemLicense(active.token, licenseKey);
      setSession({ ...active, license });
      return license;
    },
    [],
  );

  const logout = useCallback(() => {
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      login,
      signup,
      redeemLicense,
      logout,
    }),
    [session, login, signup, redeemLicense, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth muss innerhalb von <AuthProvider> verwendet werden.");
  }
  return ctx;
}
