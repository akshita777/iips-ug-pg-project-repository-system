import Link from "next/link";
import { BookOpen, Users, GitBranch } from "lucide-react";

export default function Home() {
  return (
    <>
      <section
        className="border-b border-line"
        style={{
          background:
            "linear-gradient(rgb(255 255 255 / 0.90), rgb(255 255 255 / 0.90)), url(/brand/iips-campus.webp) center 40% / cover",
        }}
      >
        <div className="wrap py-12">
          <span className="inline-flex items-center gap-2 bg-paper border border-line-strong rounded-full px-4 py-2 text-[0.8rem] font-bold uppercase text-navy" style={{ letterSpacing: "0.06em" }}>
            <span className="inline-block h-2 w-2 rounded-full bg-good" aria-hidden="true" />
            Academic session 2026-27
          </span>
          <h1 className="mt-4">
            <span className="block">IIPS Project</span>
            <span className="block text-blue">Repository Portal</span>
          </h1>
          <p className="text-ink-2 text-lg max-w-[60ch]">
            International Institute of Professional Studies, DAVV Indore
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-ink-2 mt-2">
            <span className="inline-flex items-center gap-2">
              <BookOpen size={18} aria-hidden="true" /> MCA (5 Years) Integrated projects
            </span>
            <span className="inline-block w-px h-4 bg-line-strong" aria-hidden="true" />
            <span className="inline-flex items-center gap-2">
              <Users size={18} aria-hidden="true" /> Students, guides and evaluators
            </span>
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/projects" className="btn">
              Browse Projects
            </Link>
            <Link href="/register" className="btn btn-outline">
              Get Started
            </Link>
          </div>
          <dl className="grid gap-5 mt-10 grid-cols-2 md:grid-cols-4 max-w-3xl">
            {[
              ["Submissions", "Draft to evaluated, every version kept"],
              ["Guide allocation", "Preferences plus coordinator confirm"],
              ["Reviews", "Guide feedback threads per project"],
              ["Evaluation", "Rubric marks with feedback"],
            ].map(([term, def]) => (
              <div key={term}>
                <dt className="text-[0.85rem] font-bold uppercase text-muted" style={{ letterSpacing: "0.05em" }}>
                  {term}
                </dt>
                <dd className="m-0 mt-1 text-[0.95rem] text-ink-2">{def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid grid-3">
          {[
            {
              icon: BookOpen,
              title: "Project Repository",
              desc: "Submit BCA and MCA final projects with full version history. Every upload becomes a numbered version.",
              href: "/projects",
            },
            {
              icon: Users,
              title: "Guide Allocation",
              desc: "Rank your preferred guides. Coordinators confirm or adjust every allocation.",
              href: "/preferences",
            },
            {
              icon: GitBranch,
              title: "Reviews and Evaluation",
              desc: "Link GitHub repos, collect guide reviews, and receive rubric marks with feedback.",
              href: "/dashboard",
            },
          ].map((f) => (
            <Link key={f.title} href={f.href} className="card no-underline hover:border-blue transition-colors">
              <h2 className="card-title flex items-center gap-2">
                <f.icon size={20} aria-hidden="true" className="text-blue" />
                {f.title}
              </h2>
              <p className="muted m-0">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section-band">
        <div className="wrap grid grid-2 items-start">
          <div>
            <span className="kicker">About the portal</span>
            <h2>One place for IIPS project records</h2>
            <p className="muted">
              Submissions come from students. Guide allocations come from preferences plus
              coordinator review. Marks and feedback come from evaluators against published
              rubrics. Nothing lives in a spreadsheet.
            </p>
            <dl className="grid gap-5 mt-6 grid-cols-3">
              {[
                ["5", "Roles: student, guide, coordinator, evaluator, admin"],
                ["6", "Workflow stages from draft to evaluated"],
                ["100", "Marks scale on every rubric"],
              ].map(([v, label]) => (
                <div key={label}>
                  <dd className="m-0 num text-2xl font-extrabold text-navy">{v}</dd>
                  <dt className="text-[0.85rem] muted">{label}</dt>
                </div>
              ))}
            </dl>
          </div>
          <div className="card">
            <h3 className="kicker">How it works</h3>
            <ol className="m-0 p-0 list-none grid gap-3">
              {[
                ["Register", "Create your student, faculty, coordinator, evaluator, or admin account."],
                ["Submit", "Upload your project. Every file becomes a numbered version."],
                ["Review", "Your guide reviews, approves, or returns the submission."],
                ["Evaluate", "Evaluators grade against the rubric and leave feedback."],
              ].map(([title, desc], i) => (
                <li key={title} className="flex gap-3">
                  <span className="chip flex-none" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold m-0">{title}</p>
                    <p className="muted small m-0">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/design-system" className="text-sm font-semibold inline-block mt-4">
              View the design system
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
