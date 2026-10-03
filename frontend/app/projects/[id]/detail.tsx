"use client";

import * as React from "react";
import api from "@/lib/api";
import {
  apiErrorMessage,
  type CodeReview,
  type CommitRecord,
  type LinkedRepository,
  type Project,
  type SubmissionVersion,
  type TeamMember,
  type WikiPage,
} from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { Protected } from "@/components/layout/protected";
import { StatusBadge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Table, TableSkeleton } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";

const tabs = [
  { id: "files", label: "Files" },
  { id: "reviews", label: "Reviews" },
  { id: "repo", label: "Repository" },
  { id: "team", label: "Team" },
  { id: "wiki", label: "Wiki" },
  { id: "result", label: "Result" },
];

export function ProjectDetail({ id }: { id: string }) {
  const { role } = useAuth();
  const { push } = useToast();
  const [active, setActive] = React.useState("files");
  const [project, setProject] = React.useState<Project | null>(null);
  const [versions, setVersions] = React.useState<SubmissionVersion[]>([]);
  const [reviews, setReviews] = React.useState<CodeReview[]>([]);
  const [repo, setRepo] = React.useState<LinkedRepository | null>(null);
  const [commits, setCommits] = React.useState<CommitRecord[]>([]);
  const [branches, setBranches] = React.useState<{ name: string; sha: string }[]>([]);
  const [team, setTeam] = React.useState<TeamMember[]>([]);
  const [wiki, setWiki] = React.useState<WikiPage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [comments, setComments] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [repoUrl, setRepoUrl] = React.useState("");
  const [reviewStatus, setReviewStatus] = React.useState("PENDING");
  const [reviewComments, setReviewComments] = React.useState("");
  const [memberId, setMemberId] = React.useState("");
  const [memberRole, setMemberRole] = React.useState("MEMBER");
  const [wikiTitle, setWikiTitle] = React.useState("");
  const [wikiBody, setWikiBody] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [p, v, r, t, w] = await Promise.all([
        api.get<Project>(`/projects/${id}`),
        api.get<SubmissionVersion[]>(`/projects/${id}/versions`).catch(() => ({ data: [] as SubmissionVersion[] })),
        api.get<CodeReview[]>(`/projects/${id}/reviews`).catch(() => ({ data: [] as CodeReview[] })),
        api.get<TeamMember[]>(`/projects/${id}/team`).catch(() => ({ data: [] as TeamMember[] })),
        api.get<WikiPage[]>(`/projects/${id}/wiki`).catch(() => ({ data: [] as WikiPage[] })),
      ]);
      setProject(p.data);
      setVersions(v.data);
      setReviews(r.data);
      setTeam(t.data);
      setWiki(w.data);
      try {
        const g = await api.get<LinkedRepository>(`/projects/${id}/repository`);
        setRepo(g.data);
        const [c, b] = await Promise.all([
          api.get<CommitRecord[]>(`/projects/${id}/repository/commits`).catch(() => ({ data: [] as CommitRecord[] })),
          api.get<{ name: string; sha: string }[]>(`/projects/${id}/repository/branches`).catch(() => ({ data: [] as { name: string; sha: string }[] })),
        ]);
        setCommits(c.data);
        setBranches(b.data);
      } catch {
        setRepo(null);
      }
    } catch (e) {
      setError(apiErrorMessage(e, "Could not load project."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function uploadVersion() {
    if (!file) {
      push("Pick a file first.", "danger");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (comments.trim()) form.append("comments", comments.trim());
      const { data } = await api.post<SubmissionVersion>(`/projects/${id}/versions`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setVersions((prev) => [data, ...prev]);
      setFile(null);
      setComments("");
      push(`Version v${data.versionNumber} uploaded.`, "success");
    } catch (e) {
      push(apiErrorMessage(e, "Upload failed."), "danger");
    } finally {
      setUploading(false);
    }
  }

  async function act(path: string, ok: string) {
    try {
      const { data } = await api.post<Project>(`/projects/${id}${path}`);
      setProject(data);
      push(ok, "success");
    } catch (e) {
      push(apiErrorMessage(e, "Action failed."), "danger");
    }
  }

  async function postReview() {
    try {
      const { data } = await api.post<CodeReview>(`/projects/${id}/reviews`, {
        status: reviewStatus,
        comments: reviewComments || undefined,
      });
      setReviews((prev) => [data, ...prev]);
      setReviewComments("");
      push("Review posted.", "success");
    } catch (e) {
      push(apiErrorMessage(e, "Review failed."), "danger");
    }
  }

  async function linkRepo() {
    try {
      const { data } = await api.post<LinkedRepository>(`/projects/${id}/repository/link`, { repoUrl });
      setRepo(data);
      push("Repository linked.", "success");
    } catch (e) {
      push(apiErrorMessage(e, "Link failed. Use https://github.com/owner/name."), "danger");
    }
  }

  async function syncRepo() {
    try {
      const { data } = await api.post<CommitRecord[]>(`/projects/${id}/repository/sync`);
      setCommits(data);
      push(`Synced ${data.length} commits.`, "success");
    } catch (e) {
      push(apiErrorMessage(e, "Sync failed."), "danger");
    }
  }

  async function exportZip() {
    try {
      const res = await api.get(`/projects/${id}/export`, { responseType: "blob" });
      const url = window.URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-${id}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      push(apiErrorMessage(e, "Export failed."), "danger");
    }
  }

  async function addMember() {
    const sid = Number(memberId);
    if (!sid) {
      push("Enter a student user id.", "danger");
      return;
    }
    try {
      const { data } = await api.post<TeamMember>(`/projects/${id}/team`, { studentId: sid, teamRole: memberRole });
      setTeam((prev) => [...prev, data]);
      setMemberId("");
      push("Member added.", "success");
    } catch (e) {
      push(apiErrorMessage(e, "Add member failed."), "danger");
    }
  }

  async function saveWiki() {
    if (!wikiTitle.trim()) {
      push("Wiki title is required.", "danger");
      return;
    }
    try {
      const { data } = await api.put<WikiPage>(`/projects/${id}/wiki`, { title: wikiTitle.trim(), body: wikiBody });
      setWiki((prev) => {
        const rest = prev.filter((p) => p.title !== data.title);
        return [...rest, data];
      });
      setWikiTitle("");
      setWikiBody("");
      push("Wiki saved.", "success");
    } catch (e) {
      push(apiErrorMessage(e, "Wiki save failed."), "danger");
    }
  }

  return (
    <Protected>
      <div className="space-y-5">
        {error && <Alert tone="danger">{error}</Alert>}
        {loading || !project ? (
          <div className="space-y-3">
            <div className="skeleton h-28 w-full" />
            <div className="brutal-card bg-white">
              <TableSkeleton rows={3} />
            </div>
          </div>
        ) : (
          <>
            <div className="brutal-card bg-white p-6 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs uppercase tracking-wide text-ink/60">Project #{project.id}</p>
                <h1 className="text-2xl md:text-3xl font-black break-words">{project.title}</h1>
                <p className="mt-1 text-sm text-ink/70">{project.abstractText || "No abstract yet."}</p>
                {project.techStack && <p className="mt-1 font-mono text-xs">{project.techStack}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={project.status} />
                <span className="brutal-badge bg-muted font-mono">v{versions[0]?.versionNumber ?? 1}</span>
                <Button variant="white" size="sm" type="button" onClick={exportZip}>
                  Export ZIP
                </Button>
              </div>
            </div>

            {(role === "FACULTY" || role === "COORDINATOR" || role === "ADMIN") && (
              <div className="brutal-card bg-warn p-4 flex flex-wrap gap-2">
                <Button variant="white" size="sm" type="button" onClick={() => act("/review", "Moved to review.")}>
                  Start review
                </Button>
                <Button variant="success" size="sm" type="button" onClick={() => act("/approve", "Project approved.")}>
                  Approve
                </Button>
                <Button variant="danger" size="sm" type="button" onClick={() => act("/reject", "Project rejected.")}>
                  Reject
                </Button>
                <Button variant="dark" size="sm" type="button" onClick={() => act("/submit", "Submitted for review.")}>
                  Submit
                </Button>
              </div>
            )}

            <Tabs tabs={tabs} active={active} onChange={setActive} />

            {active === "files" && (
              <div className="space-y-4">
                {role === "STUDENT" && (
                  <div className="brutal-card bg-primary p-5 space-y-3">
                    <p className="font-display font-bold">Upload a new version</p>
                    <input
                      type="file"
                      aria-label="Version file"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="w-full text-sm font-bold"
                    />
                    <Input
                      label="Comments"
                      name="comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="What changed in this version?"
                    />
                    <Button variant="dark" size="sm" type="button" disabled={uploading} onClick={uploadVersion}>
                      {uploading ? "Uploading..." : "Upload version"}
                    </Button>
                  </div>
                )}
                {versions.length === 0 ? (
                  <EmptyState title="No versions yet" desc="Upload the first file to start version history." />
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <th>Version</th>
                        <th>File</th>
                        <th>Comments</th>
                        <th>Uploaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {versions.map((v) => (
                        <tr key={v.id}>
                          <td className="font-mono font-bold">v{v.versionNumber}</td>
                          <td className="font-mono text-xs break-all">{v.filePath}</td>
                          <td className="text-ink/70">{v.comments || "—"}</td>
                          <td className="text-xs">{v.uploadedAt || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            )}

            {active === "reviews" && (
              <div className="space-y-4">
                <div className="brutal-card bg-white p-5 space-y-3">
                  <p className="font-display font-bold">Post a review</p>
                  <div className="flex flex-wrap gap-2">
                    {["PENDING", "CHANGES_REQUESTED", "APPROVED"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewStatus(s)}
                        className={`brutal-badge cursor-pointer ${reviewStatus === s ? "bg-ink text-white" : "bg-white"}`}
                      >
                        {s.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    label="Comments"
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Line level feedback, what to fix, what is good."
                  />
                  <Button variant="dark" size="sm" type="button" onClick={postReview}>
                    Post review
                  </Button>
                </div>
                {reviews.length === 0 ? (
                  <EmptyState title="No reviews yet" desc="Guide feedback appears here once posted." />
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Comments</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="text-ink/70">{r.comments || "—"}</td>
                          <td className="text-xs">{r.createdAt || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            )}

            {active === "repo" && (
              <div className="space-y-4">
                <div className="brutal-card bg-accent p-5 space-y-3">
                  <p className="font-display font-bold">GitHub repository</p>
                  {repo ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="brutal-badge bg-white font-mono text-xs break-all">{repo.repoUrl}</span>
                      <Button variant="dark" size="sm" type="button" onClick={syncRepo}>
                        Sync commits
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Input
                        label="Repo URL"
                        name="repoUrl"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/owner/name"
                      />
                      <Button variant="dark" size="sm" type="button" onClick={linkRepo}>
                        Link repo
                      </Button>
                    </div>
                  )}
                  {branches.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {branches.map((b) => (
                        <span key={b.name} className="brutal-badge bg-white font-mono text-xs">
                          {b.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {commits.length === 0 ? (
                  <EmptyState title="No commits synced" desc="Link a repo and hit sync to pull commit history." />
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <th>SHA</th>
                        <th>Message</th>
                        <th>Author</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commits.map((c) => (
                        <tr key={c.id}>
                          <td className="font-mono text-xs">{c.sha?.slice(0, 7) || c.id}</td>
                          <td className="text-ink/70">{c.message || "—"}</td>
                          <td>{c.author || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            )}

            {active === "team" && (
              <div className="space-y-4">
                <div className="brutal-card bg-secondary p-5">
                  <p className="font-display font-bold">Add team member</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Input
                      label="Student user ID"
                      name="memberId"
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                      placeholder="e.g. 4"
                    />
                    <Input
                      label="Team role"
                      name="memberRole"
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                      placeholder="MEMBER"
                    />
                    <Button variant="dark" size="sm" type="button" onClick={addMember}>
                      Add
                    </Button>
                  </div>
                </div>
                {team.length === 0 ? (
                  <EmptyState title="No team yet" desc="Add collaborators by their student user id." />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {team.map((m, i) => (
                      <div key={m.id} className="brutal-card bg-white p-4 flex items-center gap-3">
                        <Avatar name={m.studentName || `Member ${m.studentId}`} index={i} />
                        <div>
                          <p className="font-display font-bold">{m.studentName || `User ${m.studentId}`}</p>
                          <p className="font-mono text-xs uppercase">{m.teamRole}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {active === "wiki" && (
              <div className="space-y-4">
                <div className="brutal-card bg-lilac p-5 space-y-3">
                  <p className="font-display font-bold">Save wiki page</p>
                  <Input label="Title" name="wikiTitle" value={wikiTitle} onChange={(e) => setWikiTitle(e.target.value)} placeholder="Setup guide" />
                  <Textarea label="Body" value={wikiBody} onChange={(e) => setWikiBody(e.target.value)} placeholder="Markdown supported by the viewer." />
                  <Button variant="dark" size="sm" type="button" onClick={saveWiki}>
                    Save page
                  </Button>
                </div>
                {wiki.length === 0 ? (
                  <EmptyState title="No wiki pages" desc="Document setup, architecture, and demo steps here." />
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {wiki.map((p) => (
                      <div key={p.id} className="brutal-card bg-white p-4">
                        <p className="font-display font-bold">{p.title}</p>
                        <p className="mt-1 text-sm text-ink/70 whitespace-pre-wrap">{p.body || "Empty page."}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {active === "result" && (
              <EmptyState
                title="Evaluation lives on the evaluator flow"
                desc="Rubric marks and feedback appear here after an evaluator submits. Evaluators use the Assigned queue."
                actionHref="/evaluator/assigned"
                actionLabel="Go to assigned"
              />
            )}
          </>
        )}
      </div>
    </Protected>
  );
}
