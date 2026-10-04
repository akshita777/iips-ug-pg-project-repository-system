import type { Metadata } from "next";
import Link from "next/link";
import { PageBand } from "@/components/layout/page-band";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Showcase | IIPS Project Portal",
  description: "Evaluated IIPS projects on public display.",
};

export const dynamic = "force-dynamic";

interface ShowcaseProject {
  id: number;
  title: string;
  abstractText?: string;
  techStack?: string;
  status: string;
}

async function loadShowcase(): Promise<ShowcaseProject[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    const res = await fetch(`${base}/projects/showcase`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as ShowcaseProject[];
  } catch {
    return [];
  }
}

export default async function ShowcasePage() {
  const projects = await loadShowcase();

  return (
    <>
      <PageBand
        kicker="Public gallery"
        title="Project showcase"
        lead="Evaluated projects from the IIPS repository, published for the institute."
        crumbs={[{ label: "Showcase" }]}
      />
      <div className="section">
        <div className="wrap">
          {projects.length === 0 ? (
            <Card>
              <CardTitle>No evaluated projects yet</CardTitle>
              <p className="muted small m-0">
                The showcase fills automatically once projects reach evaluated status.
              </p>
            </Card>
          ) : (
            <div className="grid grid-3">
              {projects.map((p) => (
                <Card key={p.id}>
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={p.status} />
                    {p.techStack && <span className="chip font-mono">{p.techStack}</span>}
                  </div>
                  <h3 className="mt-3">
                    <Link href={`/projects/${p.id}`} className="no-underline hover:underline">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="muted m-0">{p.abstractText || "No abstract published."}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
