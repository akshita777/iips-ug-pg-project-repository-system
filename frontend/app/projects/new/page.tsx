import type { Metadata } from "next";
import Link from "next/link";
import { NewProjectForm } from "./form";

export const metadata: Metadata = {
  title: "Submit project | IIPS Project Portal",
  description: "Submit a BCA or MCA project with version history",
};

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="brutal-card bg-primary p-6">
        <span className="brutal-badge bg-white">Submission</span>
        <h1 className="mt-2 text-2xl md:text-3xl font-black">Submit project</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every upload becomes a numbered version. Old versions are never overwritten.
        </p>
      </div>
      <NewProjectForm />
      <p className="text-sm text-center">
        <Link href="/dashboard" className="font-bold underline underline-offset-2">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
