"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";

export function Protected({
  allowed,
  children,
  fallback,
}: {
  allowed?: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { token, role, ready } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!ready) return;
    if (!token) router.push("/login");
    else if (allowed && role && !allowed.includes(role)) router.push("/dashboard");
  }, [ready, token, role, router, allowed]);

  if (!ready) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading">
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  if (!token) return fallback ?? null;
  if (allowed && role && !allowed.includes(role)) return fallback ?? null;
  return <>{children}</>;
}
