import * as React from "react";
import { cn } from "@/lib/utils";

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  label: string;
  name?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
}) {
  const id = name ?? label;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="ctl-label">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("ctl-input", error && "border-bad")}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm font-semibold text-bad">{error}</p>}
    </div>
  );
}
