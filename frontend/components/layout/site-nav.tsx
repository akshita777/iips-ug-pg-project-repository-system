"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
];

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { token, email, logout, ready } = useAuth();
  const [open, setOpen] = useState(false);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav className="bg-blue sticky top-0 z-20 shadow-nav no-print" aria-label="Main">
      <div className="wrap flex items-center gap-3 min-h-[52px]">
        <button
          className="hidden max-[820px]:inline-flex items-center gap-2 min-h-[44px] px-2.5 bg-transparent border border-white/50 rounded-ctl text-white font-bold uppercase text-[0.85rem] cursor-pointer"
          type="button"
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
          <span>Menu</span>
        </button>
        <ul
          id="main-menu"
          className={cn(
            "flex list-none m-0 p-0 flex-1 max-[820px]:absolute max-[820px]:top-full max-[820px]:left-0 max-[820px]:right-0 max-[820px]:flex-col max-[820px]:bg-blue max-[820px]:border-t max-[820px]:border-white/20 max-[820px]:shadow-menu",
            !open && "max-[820px]:hidden"
          )}
        >
          {links.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active(item.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center h-[52px] px-4 text-white no-underline text-[0.86rem] font-bold uppercase whitespace-nowrap hover:bg-black/10 max-[820px]:h-[50px] max-[820px]:border-b max-[820px]:border-white/10",
                  active(item.href) && "bg-navy"
                )}
                style={{ letterSpacing: "0.05em" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        {ready && token ? (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-white/85 text-sm hidden sm:inline">{email}</span>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="text-white text-[0.8rem] font-bold uppercase border border-white/50 rounded-ctl px-3 min-h-[36px] cursor-pointer bg-transparent"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="text-white text-[0.8rem] font-bold uppercase no-underline px-2 hidden sm:inline"
            >
              Login
            </Link>
            <Link href="/projects/new" className="btn btn-amber btn-small ml-auto">
              <Search size={16} /> Submit Project
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
