"use client";

import * as React from "react";
import Link from "next/link";
import api from "@/lib/api";
import { apiErrorMessage, type Project, type ProjectStatus } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { Protected } from "@/components/layout/protected";
import { PageBand } from "@/components/layout/page-band";
import { StatusBadge } from "@/components/ui/badge";
import { Table, TableSkeleton } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { filterProjects, paginate, pageCount, type ProjectFilter } from "@/lib/filters";
import { usePageTitle } from "@/lib/use-title";

const PAGE_SIZE = 8;

const buckets: { value: ProjectFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Draft and active" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "DONE", label: "Decided" },
];

export function ProjectsList() {
  usePageTitle("Projects");
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
      <PageBand
        kicker="Registry"
        title="Projects"
        lead="MCA (5 Years) Integrated submissions with live status."
        crumbs={[{ label: "Projects" }]}
      >
        <Link href="/projects/new" className="btn btn-amber btn-small mt-4">
          New project
        </Link>
      </PageBand>
      <div className="section">
        <div className="wrap space-y-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <label htmlFor="search" className="ctl-label">
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
                className="ctl-input"
              />
            </div>
            <div>
              <span className="ctl-label" id="status-filter">
                Status
              </span>
              <div className="seg" role="group" aria-labelledby="status-filter">
                {buckets.map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    aria-pressed={bucket === b.value}
                    onClick={() => {
                      setBucket(b.value);
                      setPage(1);
                    }}
                    className="seg-btn"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <Alert tone="danger">
              {error} You can still{" "}
              <button type="button" className="underline font-semibold" onClick={() => window.location.reload()}>
                retry
              </button>
              .
            </Alert>
          )}

          {loading ? (
            <div className="card">
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
                    <th className="n">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p) => (
                    <tr key={p.id}>
                      <td className="font-bold">
                        <Link href={`/projects/${p.id}`} className="no-underline hover:underline">
                          {p.title}
                        </Link>
                      </td>
                      <td>
                        <StatusBadge status={p.status as ProjectStatus} />
                      </td>
                      <td className="font-mono text-xs">{p.techStack || "—"}</td>
                      <td className="n">
                        <Link href={`/projects/${p.id}`} className="text-sm font-semibold">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="flex items-center justify-between text-sm">
                <span className="muted num">
                  Page {page} of {pages}, {filtered.length} total
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline btn-small"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-small"
                    disabled={page >= pages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
          {role && <p className="text-center text-xs muted">Signed in as {role.toLowerCase()}.</p>}
        </div>
      </div>
    </Protected>
  );
}
