"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const linksByRole: Record<Role, { href: string; label: string }[]> = {
  STUDENT: [
    { href: "/dashboard", label: "Overview" },
    { href: "/projects", label: "My projects" },
    { href: "/projects/new", label: "Submit" },
    { href: "/preferences", label: "Preferences" },
  ],
  FACULTY: [
    { href: "/dashboard", label: "Overview" },
    { href: "/guide/reviews", label: "Reviews" },
    { href: "/guide/students", label: "Students" },
    { href: "/projects", label: "Projects" },
  ],
  COORDINATOR: [
    { href: "/dashboard", label: "Overview" },
    { href: "/coordinator/allocation", label: "Allocation" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/projects", label: "Projects" },
  ],
  EVALUATOR: [
    { href: "/dashboard", label: "Overview" },
    { href: "/evaluator/assigned", label: "Assigned" },
    { href: "/projects", label: "Projects" },
  ],
  ADMIN: [
    { href: "/dashboard", label: "Overview" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/projects", label: "Projects" },
  ],
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = linksByRole[role] ?? linksByRole.STUDENT;

  return (
    <aside aria-label="Dashboard navigation" className="brutal-card bg-white p-3 md:sticky md:top-4">
      <nav className="flex flex-row gap-2 overflow-x-auto md:flex-col md:overflow-visible">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "brutal-badge whitespace-nowrap",
                active ? "bg-ink text-white" : "bg-white hover:bg-primary hover:text-white"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
