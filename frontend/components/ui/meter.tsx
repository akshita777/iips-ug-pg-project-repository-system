import { cn } from "@/lib/utils";

export interface MeterPart {
  label: string;
  value: number | string;
}

export interface MeterPillar {
  id: string;
  label: string;
  points: number;
  max: number;
  parts?: MeterPart[];
}

/** Label + points + blue progress track, mirroring the reference ScoreBars. */
export function Meter({ pillars, className }: { pillars: MeterPillar[]; className?: string }) {
  return (
    <ul className={cn("grid gap-3.5 m-0 p-0 list-none", className)}>
      {pillars.map((p) => (
        <li key={p.id}>
          <div className="flex justify-between gap-3 text-[0.95rem] mb-1">
            <span className="font-semibold">{p.label}</span>
            <span className="num text-ink-2 whitespace-nowrap">
              <strong className="text-navy">{p.points}</strong> / {p.max}
            </span>
          </div>
          <div className="h-2.5 bg-band rounded-sm overflow-hidden" aria-hidden="true">
            <div className="h-full bg-blue" style={{ width: `${p.max > 0 ? (p.points / p.max) * 100 : 0}%` }} />
          </div>
          {p.parts && p.parts.length > 0 && (
            <p className="mt-1 text-[0.82rem] muted">
              {p.parts.map((part, i) => (
                <span key={part.label}>
                  {i > 0 && (
                    <span className="mx-1.5" aria-hidden="true">
                      ·
                    </span>
                  )}
                  {part.label} <strong>{part.value}</strong>
                </span>
              ))}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
