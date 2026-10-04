"use client";

import * as React from "react";
import Link from "next/link";
import api from "@/lib/api";
import { apiErrorMessage, type GuideAllocation } from "@/lib/types";
import { Protected } from "@/components/layout/protected";
import { PageBand } from "@/components/layout/page-band";
import { Table, TableSkeleton } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";

export default function MyStudentsPage() {
  const [rows, setRows] = React.useState<GuideAllocation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    api
      .get<GuideAllocation[]>("/allocations")
      .then((res) => setRows(res.data))
      .catch((e) => setError(apiErrorMessage(e, "Could not load your students.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Protected allowed={["FACULTY", "COORDINATOR", "ADMIN"]}>
      <PageBand
        kicker="Guidance"
        title="My students"
        lead="Students allocated to you with their project status."
        crumbs={[{ label: "Students" }]}
      />
      <div className="section">
        <div className="wrap space-y-5">
          {error && <Alert tone="danger">{error}</Alert>}
          {loading ? (
            <div className="card">
              <TableSkeleton rows={3} />
            </div>
          ) : rows.length === 0 ? (
            <EmptyState title="No students allocated" desc="Allocations appear here once the coordinator confirms them." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {rows.map((r, i) => (
                <div key={r.id} className="card flex items-center gap-3">
                  <Avatar name={r.studentName || r.studentEmail || `Student ${r.studentId}`} index={i} />
                  <div className="min-w-0">
                    <p className="font-bold truncate m-0">
                      {r.studentName || r.studentEmail || `#${r.studentId}`}
                    </p>
                    <p className="text-sm muted truncate m-0">{r.projectTitle || "No project yet"}</p>
                    {r.projectId && (
                      <Link href={`/projects/${r.projectId}`} className="text-sm font-semibold">
                        Open project
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Protected>
  );
}
