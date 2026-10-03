import Link from "next/link";

export function EmptyState({
  title,
  desc,
  actionHref,
  actionLabel,
}: {
  title: string;
  desc: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="brutal-card border-dashed p-8 text-center">
      <p className="font-display text-lg font-black">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink/70">{desc}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="brutal-btn bg-white text-sm mt-4">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
