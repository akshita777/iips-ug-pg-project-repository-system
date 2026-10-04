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
        <label htmlFor={inputId} className="ctl-label">
          {label}
        </label>
      )}
      <input id={inputId} className={cn("ctl-input", error && "border-bad", className)} {...props} />
      {error && <p className="text-sm font-semibold text-bad">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="ctl-label">
          {label}
        </label>
      )}
      <textarea id={inputId} className={cn("ctl-input min-h-28", error && "border-bad", className)} {...props} />
      {error && <p className="text-sm font-semibold text-bad">{error}</p>}
    </div>
  );
}
