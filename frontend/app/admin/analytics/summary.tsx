"use client";

import * as React from "react";
import api from "@/lib/api";
import { apiErrorMessage } from "@/lib/types";
import { Protected } from "@/components/layout/protected";
import { Card, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";

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

  return (
    <Protected allowed={["COORDINATOR", "ADMIN"]}>
      <div className="space-y-5">
        <div className="brutal-card bg-lilac p-6">
          <h1 className="text-2xl md:text-3xl font-black">Department analytics</h1>
          <p className="mt-1 text-sm text-ink/70">Live counts from GET /analytics/summary.</p>
        </div>
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
            <div className="grid gap-5 md:grid-cols-3">
              <Card className="bg-primary">
                <CardTitle>{String(summary.totalProjects ?? 0)} projects</CardTitle>
              </Card>
              <Card className="bg-success">
                <CardTitle>{String(summary.totalEvaluations ?? 0)} evaluations</CardTitle>
              </Card>
              <Card className="bg-accent">
                <CardTitle>Avg {String(summary.averageMarks ?? 0)} marks</CardTitle>
              </Card>
            </div>
            <Card className="bg-white">
              <CardTitle>Projects by status</CardTitle>
              <pre className="mt-2 overflow-x-auto font-mono text-xs bg-muted border border-ink/15 rounded-lg p-3">
                {JSON.stringify(summary.projectsByStatus, null, 2)}
              </pre>
            </Card>
            <Card className="bg-white">
              <CardTitle>Guide load</CardTitle>
              <pre className="mt-2 overflow-x-auto font-mono text-xs bg-muted border border-ink/15 rounded-lg p-3">
                {JSON.stringify(summary.guideLoad, null, 2)}
              </pre>
            </Card>
          </>
        )}
      </div>
    </Protected>
  );
}
