"use client";

import * as React from "react";
import Link from "next/link";
import api from "@/lib/api";
import { apiErrorMessage, type Project } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { Protected } from "@/components/layout/protected";
import { PageBand } from "@/components/layout/page-band";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { n } from "@/lib/format";
import { usePageTitle } from "@/lib/use-title";

export default function DashboardPage() {
  usePageTitle("Dashboard");
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
      <PageBand
        kicker={role ?? "Student"}
        title={`${role ?? "Student"} dashboard`}
        lead={`${email ?? "Your projects, versions, and evaluation results."}${
          unread !== null && unread > 0 ? ` You have ${unread} unread notifications.` : ""
        }`}
        crumbs={[{ label: "Dashboard" }]}
      />
      <div className="section">
        <div className="wrap space-y-6">
          {error && <Alert tone="warn">{error}</Alert>}

          <div className="grid grid-3">
            <div className="card">
              <h2 className="card-title">Projects</h2>
              <p className="num text-3xl font-extrabold text-navy m-0">{n(projects.length)}</p>
              <p className="muted small">Live from the project registry.</p>
              <Link href="/projects" className="btn btn-outline btn-small mt-3">
                Open projects
              </Link>
            </div>
            <div className="card">
              <h2 className="card-title">In review</h2>
              <p className="num text-3xl font-extrabold text-navy m-0">{n(underReview)}</p>
              <p className="muted small">Submitted plus under review right now.</p>
              <Link href="/guide/reviews" className="btn btn-outline btn-small mt-3">
                Review queue
              </Link>
            </div>
            <div className="card">
              <h2 className="card-title">Evaluated</h2>
              <p className="num text-3xl font-extrabold text-navy m-0">{n(evaluated)}</p>
              <p className="muted small">
                Approved plus evaluated outcomes.
                {unread !== null && unread > 0 && ` ${unread} unread notifications.`}
              </p>
              <Link href="/notifications" className="btn btn-outline btn-small mt-3">
                Notifications
              </Link>
            </div>
          </div>

          <Card>
            <CardTitle>Workflows</CardTitle>
            <ul className="chips">
              <li><Link href="/projects/new" className="chip no-underline">Submit</Link></li>
              <li><Link href="/coordinator/allocation" className="chip no-underline">Allocation</Link></li>
              <li><Link href="/evaluator/assigned" className="chip no-underline">Evaluate</Link></li>
              <li><Link href="/admin/users" className="chip no-underline">Admin</Link></li>
            </ul>
          </Card>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={role ?? "STUDENT"} />
            <button type="button" onClick={logout} className="btn btn-outline btn-small">
              Logout
            </button>
          </div>
        </div>
      </div>
    </Protected>
  );
}
