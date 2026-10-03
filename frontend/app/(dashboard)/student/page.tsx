"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Project } from "@/lib/types";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const semesters = Array.from({ length: 10 }, (_, i) => i + 1);

export default function StudentDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentSemester = 6; // TODO: drive from student profile once available

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    api
      .get<Project[]>("/projects")
      .then((res) => setProjects(res.data))
      .catch(() => setError("Could not load projects."))
      .finally(() => setLoading(false));
  }, [router]);

  async function submitProject(id: number) {
    try {
      await api.post(`/projects/${id}/submit`);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "SUBMITTED" } : p))
      );
    } catch {
      setError("Submit failed.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="brutal-card bg-white p-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black">Student Dashboard</h1>
          <p className="mt-1 text-sm text-ink/70">
            Your projects, versions, and evaluation results.
          </p>
        </div>
        <Link href="/student/projects/new" className="brutal-btn bg-primary text-ink">
          New Project
        </Link>
      </div>

      <section>
        <h2 className="font-display text-xl font-black mb-3">Progress Tracker</h2>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {semesters.map((sem) => (
            <div
              key={sem}
              className={`brutal-card p-3 text-center text-sm font-bold ${
                sem === currentSemester
                  ? "bg-primary"
                  : sem < currentSemester
                  ? "bg-success"
                  : "bg-muted"
              }`}
            >
              Sem {sem}
              <div className="text-[10px] font-body">{sem <= 6 ? "BCA" : "MCA"}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-black mb-3">My Projects</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-danger font-bold">{error}</p>}
        {!loading && projects.length === 0 && (
          <Card>
            <CardDescription>No projects yet. Create your first one.</CardDescription>
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.id} className="bg-white">
              <div className="flex items-start justify-between gap-2">
                <CardTitle>{p.title}</CardTitle>
                <StatusBadge status={p.status} />
              </div>
              <CardDescription>{p.abstractText ?? "No abstract yet."}</CardDescription>
              {p.techStack && (
                <p className="mt-2 text-xs font-bold text-ink/60">{p.techStack}</p>
              )}
              {p.status === "DRAFT" && (
                <Button size="sm" className="mt-3" onClick={() => submitProject(p.id)}>
                  Submit
                </Button>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-black mb-3">Version History</h2>
        <Card>
          <CardDescription>
            No versions uploaded yet. Version history appears once submissions are added.
          </CardDescription>
        </Card>
      </section>

      <section>
        <h2 className="font-display text-xl font-black mb-3">Evaluation Results</h2>
        <Card>
          <CardDescription>
            No evaluations yet. Rubric scores and feedback will show here.
          </CardDescription>
        </Card>
      </section>
    </div>
  );
}
