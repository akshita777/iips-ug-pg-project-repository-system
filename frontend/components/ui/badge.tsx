import { cn } from "@/lib/utils";

const statusTones: Record<string, string> = {
  DRAFT: "bg-band text-ink-2",
  SUBMITTED: "bg-blue-soft text-navy",
  UNDER_REVIEW: "bg-warn-soft text-warn",
  APPROVED: "bg-good-soft text-good",
  REJECTED: "bg-bad-soft text-bad",
  EVALUATION_PENDING: "bg-warn-soft text-warn",
  EVALUATED: "bg-good-soft text-good",
  ARCHIVED: "bg-band text-ink-2",
  PENDING: "bg-warn-soft text-warn",
  CONFIRMED: "bg-good-soft text-good",
  ACTIVE: "bg-blue-soft text-navy",
  COMPLETED: "bg-good-soft text-good",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const label = status.replace(/_/g, " ");
  return <span className={cn("chip", statusTones[status] ?? "bg-band text-ink-2", className)}>{label}</span>;
}
