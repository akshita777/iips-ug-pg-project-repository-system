"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [abstractText, setAbstractText] = useState("");
  const [techStack, setTechStack] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post("/projects", { title, abstractText, techStack });
      router.push("/student");
    } catch {
      setError("Could not create project.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl md:text-3xl font-black">New Project</h1>
      <form onSubmit={handleSubmit} className="brutal-card bg-white p-6 space-y-4">
        <Input
          label="Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project title"
        />
        <Textarea
          label="Abstract"
          name="abstractText"
          value={abstractText}
          onChange={(e) => setAbstractText(e.target.value)}
          placeholder="Short description of the project"
        />
        <Input
          label="Tech Stack"
          name="techStack"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          placeholder="e.g. Next.js, Spring Boot, PostgreSQL"
        />
        {error && <p className="text-sm font-bold text-danger">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create Project"}
          </Button>
          <Button type="button" variant="white" onClick={() => router.push("/student")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
