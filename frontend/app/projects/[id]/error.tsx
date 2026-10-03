"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="brutal-card bg-danger p-6 text-center">
      <h2 className="font-display text-xl font-black text-dangerInk">Could not open this project</h2>
      <p className="mt-2 text-sm font-bold">{error.message || "It may have been moved or the backend is down."}</p>
      <button type="button" onClick={reset} className="brutal-btn bg-white text-sm mt-4">
        Try again
      </button>
    </div>
  );
}
