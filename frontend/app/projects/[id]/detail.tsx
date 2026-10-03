"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Table } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";

const tabs = [
  { id: "files", label: "Files" },
  { id: "guide", label: "Guide" },
  { id: "result", label: "Result" },
];

export function ProjectDetail({ id }: { id: string }) {
  const [active, setActive] = useState("files");

  return (
    <div className="space-y-5">
      <div className="brutal-card bg-white p-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink/60">Project #{id}</p>
          <h1 className="text-2xl md:text-3xl font-black">Project detail</h1>
          <p className="mt-1 text-sm text-ink/70">Version history, guide thread, and rubric result.</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="UNDER_REVIEW" />
          <span className="brutal-badge bg-muted font-mono">v1</span>
        </div>
      </div>

      <Tabs tabs={tabs} active={active} onChange={setActive} />

      {active === "files" && (
        <Table>
          <thead>
            <tr>
              <th>Version</th>
              <th>Uploaded</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-bold font-mono">v1</td>
              <td>Just now</td>
              <td className="text-ink/70">Initial submission shell. File rows land here from the API.</td>
            </tr>
          </tbody>
        </Table>
      )}

      {active === "guide" && (
        <div className="brutal-card bg-secondary p-6">
          <div className="flex items-center gap-3">
            <Avatar name="Guide Name" index={2} />
            <div>
              <p className="font-display font-bold">Allocated guide</p>
              <p className="text-sm text-ink/70">Review thread appears here once allocation runs.</p>
            </div>
          </div>
        </div>
      )}

      {active === "result" && (
        <EmptyState
          title="Not evaluated yet"
          desc="Rubric marks and evaluator feedback appear here after evaluation."
        />
      )}
    </div>
  );
}
