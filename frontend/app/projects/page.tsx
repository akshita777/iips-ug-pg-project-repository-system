import type { Metadata } from "next";
import { ProjectsList } from "./list";

export const metadata: Metadata = {
  title: "Projects | IIPS Project Portal",
  description: "All academic projects with status",
};

export default function ProjectsPage() {
  return <ProjectsList />;
}
