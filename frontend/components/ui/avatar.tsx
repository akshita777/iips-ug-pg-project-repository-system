import { cn } from "@/lib/utils";

const fills = ["bg-primary", "bg-secondary", "bg-accent", "bg-success", "bg-warn", "bg-lilac"];

export function Avatar({ name, index = 0, className }: { name: string; index?: number; className?: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center border-2 border-ink rounded-full font-display text-xs font-black",
        fills[index % fills.length],
        className
      )}
    >
      {initials || "?"}
    </span>
  );
}
