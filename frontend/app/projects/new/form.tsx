"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <Card className="bg-white">
      <div className="space-y-4">
        <Input
          label="Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Smart attendance system"
        />
        <Textarea
          label="Abstract"
          name="abstractText"
          value={abstractText}
          onChange={(e) => setAbstractText(e.target.value)}
          placeholder="What problem does it solve and how?"
        />
        <Input
          label="Tech stack"
          name="techStack"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          placeholder="Next.js, Spring Boot, PostgreSQL"
        />
        <div className="border-2 border-dashed border-ink rounded-lg bg-muted p-5 text-center text-sm">
          <p className="font-display font-bold">Report and code archive</p>
          <p className="mt-1 text-ink/70">File upload lands with version history in the next step.</p>
        </div>
        {error && <Alert tone="danger">{error}</Alert>}
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="dark" disabled={loading} onClick={() => submit(false)}>
            {loading ? "Submitting..." : "Submit for review"}
          </Button>
          <Button type="button" variant="white" disabled={loading} onClick={() => submit(true)}>
            Save as draft
          </Button>
        </div>
      </div>
    </Card>
  );
}
