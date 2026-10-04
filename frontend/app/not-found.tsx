import Link from "next/link";

export default function NotFound() {
  return (
    <div className="section">
      <div className="wrap">
        <div className="mx-auto max-w-xl text-center">
          <span className="kicker">404</span>
          <h1>Page not found</h1>
          <p className="muted">
            The record you were looking for has moved or never existed. Head back to the registry
            or the home page.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link href="/" className="btn">
              Home
            </Link>
            <Link href="/projects" className="btn btn-outline">
              Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
