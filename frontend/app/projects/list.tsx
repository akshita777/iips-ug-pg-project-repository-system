"use client";

import * as React from "react";
import Link from "next/link";
import api from "@/lib/api";
import { apiErrorMessage, type Project } from "@/lib/types";
import { Protected } from "@/components/layout/protected";
import { StatusBadge } from "@/components/ui/badge";
import { Table, TableSkeleton } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";

export function ProjectsList() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    api
      .get<Project[]>("/projects")
      .then((res) => setProjects(res.data))
      .catch((e) => setError(apiErrorMessage(e, "Could not load projects. Check the backend is running.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Protected>
      <div className="space-y-5">
        <div className="brutal-card bg-primary p-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black">Projects</h1>
            <p className="mt-1 text-sm text-ink/70">BCA and MCA submissions with live status.</p>
          </div>
          <Link href="/projects/new" className="brutal-btn bg-ink text-white text-sm">
            New project
          </Link>
        </div>

        {error && <Alert tone="danger">{error}</Alert>}

        {loading ? (
          <div className="brutal-card bg-white">
            <TableSkeleton rows={4} />
          </div>
        ) : projects.length === 0 && !error ? (
          <EmptyState
            title="No projects yet"
            desc="Create the first project to start the submission flow."
            actionHref="/projects/new"
            actionLabel="Submit a project"
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Stack</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="font-bold">{p.title}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="font-mono text-xs">{p.techStack || "—"}</td>
                  <td>
                    <Link
                      href={`/projects/${p.id}`}
                      className="font-bold underline underline-offset-2 text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Protected>
  );
}
