import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("brutal-card p-6", className)} {...props} />;
}

export function CardHover({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("brutal-card brutal-card-hover p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-xl font-black", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-sm text-ink/70", className)} {...props} />;
}
