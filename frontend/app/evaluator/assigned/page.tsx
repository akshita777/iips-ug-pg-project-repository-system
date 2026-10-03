"use client";

import * as React from "react";
import api from "@/lib/api";
import { apiErrorMessage, type Evaluation, type Rubric } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Protected } from "@/components/layout/protected";
import { Table, TableSkeleton } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";

export default function AssignedPage() {
  const { push } = useToast();
  const [assigned, setAssigned] = React.useState<Evaluation[]>([]);
  const [rubrics, setRubrics] = React.useState<Rubric[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [projectId, setProjectId] = React.useState("");
  const [rubricId, setRubricId] = React.useState("");
  const [marks, setMarks] = React.useState("");
  const [feedback, setFeedback] = React.useState("");

  React.useEffect(() => {
    Promise.all([
      api.get<Evaluation[]>("/evaluations/assigned").catch(() => ({ data: [] as Evaluation[] })),
      api.get<Rubric[]>("/evaluations/rubrics").catch(() => ({ data: [] as Rubric[] })),
    ])
      .then(([a, r]) => {
        setAssigned(a.data);
        setRubrics(r.data);
        if (r.data.length > 0) setRubricId(String(r.data[0].id));
      })
      .catch((e) => setError(apiErrorMessage(e, "Could not load assigned evaluations.")))
      .finally(() => setLoading(false));
  }, []);

  async function submit() {
    const pid = Number(projectId);
    const rid = Number(rubricId);
    if (!pid || !rid || !marks) {
      push("Project, rubric, and marks are required.", "danger");
      return;
    }
    try {
      const { data } = await api.post<Evaluation>("/evaluations", {
        projectId: pid,
        rubricId: rid,
        totalMarks: marks,
        feedback: feedback || undefined,
      });
      setAssigned((prev) => [data, ...prev]);
      setProjectId("");
      setMarks("");
      setFeedback("");
      push("Evaluation submitted.", "success");
    } catch (e) {
      push(apiErrorMessage(e, "Submit failed."), "danger");
    }
  }

  return (
    <Protected allowed={["EVALUATOR", "COORDINATOR", "ADMIN"]}>
      <div className="space-y-5">
        <div className="brutal-card bg-accent p-6">
          <h1 className="text-2xl md:text-3xl font-black">Assigned evaluations</h1>
          <p className="mt-1 text-sm text-ink/70">Rubric based marks. Project must be approved first.</p>
        </div>

        {error && <Alert tone="danger">{error}</Alert>}

        <div className="brutal-card bg-white p-5 space-y-3">
          <p className="font-display font-bold">Submit marks</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Project ID" name="projectId" value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="e.g. 1" />
            <Input label="Total marks" name="marks" value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="e.g. 85" />
          </div>
          <div className="flex flex-wrap gap-2">
            {rubrics.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRubricId(String(r.id))}
                className={`brutal-badge cursor-pointer ${rubricId === String(r.id) ? "bg-ink text-white" : "bg-white"}`}
              >
                {r.name}
              </button>
            ))}
            {rubrics.length === 0 && <span className="text-sm text-ink/60">No rubrics seeded. Enter rubric id manually below.</span>}
          </div>
          {!rubrics.length && (
            <Input label="Rubric ID" name="rubricId" value={rubricId} onChange={(e) => setRubricId(e.target.value)} placeholder="e.g. 1" />
          )}
          <Textarea label="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Strengths, gaps, viva notes." />
          <Button variant="dark" size="sm" type="button" onClick={submit}>
            Submit evaluation
          </Button>
        </div>

        {loading ? (
          <div className="brutal-card bg-white">
            <TableSkeleton rows={3} />
          </div>
        ) : assigned.length === 0 ? (
          <EmptyState title="Nothing assigned" desc="Evaluations assigned to you appear here." />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Marks</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {assigned.map((e) => (
                <tr key={e.id}>
                  <td className="font-bold">
                    {e.projectTitle || `#${e.projectId}`} <StatusBadge status="EVALUATED" className="ml-2" />
                  </td>
                  <td className="font-mono font-bold">{e.totalMarks ?? "—"}</td>
                  <td className="text-ink/70">{e.feedback || "—"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Protected>
  );
}
