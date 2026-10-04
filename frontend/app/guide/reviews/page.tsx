"use client";

import * as React from "react";
import Link from "next/link";
import api from "@/lib/api";
import { apiErrorMessage, type Project } from "@/lib/types";
import { Protected } from "@/components/layout/protected";
import { PageBand } from "@/components/layout/page-band";
import { Table, TableSkeleton } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { usePageTitle } from "@/lib/use-title";

export default function ReviewQueuePage() {
  usePageTitle("Review queue");
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
      <PageBand
        kicker="Guidance"
        title="Review queue"
        lead="Submitted and under review projects waiting for guide action."
        crumbs={[{ label: "Reviews" }]}
      />
      <div className="section">
        <div className="wrap space-y-5">
          {error && <Alert tone="danger">{error}</Alert>}
          {loading ? (
            <div className="card">
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
                  <th className="n">Open</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td className="font-bold">{p.title}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="n">
                      <Link href={`/projects/${p.id}`} className="text-sm font-semibold">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </Protected>
  );
}
