"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import api from "@/lib/api";

export function NewProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [abstractText, setAbstractText] = useState("");
  const [techStack, setTechStack] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(draft: boolean) {
    setError("");
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/projects", {
        title: title.trim(),
        abstractText: abstractText.trim() || undefined,
        techStack: techStack.trim() || undefined,
      });
      const id = data?.id;
      if (!draft && id) {
        await api.post(`/projects/${id}/submit`);
      }
      router.push(id ? `/projects/${id}` : "/dashboard");
    } catch {
      setError("Could not save. Check the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="space-y-4">
        <Input
          label="Project title *"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Smart Attendance System using Face Recognition"
        />
        <Textarea
          label="Abstract"
          name="abstractText"
          value={abstractText}
          onChange={(e) => setAbstractText(e.target.value)}
          placeholder="What problem does it solve and how? Aim for 3 to 5 sentences."
        />
        <Input
          label="Tech stack"
          name="techStack"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          placeholder="e.g. Next.js, Spring Boot, PostgreSQL"
        />
        <div className="border border-dashed border-line-strong rounded-card bg-band p-5 text-center text-sm">
          <p className="font-mono text-xs font-bold uppercase text-muted mb-1" style={{ letterSpacing: "0.08em" }}>
            Report and code archive
          </p>
          <p className="mt-1 muted leading-relaxed">File upload lands with version history in the next step.</p>
        </div>
        {error && <Alert tone="danger">{error}</Alert>}
        <div className="flex flex-wrap gap-3 pt-1">
          <Button type="button" disabled={loading} onClick={() => submit(false)}>
            {loading ? "Submitting..." : "Submit for review"}
          </Button>
          <Button type="button" variant="white" disabled={loading} onClick={() => submit(true)}>
            Save as draft
          </Button>
        </div>
      </div>
    </div>
  );
}
