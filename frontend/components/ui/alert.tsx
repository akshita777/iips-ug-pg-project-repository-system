import * as React from "react";
import { cn } from "@/lib/utils";

type AlertTone = "info" | "success" | "warn" | "danger" | "neutral" | "lilac";

const tones: Record<AlertTone, string> = {
  info: "bg-accent",
  success: "bg-success",
  warn: "bg-warn",
  danger: "bg-danger text-dangerInk",
  neutral: "bg-white",
  lilac: "bg-lilac",
};

export function Alert({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: AlertTone }) {
  return <div role="alert" className={cn("brutal-alert", tones[tone], className)} {...props} />;
}
