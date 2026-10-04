"use client";

export function ErrorCard({
  title,
  error,
  reset,
}: {
  title: string;
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="section">
      <div className="wrap">
        <div className="mx-auto max-w-md card text-center">
          <span className="kicker">Something broke</span>
          <h2>{title}</h2>
          <p className="text-sm font-semibold text-bad">{error.message || "Try again. Your work is safe."}</p>
          <button type="button" onClick={reset} className="btn btn-outline btn-small mt-4">
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
