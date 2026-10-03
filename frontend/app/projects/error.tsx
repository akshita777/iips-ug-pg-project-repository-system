"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md">
      <div className="brutal-card bg-danger p-6 text-center">
        <h2 className="font-display text-2xl font-black text-dangerInk">Something broke</h2>
        <p className="mt-2 text-sm font-bold">{error.message || "Try again. Your work is safe."}</p>
        <button type="button" onClick={reset} className="brutal-btn bg-white text-sm mt-4">
          Try again
        </button>
      </div>
    </div>
  );
}
