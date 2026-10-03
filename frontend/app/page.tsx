import Link from "next/link";
import { ArrowRight, BookOpen, GitBranch, Users } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Project Repository",
    desc: "Submit and track BCA and MCA final projects with full version history.",
    bg: "bg-primary",
  },
  {
    icon: Users,
    title: "Guide Allocation",
    desc: "Preference based allocation with coordinator review and approval.",
    bg: "bg-secondary",
  },
  {
    icon: GitBranch,
    title: "Version Control",
    desc: "Link GitHub repos, track commits, branches and code reviews.",
    bg: "bg-accent",
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="brutal-card bg-primary p-8 md:p-12 text-center">
        <span className="brutal-badge bg-white">OOAD Lab Project</span>
        <h1 className="mt-4 text-4xl md:text-6xl font-black leading-tight">
          IIPS Project
          <br />
          Portal
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base md:text-lg font-body">
          Academic project repository and record management for BCA Sem 1-6 and MCA Sem 7-10.
          Submit projects, get guides allocated, track versions, and get evaluated.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className="brutal-btn bg-ink text-white text-base">
            Get Started <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="brutal-btn bg-white text-base">
            Login
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="brutal-card p-6">
            <div className={`inline-flex items-center justify-center border-2 border-ink rounded-lg p-2.5 ${f.bg}`}>
              <f.icon size={22} strokeWidth={2.5} />
            </div>
            <h2 className="mt-4 text-xl font-black">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="brutal-card p-6 md:p-8">
        <h2 className="text-2xl font-black">How it works</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-4 text-sm">
          {[
            ["1", "Register", "Create your student or faculty account."],
            ["2", "Submit", "Upload your project with version history."],
            ["3", "Review", "Guide reviews and approves your work."],
            ["4", "Evaluate", "Evaluators grade using a rubric."],
          ].map(([n, title, desc]) => (
            <li key={n} className="border-2 border-ink rounded-lg bg-muted p-4">
              <span className="brutal-badge bg-ink text-white">{n}</span>
              <p className="mt-2 font-display font-bold">{title}</p>
              <p className="mt-1">{desc}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
