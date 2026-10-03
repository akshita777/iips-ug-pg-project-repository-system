"use client";

import * as React from "react";
import api from "@/lib/api";
import { apiErrorMessage, type GuideAllocation } from "@/lib/types";
import { parseFacultyIds } from "@/lib/filters";
import { useToast } from "@/components/ui/toast";
import { Protected } from "@/components/layout/protected";
import { Table } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";

export default function PreferencesPage() {
  const { push } = useToast();
  const [mine, setMine] = React.useState<GuideAllocation[]>([]);
  const [projectId, setProjectId] = React.useState("");
  const [facultyIds, setFacultyIds] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const loadMine = React.useCallback(async () => {
    try {
      const { data } = await api.get<GuideAllocation[]>("/allocations");
      setMine(data);
    } catch (e) {
      setError(apiErrorMessage(e, "Could not load your allocation."));
    }
  }, []);

  React.useEffect(() => {
    loadMine();
  }, [loadMine]);

  async function save() {
    const pid = Number(projectId);
    const fids = parseFacultyIds(facultyIds);
    if (!pid || fids.length === 0) {
      push("Enter your project id and at least one faculty id, comma separated.", "danger");
      return;
    }
    setSaving(true);
    try {
      await api.post("/allocations/preferences", { projectId: pid, facultyIds: fids });
      push("Preferences saved in rank order.", "success");
      setProjectId("");
      setFacultyIds("");
    } catch (e) {
      push(apiErrorMessage(e, "Save failed."), "danger");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Protected allowed={["STUDENT"]}>
      <div className="space-y-5">
        <div className="brutal-card bg-secondary p-6">
          <h1 className="text-2xl md:text-3xl font-black">Guide preferences</h1>
          <p className="mt-1 text-sm text-ink/70">
            Rank your preferred guides by faculty user id. First id is rank 1. Saving replaces your old list.
          </p>
        </div>

        {error && <Alert tone="danger">{error}</Alert>}

        <div className="brutal-card bg-white p-5 space-y-3">
          <Input
            label="My project ID"
            name="projectId"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="e.g. 1"
          />
          <Input
            label="Faculty IDs in rank order"
            name="facultyIds"
            value={facultyIds}
            onChange={(e) => setFacultyIds(e.target.value)}
            placeholder="e.g. 4, 7, 2"
          />
          <Button variant="dark" size="sm" type="button" disabled={saving} onClick={save}>
            {saving ? "Saving..." : "Save preferences"}
          </Button>
        </div>

        <div className="brutal-card bg-white p-5">
          <p className="font-display font-bold">My allocation</p>
          {mine.length === 0 ? (
            <div className="mt-2">
              <EmptyState title="No allocation yet" desc="Your confirmed guide appears here once the coordinator runs allocation." />
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Project</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((r) => (
                  <tr key={r.id}>
                    <td className="font-bold">{r.facultyName || (r.facultyId ? `#${r.facultyId}` : "Unassigned")}</td>
                    <td className="text-ink/70">{r.projectTitle || (r.projectId ? `#${r.projectId}` : "—")}</td>
                    <td>
                      <StatusBadge status={(r.status || "PENDING").replace(/ /g, "_")} />
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
