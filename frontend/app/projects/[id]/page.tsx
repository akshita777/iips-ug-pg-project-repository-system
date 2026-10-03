import type { Metadata } from "next";
import { ProjectDetail } from "./detail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Project ${id} | IIPS Project Portal`,
    description: "Project files, guide review thread, and evaluation result",
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectDetail id={id} />;
}
