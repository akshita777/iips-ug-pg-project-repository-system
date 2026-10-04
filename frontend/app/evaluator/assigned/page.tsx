"use client";

import * as React from "react";
import api from "@/lib/api";
import { apiErrorMessage, type Evaluation, type Rubric } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Protected } from "@/components/layout/protected";
import { PageBand } from "@/components/layout/page-band";
import { Grade } from "@/components/ui/grade";
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

  async function addRubric() {
    try {
      const { data } = await api.post<Rubric>("/evaluations/rubrics", {
        name: "Standard rubric",
        criteria: {
          documentation: 20,
          implementation: 50,
          demo: 20,
          viva: 10,
        },
      });
      setRubrics((prev) => [...prev, data]);
      setRubricId(String(data.id));
      push("Standard rubric created.", "success");
    } catch (e) {
      push(apiErrorMessage(e, "Could not create rubric."), "danger");
    }
  }

  return (
    <Protected allowed={["EVALUATOR", "COORDINATOR", "ADMIN"]}>
      <PageBand
        kicker="Evaluation"
        title="Assigned evaluations"
        lead="Rubric based marks. Project must be approved first."
        crumbs={[{ label: "Assigned" }]}
      />
      <div className="section">
        <div className="wrap space-y-5">
          {error && <Alert tone="danger">{error}</Alert>}

          <div className="card space-y-3">
            <h2 className="card-title">Submit marks</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Project ID" name="projectId" value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="e.g. 1" />
              <Input label="Total marks" name="marks" value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="e.g. 85" />
            </div>
            <div className="seg" role="group" aria-label="Rubric">
              {rubrics.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={rubricId === String(r.id)}
                  onClick={() => setRubricId(String(r.id))}
                  className="seg-btn"
                >
                  {r.name}
                </button>
              ))}
              {rubrics.length === 0 && (
                <span className="text-sm muted px-4 inline-flex items-center min-h-[42px]">No rubrics seeded yet.</span>
              )}
            </div>
            {rubrics.length === 0 && (
              <>
                <Input label="Rubric ID" name="rubricId" value={rubricId} onChange={(e) => setRubricId(e.target.value)} placeholder="e.g. 1" />
                <Button variant="white" size="sm" type="button" onClick={addRubric}>
                  Create standard rubric
                </Button>
              </>
            )}
            <Textarea label="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Strengths, gaps, viva notes." />
            <Button size="sm" type="button" onClick={submit}>
              Submit evaluation
            </Button>
          </div>

          {loading ? (
            <div className="card">
              <TableSkeleton rows={3} />
            </div>
          ) : assigned.length === 0 ? (
            <EmptyState title="Nothing assigned" desc="Evaluations assigned to you appear here." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th className="n">Marks</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {assigned.map((e) => (
                  <tr key={e.id}>
                    <td className="font-bold">
                      {e.projectTitle || `#${e.projectId}`} <StatusBadge status="EVALUATED" className="ml-2" />
                    </td>
                    <td className="font-mono font-bold n">
                      <Grade marks={e.totalMarks !== undefined && e.totalMarks !== null ? Number(e.totalMarks) : null} />{" "}
                      {e.totalMarks ?? "—"}
                    </td>
                    <td className="muted">{e.feedback || "—"}</td>
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
