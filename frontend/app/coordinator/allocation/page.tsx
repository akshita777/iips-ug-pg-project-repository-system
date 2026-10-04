"use client";

import * as React from "react";
import api from "@/lib/api";
import { apiErrorMessage, type GuideAllocation } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Protected } from "@/components/layout/protected";
import { PageBand } from "@/components/layout/page-band";
import { Table, TableSkeleton } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePageTitle } from "@/lib/use-title";

export default function AllocationPage() {
  usePageTitle("Guide allocation");
  const { push } = useToast();
  const [rows, setRows] = React.useState<GuideAllocation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [facultyId, setFacultyId] = React.useState<Record<number, string>>({});
  const [working, setWorking] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<GuideAllocation[]>("/allocations");
      setRows(data);
    } catch (e) {
      setError(apiErrorMessage(e, "Could not load allocations."));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function suggest() {
    setWorking(true);
    try {
      const { data } = await api.post<GuideAllocation[]>("/allocations/suggest");
      setRows(data);
      push(`Generated ${data.length} suggestions.`, "success");
    } catch (e) {
      push(apiErrorMessage(e, "Suggest failed."), "danger");
    } finally {
      setWorking(false);
    }
  }

  async function confirm(allocationId: number) {
    try {
      await api.post("/allocations/confirm", { allocationId });
      push("Allocation confirmed.", "success");
      load();
    } catch (e) {
      push(apiErrorMessage(e, "Confirm failed."), "danger");
    }
  }

  async function override(allocationId: number) {
    const fid = Number(facultyId[allocationId]);
    if (!fid) {
      push("Enter a faculty user id to override.", "danger");
      return;
    }
    try {
      await api.post("/allocations/override", { allocationId, facultyId: fid });
      push("Allocation overridden.", "success");
      load();
    } catch (e) {
      push(apiErrorMessage(e, "Override failed."), "danger");
    }
  }

  return (
    <Protected allowed={["COORDINATOR", "ADMIN"]}>
      <PageBand
        kicker="Coordination"
        title="Guide allocation"
        lead="Suggestions are drafts until confirmed. Override with a faculty id."
        crumbs={[{ label: "Allocation" }]}
      >
        <Button size="sm" type="button" disabled={working} onClick={suggest} className="mt-4">
          {working ? "Running..." : "Run suggestions"}
        </Button>
      </PageBand>
      <div className="section">
        <div className="wrap space-y-5">
          {error && <Alert tone="danger">{error}</Alert>}

          {loading ? (
            <div className="card">
              <TableSkeleton rows={4} />
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No allocations yet"
              desc="Run suggestions to generate draft guide allocations."
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Faculty</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="font-bold">{r.studentName || r.studentEmail || `#${r.studentId}`}</td>
                    <td>{r.facultyName || (r.facultyId ? `#${r.facultyId}` : "Unassigned")}</td>
                    <td className="muted">{r.projectTitle || (r.projectId ? `#${r.projectId}` : "—")}</td>
                    <td>
                      <span className="chip bg-warn-soft text-warn">{r.status || "Pending"}</span>
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="success" size="sm" type="button" onClick={() => confirm(r.id)}>
                          Confirm
                        </Button>
                        <Input
                          name={`faculty-${r.id}`}
                          value={facultyId[r.id] ?? ""}
                          onChange={(e) => setFacultyId((prev) => ({ ...prev, [r.id]: e.target.value }))}
                          placeholder="Faculty ID"
                          className="!w-28 !py-1.5 text-sm"
                        />
                        <Button variant="white" size="sm" type="button" onClick={() => override(r.id)}>
                          Override
                        </Button>
                      </div>
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
