"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Role } from "./types";

interface AuthState {
  token: string | null;
  role: Role | null;
  email: string | null;
  ready: boolean;
  login: (token: string, refreshToken: string, role: Role, email: string) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthState | null>(null);

function readAuth(): { token: string | null; role: Role | null; email: string | null } {
  if (typeof window === "undefined") return { token: null, role: null, email: null };
  return {
    token: localStorage.getItem("token"),
    role: (localStorage.getItem("role") as Role | null) ?? null,
    email: localStorage.getItem("email"),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = React.useState<{ token: string | null; role: Role | null; email: string | null }>({
    token: null,
    role: null,
    email: null,
  });
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setState(readAuth());
    setReady(true);
  }, []);

  const login = React.useCallback((token: string, refreshToken: string, role: Role, email: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("role", role);
    localStorage.setItem("email", email);
    setState({ token, role, email });
  }, []);

  const logout = React.useCallback(() => {
    localStorage.clear();
    setState({ token: null, role: null, email: null });
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function useRequireAuth(allowed?: Role[]) {
  const auth = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!auth.ready) return;
    if (!auth.token) {
      router.push("/login");
      return;
    }
    if (allowed && auth.role && !allowed.includes(auth.role)) {
      router.push("/dashboard");
    }
  }, [auth.ready, auth.token, auth.role, router, allowed]);

  return auth;
}
