"use client";

import { ErrorCard } from "@/components/ui/error-card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorCard title="Projects are unavailable" error={error} reset={reset} />;
}
