"use client";

import * as React from "react";
import api from "@/lib/api";
import { apiErrorMessage, type Rubric } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { usePageTitle } from "@/lib/use-title";
import { Protected } from "@/components/layout/protected";
import { PageBand } from "@/components/layout/page-band";
import { Table, TableSkeleton } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

const emptyCriteria = `{
  "documentation": 20,
  "implementation": 50,
  "demo": 20,
  "viva": 10
}`;

export default function RubricsPage() {
  usePageTitle("Rubrics");
  const { push } = useToast();
  const [rubrics, setRubrics] = React.useState<Rubric[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [name, setName] = React.useState("");
  const [criteria, setCriteria] = React.useState(emptyCriteria);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  React.useEffect(() => {
    api
      .get<Rubric[]>("/evaluations/rubrics")
      .then((res) => setRubrics(res.data))
      .catch((e) => setError(apiErrorMessage(e, "Could not load rubrics.")))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setName("");
    setCriteria(emptyCriteria);
    setEditingId(null);
  }

  function startEdit(r: Rubric) {
    setEditingId(r.id);
    setName(r.name);
    setCriteria(JSON.stringify(r.criteria ?? {}, null, 2));
  }

  async function save() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(criteria);
    } catch {
      push("Criteria must be valid JSON.", "danger");
      return;
    }
    if (!name.trim()) {
      push("Rubric name is required.", "danger");
      return;
    }
    try {
      if (editingId) {
        const { data } = await api.put<Rubric>(`/evaluations/rubrics/${editingId}`, {
          name: name.trim(),
          criteria: parsed,
        });
        setRubrics((prev) => prev.map((r) => (r.id === editingId ? data : r)));
        push("Rubric updated.", "success");
      } else {
        const { data } = await api.post<Rubric>("/evaluations/rubrics", {
          name: name.trim(),
          criteria: parsed,
        });
        setRubrics((prev) => [...prev, data]);
        push("Rubric created.", "success");
      }
      resetForm();
    } catch (e) {
      push(apiErrorMessage(e, "Save failed."), "danger");
    }
  }

  return (
    <Protected allowed={["COORDINATOR", "ADMIN", "EVALUATOR"]}>
      <PageBand
        kicker="Evaluation"
        title="Rubric management"
        lead="Published rubrics drive evaluator scoring. Edits apply to future evaluations."
        crumbs={[{ label: "Rubrics" }]}
      />
      <div className="section">
        <div className="wrap space-y-5">
          {error && <Alert tone="danger">{error}</Alert>}

          <div className="card space-y-3">
            <h2 className="card-title">{editingId ? "Edit rubric" : "New rubric"}</h2>
            <Input
              label="Name"
              name="rubricName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Standard rubric"
            />
            <Textarea
              label="Criteria as JSON"
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder={emptyCriteria}
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" type="button" onClick={save}>
                {editingId ? "Save changes" : "Create rubric"}
              </Button>
              {editingId && (
                <Button variant="white" size="sm" type="button" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="card">
              <TableSkeleton rows={3} />
            </div>
          ) : rubrics.length === 0 ? (
            <EmptyState title="No rubrics yet" desc="Create the first rubric above." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Criteria</th>
                  <th className="n">Edit</th>
                </tr>
              </thead>
              <tbody>
                {rubrics.map((r) => (
                  <tr key={r.id}>
                    <td className="font-bold">{r.name}</td>
                    <td>
                      <ul className="chips">
                        {Object.entries(r.criteria ?? {}).map(([key, value]) => (
                          <li key={key} className="chip">
                            {key} <strong>{String(value)}</strong>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="n">
                      <Button variant="white" size="sm" type="button" onClick={() => startEdit(r)}>
                        Edit
                      </Button>
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
