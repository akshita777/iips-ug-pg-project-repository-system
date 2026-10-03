"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";

const roleContent: Record<string, { title: string; desc: string; cards: [string, string, string][] }> = {
  STUDENT: {
    title: "Student Dashboard",
    desc: "Your projects, versions, and evaluation results.",
    cards: [
      ["My Projects", "Create and submit BCA or MCA projects.", "bg-primary"],
      ["Versions", "Every upload is saved as a new version.", "bg-accent"],
      ["Results", "View rubric based evaluation and feedback.", "bg-success"],
    ],
  },
  FACULTY: {
    title: "Guide Dashboard",
    desc: "Review submissions from your allocated students.",
    cards: [
      ["Pending Reviews", "Projects waiting for your review.", "bg-warn"],
      ["My Students", "Students allocated to you.", "bg-accent"],
      ["History", "Already reviewed submissions.", "bg-muted"],
    ],
  },
  COORDINATOR: {
    title: "Coordinator Dashboard",
    desc: "Allocate guides and track evaluation progress.",
    cards: [
      ["Guide Allocation", "Run auto allocation or override manually.", "bg-secondary"],
      ["Evaluation Status", "Track pending and completed evaluations.", "bg-primary"],
      ["Reports", "Department level summaries.", "bg-accent"],
    ],
  },
  EVALUATOR: {
    title: "Evaluator Dashboard",
    desc: "Evaluate assigned projects using rubrics.",
    cards: [
      ["Assigned", "Projects assigned for evaluation.", "bg-primary"],
      ["In Progress", "Evaluations you started.", "bg-warn"],
      ["Completed", "Finished evaluations.", "bg-success"],
    ],
  },
  ADMIN: {
    title: "Admin Dashboard",
    desc: "Manage users, roles, and system settings.",
    cards: [
      ["Users", "Manage student and faculty accounts.", "bg-accent"],
      ["Roles", "Assign and change roles.", "bg-secondary"],
      ["System", "Configuration and backups.", "bg-muted"],
    ],
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState("STUDENT");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setRole(localStorage.getItem("role") ?? "STUDENT");
  }, [router]);

  const content = roleContent[role] ?? roleContent.STUDENT;

  return (
    <div className="space-y-6">
      <div className="brutal-card bg-white p-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black">{content.title}</h1>
          <p className="mt-1 text-sm text-ink/70">{content.desc}</p>
        </div>
        <StatusBadge status={role} className="bg-ink text-white" />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {content.cards.map(([title, desc, bg]) => (
          <Card key={title} className={bg}>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="!text-ink/80">{desc}</CardDescription>
          </Card>
        ))}
      </div>
    </div>
  );
}
