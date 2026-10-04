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
    <div className="card text-center">
      <p className="text-lg font-bold text-navy">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-[0.95rem] muted">{desc}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn btn-outline btn-small mt-4">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
