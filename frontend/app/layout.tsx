import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/ui/toast";
import { SiteNav } from "@/components/layout/site-nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "IIPS Project Portal | Academic Projects at IIPS, DAVV Indore",
  description:
    "Project submissions, guide allocation, reviews and evaluations for MCA (Integrated) at IIPS, DAVV Indore.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceMono.variable} font-sans min-h-screen bg-paper`}>
        <a
          href="#main"
          className="absolute left-2 -top-[60px] z-[100] bg-navy text-white px-4 py-2.5 font-bold focus:top-2"
        >
          Skip to content
        </a>

        <header className="bg-paper">
          <div className="wrap flex items-center justify-between gap-5 py-3.5">
            <Link href="/" className="flex items-center gap-3 no-underline min-w-0">
              <Image src="/brand/davv-logo.webp" alt="DAVV logo" width={48} height={48} className="h-12 w-auto" />
              <Image src="/brand/iips-logo.webp" alt="IIPS logo" width={43} height={48} className="h-12 w-auto max-[560px]:hidden" />
              <span className="flex flex-col leading-[1.3] pl-3 border-l border-line">
                <span className="text-[0.68rem] font-bold uppercase text-muted" style={{ letterSpacing: "0.08em" }}>
                  Project records of
                </span>
                <strong className="text-navy text-[1.05rem] max-[560px]:text-[0.95rem]">
                  International Institute of Professional Studies
                </strong>
                <span className="text-ink-2 text-[0.85rem] max-[560px]:text-[0.78rem]">
                  Devi Ahilya Vishwavidyalaya (DAVV), Indore, India
                </span>
              </span>
            </Link>
            <div className="flex flex-col items-end text-right pr-4 border-r-[3px] border-r-navy leading-[1.3] max-[980px]:hidden">
              <strong className="text-navy text-[1.3rem] font-extrabold">IIPS Project Portal</strong>
              <span className="text-[0.7rem] font-bold uppercase text-muted" style={{ letterSpacing: "0.06em" }}>
                Submissions, guides and evaluations
              </span>
            </div>
          </div>
        </header>

        <AuthProvider>
          <ToastProvider>
            <SiteNav />
            <div className="bg-cream border-b border-cream-line text-[0.9rem] no-print">
              <div className="wrap flex items-center gap-3 py-[7px] text-amber-text">
                <span className="bg-[#c2410c] text-white text-[0.68rem] font-extrabold uppercase px-2 py-0.5 rounded-[3px] flex-none" style={{ letterSpacing: "0.06em" }}>
                  Notice
                </span>
                <span>
                  Academic session 2026-27: MCA (5 Years) Integrated final submissions open.{" "}
                  <Link href="/projects/new" className="text-amber-text font-semibold">
                    Submit your project
                  </Link>
                  .
                </span>
              </div>
            </div>

            <main id="main" tabIndex={-1}>
              {children}
            </main>

            <footer className="bg-band border-t border-line mt-0">
              <div className="wrap grid gap-8 py-11 pb-8 grid-cols-[1.3fr_1fr_1fr_1.3fr] max-[980px]:grid-cols-2 max-[560px]:grid-cols-1 max-[560px]:gap-6">
                <div>
                  <p className="flex items-center gap-2.5 text-navy font-extrabold text-[1.15rem]">
                    <Image src="/brand/iips-logo.webp" alt="" width={34} height={38} />
                    IIPS Project Portal
                  </p>
                  <p className="small muted">
                    Project submissions, guide allocation, reviews and evaluations for IIPS, DAVV Indore.
                  </p>
                </div>
                <div>
                  <h2 className="text-[0.8rem] uppercase text-navy mb-3" style={{ letterSpacing: "0.08em" }}>
                    Quick links
                  </h2>
                  <ul className="list-none m-0 p-0 grid gap-1.5 text-[0.93rem]">
                    <li><Link href="/dashboard" className="text-ink-2 no-underline hover:underline">Dashboard</Link></li>
                    <li><Link href="/projects" className="text-ink-2 no-underline hover:underline">Projects</Link></li>
                    <li><Link href="/preferences" className="text-ink-2 no-underline hover:underline">Preferences</Link></li>
                    <li><Link href="/notifications" className="text-ink-2 no-underline hover:underline">Notifications</Link></li>
                  </ul>
                </div>
                <div>
                  <h2 className="text-[0.8rem] uppercase text-navy mb-3" style={{ letterSpacing: "0.08em" }}>
                    Workflows
                  </h2>
                  <ul className="list-none m-0 p-0 grid gap-1.5 text-[0.93rem]">
                    <li><Link href="/projects/new" className="text-ink-2 no-underline hover:underline">Submit project</Link></li>
                    <li><Link href="/coordinator/allocation" className="text-ink-2 no-underline hover:underline">Guide allocation</Link></li>
                    <li><Link href="/evaluator/assigned" className="text-ink-2 no-underline hover:underline">Evaluation</Link></li>
                    <li><Link href="/admin/analytics" className="text-ink-2 no-underline hover:underline">Analytics</Link></li>
                  </ul>
                </div>
                <div>
                  <h2 className="text-[0.8rem] uppercase text-navy mb-3" style={{ letterSpacing: "0.08em" }}>
                    Address
                  </h2>
                  <address className="small not-italic text-ink-2 leading-[1.7]">
                    International Institute of Professional Studies (IIPS),
                    <br />
                    Devi Ahilya Vishwavidyalaya, Takshashila Campus,
                    <br />
                    Khandwa Road, Indore, Madhya Pradesh 452001
                  </address>
                </div>
              </div>
              <div className="wrap flex flex-wrap justify-between gap-2 pt-[18px] pb-6 border-t border-line-strong small muted">
                <span>© 2026 IIPS Project Portal. OOAD Lab project, MCA (Integrated).</span>
                <span>
                  Data: <Link href="https://iips.edu.in" rel="external">iips.edu.in</Link> and this portal.
                </span>
              </div>
            </footer>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
