import type { Metadata } from "next";
import { AnalyticsView } from "./summary";

export const metadata: Metadata = {
  title: "Analytics | IIPS Project Portal",
  description: "Department level project and evaluation summary",
};

export default function AnalyticsPage() {
  return <AnalyticsView />;
}
