import { cn } from "@/lib/utils";

type GradeTone = "a" | "b" | "c" | "d" | "p";

const tones: Record<GradeTone, string> = {
  a: "bg-good-soft text-good border-good/30",
  b: "bg-blue-soft text-navy border-blue/30",
  c: "bg-warn-soft text-warn border-warn/30",
  d: "bg-band text-ink-2 border-line-strong",
  p: "bg-paper text-muted border-dashed border-line-strong font-semibold text-[0.78rem]",
};

function toneFor(marks: number | null | undefined, max: number): GradeTone {
  if (marks === null || marks === undefined) return "p";
  const ratio = max > 0 ? marks / max : 0;
  if (ratio >= 0.75) return "a";
  if (ratio >= 0.6) return "b";
  if (ratio >= 0.4) return "c";
  return "d";
}

/** Letter grade pill derived from marks, mirroring the reference Grade component. */
export function Grade({
  marks,
  max = 100,
  className,
}: {
  marks?: number | null;
  max?: number;
  className?: string;
}) {
  if (marks === null || marks === undefined) {
    return (
      <span title="Not evaluated yet" className={cn("grade", tones.p, className)}>
        Pending
      </span>
    );
  }
  const tone = toneFor(marks, max);
  const letter = tone === "a" ? "A" : tone === "b" ? "B" : tone === "c" ? "C" : "D";
  return (
    <span title={`Grade ${letter}, ${marks} of ${max}`} className={cn("grade", tones[tone], className)}>
      <span className="sr-only">Grade </span>
      {letter}
    </span>
  );
}
