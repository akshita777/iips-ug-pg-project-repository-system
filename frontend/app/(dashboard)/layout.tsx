"use client";

import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();

  return (
    <div className="grid gap-5 md:grid-cols-[220px_1fr]">
      <Sidebar role={role ?? "STUDENT"} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
