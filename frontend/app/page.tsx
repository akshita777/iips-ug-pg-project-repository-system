import Link from "next/link";
import { ArrowRight, BookOpen, GitBranch, Users, Sparkles } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Project Repository",
    desc: "Submit and track BCA and MCA final projects with full version history.",
    bg: "bg-primary",
    tilt: "-rotate-1",
  },
  {
    icon: Users,
    title: "Guide Allocation",
    desc: "Preference based allocation with coordinator review and approval.",
    bg: "bg-secondary",
    tilt: "rotate-1",
  },
  {
    icon: GitBranch,
    title: "Version Control",
    desc: "Link GitHub repos, track commits, branches and code reviews.",
    bg: "bg-accent",
    tilt: "-rotate-1",
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="brutal-card relative overflow-hidden bg-primary p-8 md:p-12 text-center">
        <div className="absolute -left-6 top-6 -rotate-12 brutal-badge bg-secondary hidden md:inline-flex">
          BCA plus MCA
        </div>
        <div className="absolute -right-6 top-6 rotate-12 brutal-badge bg-accent hidden md:inline-flex">
          Sem 1 to 10
        </div>
        <span className="brutal-badge bg-white">
          <Sparkles size={14} className="mr-1" /> OOAD Lab Project
        </span>
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
          <div key={f.title} className={`brutal-card brutal-card-hover p-6 ${f.tilt}`}>
            <div className={`inline-flex items-center justify-center border-2 border-ink rounded-lg p-2.5 ${f.bg}`}>
              <f.icon size={22} strokeWidth={2.5} />
            </div>
            <h2 className="mt-4 text-xl font-black">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="brutal-card bg-white p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-black">How it works</h2>
          <Link href="/design-system" className="font-mono text-xs font-bold uppercase tracking-wide underline underline-offset-4">
            View design system
          </Link>
        </div>
        <ol className="mt-4 grid gap-3 md:grid-cols-4 text-sm">
          {[
            ["1", "Register", "Create your student or faculty account.", "bg-primary"],
            ["2", "Submit", "Upload your project with version history.", "bg-accent"],
            ["3", "Review", "Guide reviews and approves your work.", "bg-secondary"],
            ["4", "Evaluate", "Evaluators grade using a rubric.", "bg-success"],
          ].map(([n, title, desc, bg]) => (
            <li key={n} className={`border-2 border-ink rounded-lg p-4 ${bg}`}>
              <span className="brutal-badge bg-ink text-white">{n}</span>
              <p className="mt-2 font-display font-bold">{title}</p>
              <p className="mt-1 text-ink/70">{desc}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
