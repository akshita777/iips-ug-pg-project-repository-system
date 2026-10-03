import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="font-display text-sm font-bold uppercase tracking-wide">
          {label}
        </label>
      )}
      <input id={inputId} className={cn("brutal-input", error && "border-danger", className)} {...props} />
      {error && <p className="text-sm font-bold text-danger">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, id, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="font-display text-sm font-bold uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea id={inputId} className={cn("brutal-input min-h-28", error && "border-danger", className)} {...props} />
      {error && <p className="text-sm font-bold text-danger">{error}</p>}
    </div>
  );
}
