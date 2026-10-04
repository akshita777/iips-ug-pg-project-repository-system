"use client";

import * as React from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Alert } from "@/components/ui/alert";

interface Me {
  role: string;
  rollNumber?: string | null;
}

// Blocks the submission form until a student profile is complete.
// GitHub and admin-created accounts can lack a roll number; sending them to
// the form anyway would fail server-side with a confusing error.
export function SubmitGate({ children }: { children: React.ReactNode }) {
  const { ready } = useAuth();
  const [state, setState] = React.useState<"loading" | "ok" | "incomplete" | "error">("loading");

  React.useEffect(() => {
    if (!ready) return;
    api
      .get<Me>("/users/me")
      .then((res) => {
        const me = res.data;
        setState(me.role === "STUDENT" && !me.rollNumber ? "incomplete" : "ok");
      })
      .catch(() => setState("error"));
  }, [ready]);

  if (state === "loading") {
    return (
      <div className="card" aria-busy="true" aria-label="Loading">
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  if (state === "incomplete") {
    return (
      <div className="card text-center space-y-4">
        <span className="kicker">One step left</span>
        <h2 className="text-xl font-extrabold">Complete your profile first</h2>
        <p className="muted">
          Project submission needs your roll number and semester on record.
          It takes less than a minute.
        </p>
        <Link href="/auth/complete-profile" className="btn btn-amber">
          Complete profile
        </Link>
      </div>
    );
  }

  if (state === "error") {
    return <Alert tone="warn">Could not check your profile. Reload the page to try again.</Alert>;
  }

  return <>{children}</>;
}
