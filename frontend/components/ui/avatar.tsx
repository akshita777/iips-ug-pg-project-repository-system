import { cn } from "@/lib/utils";

const fills = [
  "bg-blue-soft text-navy",
  "bg-good-soft text-good",
  "bg-warn-soft text-warn",
  "bg-band text-ink",
];

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
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-xs font-bold",
        fills[index % fills.length],
        className
      )}
    >
      {initials || "?"}
    </span>
  );
}
