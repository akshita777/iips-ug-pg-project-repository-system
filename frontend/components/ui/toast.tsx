"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Toast {
  id: number;
  message: string;
  tone: "success" | "danger" | "info";
}

const ToastContext = React.createContext<{ push: (message: string, tone?: Toast["tone"]) => void } | null>(null);

let nextId = 1;

const toneStyles: Record<Toast["tone"], string> = {
  success: "bg-good-soft text-good border-good/20",
  danger: "bg-bad-soft text-bad border-bad/20",
  info: "bg-blue-soft text-navy border-blue/20",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const push = React.useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex w-72 flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={cn("rounded-card border bg-paper px-4 py-2.5 text-sm font-semibold shadow-card", toneStyles[t.tone])}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
