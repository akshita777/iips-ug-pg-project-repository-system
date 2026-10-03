import type { Metadata } from "next";
import { Archivo, Space_Grotesk, Space_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/ui/toast";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-display" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-body" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "IIPS Project Portal",
  description: "IIPS UG-PG Academic Project Repository and Record Management System",
};

const tickerItems = ["BCA Sem 1-6", "MCA Sem 7-10", "Synopsis", "Guide Allocation", "Review", "Evaluation", "Viva", "Archive"];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} ${spaceGrotesk.variable} ${spaceMono.variable} font-body min-h-screen bg-paper`}>
        <div className="border-b-2 border-ink bg-ink text-paper overflow-hidden py-1.5" aria-hidden="true">
          <div className="ticker-track font-display text-xs font-bold uppercase tracking-widest">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="flex items-center gap-8">
                <span>{item}</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
            ))}
          </div>
        </div>
        <header className="border-b-2 border-ink bg-primary">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center border-2 border-ink rounded-lg bg-ink font-display text-sm font-black text-primary">
                IP
              </span>
              <span className="font-display text-xl font-black tracking-tight">
                IIPS PMS
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link href="/design-system" className="brutal-nav-link text-sm hidden sm:inline-flex">
                System
              </Link>
              <Link href="/login" className="brutal-nav-link text-sm">
                Login
              </Link>
              <Link href="/register" className="brutal-nav-link text-sm">
                Register
              </Link>
              <a
                href="https://github.com/animishraa05/iips-ug-pg-project-repository-system"
                target="_blank"
                rel="noreferrer"
                className="brutal-btn bg-ink text-white !shadow-none text-sm ml-2"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </main>
        <footer className="border-t-2 border-ink mt-12 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-5 text-sm font-body flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold">IIPS DAVV, Indore</span>
            <span className="font-mono text-xs uppercase tracking-wide">BCA Sem 1-6 plus MCA Sem 7-10</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
