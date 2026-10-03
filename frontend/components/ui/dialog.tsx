"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={cn("brutal-card w-full max-w-lg bg-white p-6")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-black">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="brutal-badge cursor-pointer bg-muted"
          >
            Esc
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
