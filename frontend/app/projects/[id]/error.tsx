"use client";

import { ErrorCard } from "@/components/ui/error-card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorCard title="Could not open this project" error={error} reset={reset} />;
}
