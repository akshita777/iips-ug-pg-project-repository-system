import Link from "next/link";
import * as React from "react";

export interface Crumb {
  label: string;
  href?: string;
}

/** Campus-wash page hero with breadcrumbs, kicker, title and lead. */
export function PageBand({
  title,
  kicker,
  lead,
  crumbs = [],
  children,
}: {
  title: string;
  kicker?: string;
  lead?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <section
      className="border-b border-line"
      style={{
        background:
          "linear-gradient(rgb(248 250 252 / 0.94), rgb(248 250 252 / 0.94)), url(/brand/iips-campus.webp) center 40% / cover",
      }}
    >
      <div className="wrap py-[22px] pb-[30px]">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="no-print">
            <ol className="flex flex-wrap gap-1.5 list-none m-0 mb-[18px] p-0 text-[0.88rem] muted">
              <li>
                <Link href="/" className="no-underline hover:underline">
                  Home
                </Link>
              </li>
              {crumbs.map((c) => (
                <li key={c.label} className="before:content-['/'] before:mr-1.5 before:text-line-strong">
                  {c.href ? (
                    <Link href={c.href} className="no-underline hover:underline">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page">{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {kicker && <span className="kicker">{kicker}</span>}
        <h1 className="mb-1.5">{title}</h1>
        {lead && <p className="lead m-0 max-w-[70ch]">{lead}</p>}
        {children}
      </div>
    </section>
  );
}
