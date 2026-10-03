"use client";

import * as React from "react";
import Link from "next/link";
import api from "@/lib/api";
import { apiErrorMessage, type Project } from "@/lib/types";
import { Protected } from "@/components/layout/protected";
import { Table, TableSkeleton } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";

export default function ReviewQueuePage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    api
      .get<Project[]>("/projects")
      .then((res) =>
        setProjects(res.data.filter((p) => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW"))
      )
      .catch((e) => setError(apiErrorMessage(e, "Could not load review queue.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Protected allowed={["FACULTY", "COORDINATOR", "ADMIN"]}>
      <div className="space-y-5">
        <div className="brutal-card bg-warn p-6">
          <h1 className="text-2xl md:text-3xl font-black">Review queue</h1>
          <p className="mt-1 text-sm text-ink/70">Submitted and under review projects waiting for guide action.</p>
        </div>
        {error && <Alert tone="danger">{error}</Alert>}
        {loading ? (
          <div className="brutal-card bg-white">
            <TableSkeleton rows={3} />
          </div>
        ) : projects.length === 0 && !error ? (
          <EmptyState title="Queue is clear" desc="No projects are waiting for review right now." />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="font-bold">{p.title}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td>
                    <Link href={`/projects/${p.id}`} className="font-bold underline underline-offset-2 text-sm">
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Protected>
  );
}
