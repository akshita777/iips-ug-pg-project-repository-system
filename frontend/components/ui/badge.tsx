import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted",
  SUBMITTED: "bg-accent",
  UNDER_REVIEW: "bg-warn",
  APPROVED: "bg-success",
  REJECTED: "bg-danger text-white",
  EVALUATION_PENDING: "bg-secondary",
  EVALUATED: "bg-primary",
  ARCHIVED: "bg-muted",
  PENDING: "bg-muted",
  CONFIRMED: "bg-success",
  ACTIVE: "bg-accent",
  COMPLETED: "bg-primary",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const label = status.replace(/_/g, " ");
  return (
    <span className={cn("brutal-badge", statusColors[status] ?? "bg-white", className)}>
      {label}
    </span>
  );
}
