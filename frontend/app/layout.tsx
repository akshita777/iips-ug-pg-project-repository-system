import type { Metadata } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-display" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "IIPS Project Portal",
  description: "IIPS UG-PG Academic Project Repository and Record Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} ${spaceGrotesk.variable} font-body min-h-screen bg-paper`}>
        <header className="border-b-2 border-ink bg-primary">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-display text-xl font-black tracking-tight">
              IIPS PMS
            </Link>
            <nav className="flex items-center gap-1">
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
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t-2 border-ink mt-12">
          <div className="mx-auto max-w-6xl px-4 py-4 text-sm font-body flex items-center justify-between">
            <span className="font-bold">IIPS DAVV, Indore</span>
            <span>BCA Sem 1-6 plus MCA Sem 7-10</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
