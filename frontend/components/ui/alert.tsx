import * as React from "react";
import { cn } from "@/lib/utils";

type AlertTone = "info" | "success" | "warn" | "danger" | "neutral" | "lilac";

const tones: Record<AlertTone, string> = {
  info: "bg-blue-soft text-navy border border-blue/20 rounded-card px-4 py-2.5 text-sm font-semibold",
  success: "bg-good-soft text-good border border-good/20 rounded-card px-4 py-2.5 text-sm font-semibold",
  warn: "bg-warn-soft text-warn border border-warn/20 rounded-card px-4 py-2.5 text-sm font-semibold",
  danger: "bg-bad-soft text-bad border border-bad/20 rounded-card px-4 py-2.5 text-sm font-semibold",
  neutral: "bg-paper text-ink border border-line rounded-card px-4 py-2.5 text-sm font-semibold",
  lilac: "bg-band text-ink border border-line rounded-card px-4 py-2.5 text-sm font-semibold",
};

export function Alert({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: AlertTone }) {
  return <div role="alert" className={cn(tones[tone], className)} {...props} />;
}
