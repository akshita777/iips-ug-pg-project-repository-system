"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="tablist" aria-label="Sections" className="seg no-print">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          aria-pressed={active === tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn("seg-btn", active === tab.id && "bg-navy text-white")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
