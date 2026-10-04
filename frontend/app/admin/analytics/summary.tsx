"use client";

import * as React from "react";
import api from "@/lib/api";
import { apiErrorMessage } from "@/lib/types";
import { Protected } from "@/components/layout/protected";
import { PageBand } from "@/components/layout/page-band";
import { Card, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Meter } from "@/components/ui/meter";
import { n } from "@/lib/format";

export function AnalyticsView() {
  const [summary, setSummary] = React.useState<Record<string, unknown> | null>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api
      .get<Record<string, unknown>>("/analytics/summary")
      .then((res) => setSummary(res.data))
      .catch((e) => setError(apiErrorMessage(e, "Could not load analytics. Coordinator or admin role required.")))
      .finally(() => setLoading(false));
  }, []);

  const byStatus = ((summary?.projectsByStatus ?? {}) as Record<string, number>);
  const statusTotal = Object.values(byStatus).reduce((a, b) => a + (Number(b) || 0), 0);
  const guideLoad = ((summary?.guideLoad ?? {}) as Record<string, number>);
  const guideTotal = Object.values(guideLoad).reduce((a, b) => a + (Number(b) || 0), 0);

  return (
    <Protected allowed={["COORDINATOR", "ADMIN"]}>
      <PageBand
        kicker="Administration"
        title="Department analytics"
        lead="Live counts from the analytics summary."
        crumbs={[{ label: "Analytics" }]}
      />
      <div className="section">
        <div className="wrap space-y-5">
          {error && <Alert tone="danger">{error}</Alert>}
          {loading ? (
            <div className="space-y-2">
              <div className="skeleton h-20 w-full" />
              <div className="skeleton h-20 w-full" />
              <div className="skeleton h-20 w-full" />
            </div>
          ) : !summary ? (
            <EmptyState title="No analytics" desc="The summary endpoint returned no data." />
          ) : (
            <>
              <div className="grid grid-3">
                <div className="card">
                  <p className="num text-3xl font-extrabold text-navy m-0">{n(Number(summary.totalProjects ?? 0))}</p>
                  <p className="muted small m-0">Projects total</p>
                </div>
                <div className="card">
                  <p className="num text-3xl font-extrabold text-navy m-0">{n(Number(summary.totalEvaluations ?? 0))}</p>
                  <p className="muted small m-0">Evaluations total</p>
                </div>
                <div className="card">
                  <p className="num text-3xl font-extrabold text-navy m-0">{String(summary.averageMarks ?? 0)}</p>
                  <p className="muted small m-0">Average marks</p>
                </div>
              </div>
              <Card>
                <CardTitle>Projects by status</CardTitle>
                <Meter
                  pillars={Object.entries(byStatus).map(([label, points]) => ({
                    id: label,
                    label: label.replace(/_/g, " ").toLowerCase(),
                    points: Number(points) || 0,
                    max: Math.max(statusTotal, 1),
                  }))}
                />
              </Card>
              <Card>
                <CardTitle>Guide load</CardTitle>
                {Object.keys(guideLoad).length === 0 ? (
                  <p className="muted small m-0">No confirmed allocations yet.</p>
                ) : (
                  <Meter
                    pillars={Object.entries(guideLoad).map(([label, points]) => ({
                      id: label,
                      label,
                      points: Number(points) || 0,
                      max: Math.max(guideTotal, 1),
                    }))}
                  />
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </Protected>
  );
}
