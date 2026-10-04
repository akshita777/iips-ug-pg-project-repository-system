"use client";

import * as React from "react";
import Link from "next/link";
import api from "@/lib/api";
import { apiErrorMessage, type Project } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { Protected } from "@/components/layout/protected";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";

export default function DashboardPage() {
  const { role, email, logout } = useAuth();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [unread, setUnread] = React.useState<number | null>(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    api
      .get<Project[]>("/projects")
      .then((res) => setProjects(res.data))
      .catch((e) => setError(apiErrorMessage(e, "Backend is offline. Showing static overview.")));
    api
      .get<{ count?: number; unread?: number }>("/notifications/unread-count")
      .then((res) => setUnread(res.data.count ?? res.data.unread ?? 0))
      .catch(() => setUnread(null));
  }, []);

  const underReview = projects.filter((p) => p.status === "UNDER_REVIEW" || p.status === "SUBMITTED").length;
  const evaluated = projects.filter((p) => p.status === "EVALUATED" || p.status === "APPROVED").length;

  return (
    <Protected>
      <div className="space-y-6">
        {error && <Alert tone="warn">{error}</Alert>}
        <div className="brutal-card bg-white p-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black">{role ?? "STUDENT"} Dashboard</h1>
            <p className="mt-1 text-sm text-ink/70">
              {email ?? "Your projects, versions, and evaluation results."}
              {unread !== null && unread > 0 && ` You have ${unread} unread notifications.`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={role ?? "STUDENT"} className="bg-ink text-white" />
            <button type="button" onClick={logout} className="brutal-badge cursor-pointer bg-danger text-dangerInk">
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Card className="bg-primary brutal-card-hover text-white">
            <CardTitle>{projects.length} projects</CardTitle>
            <CardDescription className="!text-white">Live from GET /projects.</CardDescription>
            <Link href="/projects" className="brutal-btn bg-white text-sm mt-3">
              Open projects
            </Link>
          </Card>
          <Card className="bg-warn brutal-card-hover">
            <CardTitle>{underReview} in review</CardTitle>
            <CardDescription className="!text-ink/70">Submitted plus under review right now.</CardDescription>
            <Link href="/guide/reviews" className="brutal-btn bg-white text-sm mt-3">
              Review queue
            </Link>
          </Card>
          <Card className="bg-success brutal-card-hover">
            <CardTitle>{evaluated} evaluated</CardTitle>
            <CardDescription className="!text-ink/70">Approved plus evaluated outcomes.</CardDescription>
            <Link href="/notifications" className="brutal-btn bg-white text-sm mt-3">
              Notifications{unread ? ` (${unread})` : ""}
            </Link>
          </Card>
        </div>

        <div className="brutal-card bg-white p-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-display font-bold">Workflows:</span>
          <Link href="/projects/new" className="brutal-badge bg-primary text-white">Submit</Link>
          <Link href="/coordinator/allocation" className="brutal-badge bg-lilac">Allocation</Link>
          <Link href="/evaluator/assigned" className="brutal-badge bg-accent">Evaluate</Link>
          <Link href="/admin/users" className="brutal-badge bg-secondary">Admin</Link>
        </div>
      </div>
    </Protected>
  );
}
