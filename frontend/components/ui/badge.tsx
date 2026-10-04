import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted",
  SUBMITTED: "bg-accent",
  UNDER_REVIEW: "bg-warn",
  APPROVED: "bg-success",
  REJECTED: "bg-danger text-dangerInk",
  EVALUATION_PENDING: "bg-secondary",
  EVALUATED: "bg-primary text-white",
  ARCHIVED: "bg-muted",
  PENDING: "bg-warn",
  CONFIRMED: "bg-success",
  ACTIVE: "bg-accent",
  COMPLETED: "bg-primary text-white",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const label = status.replace(/_/g, " ");
  return (
    <span className={cn("brutal-badge", statusColors[status] ?? "bg-white", className)}>
      {label}
    </span>
  );
}
