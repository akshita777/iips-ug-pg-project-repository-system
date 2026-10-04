import type { Metadata } from "next";
import Link from "next/link";
import { NewProjectForm } from "./form";
import { SubmitGate } from "./gate";
import { PageBand } from "@/components/layout/page-band";

import { Protected } from "@/components/layout/protected";

export const metadata: Metadata = {
  title: "Submit project | IIPS Project Portal",
  description: "Submit an MCA (5 Years) Integrated project with version history",
};

export default function NewProjectPage() {
  return (
    <Protected allowed={["STUDENT"]}>
      <PageBand
        kicker="Submission"
        title="Submit project"
        lead="Every upload becomes a numbered version. Old versions are never overwritten."
        crumbs={[{ label: "Projects", href: "/projects" }, { label: "Submit" }]}
      />
      <div className="section">
        <div className="wrap mx-auto max-w-2xl space-y-5">
          <SubmitGate>
            <NewProjectForm />
          </SubmitGate>
          <p className="text-sm text-center">
            <Link href="/dashboard" className="font-semibold">
              Back to dashboard
            </Link>
          </p>
        </div>
      </div>
    </Protected>
  );
}
