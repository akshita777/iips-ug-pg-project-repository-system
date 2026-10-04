"use client";

import * as React from "react";
import Link from "next/link";
import api from "@/lib/api";
import { apiErrorMessage, type Project, type ProjectStatus } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { Protected } from "@/components/layout/protected";
import { StatusBadge } from "@/components/ui/badge";
import { Table, TableSkeleton } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { SelectField } from "@/components/ui/select";
import { filterProjects, paginate, pageCount, type ProjectFilter } from "@/lib/filters";

const PAGE_SIZE = 8;

export function ProjectsList() {
  const { role } = useAuth();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [bucket, setBucket] = React.useState<ProjectFilter>("ALL");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    api
      .get<Project[]>("/projects")
      .then((res) => setProjects(res.data))
      .catch((e) => setError(apiErrorMessage(e, "Could not load projects. Check the backend is running.")))
      .finally(() => setLoading(false));
  }, []);

  const filtered = React.useMemo(() => filterProjects(projects, query, bucket), [projects, query, bucket]);
  const pages = pageCount(filtered.length, PAGE_SIZE);
  const visible = paginate(filtered, page, PAGE_SIZE);

  return (
    <Protected>
      <div className="space-y-5">
        <div className="brutal-card bg-primary p-6 flex flex-wrap items-center justify-between gap-3 text-white">
          <div>
            <h1 className="text-2xl md:text-3xl font-black">Projects</h1>
            <p className="mt-1 text-sm text-white">BCA and MCA submissions with live status.</p>
          </div>
          <Link href="/projects/new" className="brutal-btn bg-ink text-white text-sm">
            New project
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="search" className="font-display text-sm font-bold uppercase tracking-wide">
              Search
            </label>
            <input
              id="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Title, abstract, or tech stack"
              className="brutal-input"
            />
          </div>
          <SelectField
            label="Status"
            name="status"
            value={bucket}
            onChange={(v) => {
              setBucket(v as ProjectFilter);
              setPage(1);
            }}
            placeholder="All statuses"
            options={[
              { value: "ALL", label: "All statuses" },
              { value: "ACTIVE", label: "Draft and active" },
              { value: "REVIEWING", label: "Submitted and reviewing" },
              { value: "DONE", label: "Approved and evaluated" },
            ]}
          />
        </div>

        {error && (
          <Alert tone="danger">
            {error} You can still{" "}
            <button type="button" className="underline font-bold" onClick={() => window.location.reload()}>
              retry
            </button>
            .
          </Alert>
        )}

        {loading ? (
          <div className="brutal-card bg-white">
            <TableSkeleton rows={4} />
          </div>
        ) : filtered.length === 0 && !error ? (
          <EmptyState
            title="No projects match"
            desc="Try a different search or status filter, or create a new project."
            actionHref="/projects/new"
            actionLabel="Submit a project"
          />
        ) : (
          <>
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
                {visible.map((p) => (
                  <tr key={p.id}>
                    <td className="font-bold">{p.title}</td>
                    <td>
                      <StatusBadge status={p.status as ProjectStatus} />
                    </td>
                    <td className="font-mono text-xs">{p.techStack || "—"}</td>
                    <td>
                      <Link href={`/projects/${p.id}`} className="font-bold underline underline-offset-2 text-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink/60">
                Page {page} of {pages}, {filtered.length} total
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="brutal-badge bg-white disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="brutal-badge bg-white disabled:opacity-50"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
        {role && (
          <p className="text-center text-xs text-ink/50">
            Signed in as {role.toLowerCase()}.
          </p>
        )}
      </div>
    </Protected>
  );
}

