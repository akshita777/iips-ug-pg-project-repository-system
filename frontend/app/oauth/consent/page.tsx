"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function ConsentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const clientId = searchParams.get("client_id") || "Unknown Application";
  const scope = searchParams.get("scope") || "read_user";
  const redirectUri = searchParams.get("redirect_uri") || "/";

  const handleAllow = () => {
    // In a real implementation, this would send an API request to the authorization server
    // to grant the authorization code, and then redirect to the redirect_uri.
    console.log("Allowed access for", clientId);
    router.push(redirectUri);
  };

  const handleDeny = () => {
    console.log("Denied access for", clientId);
    router.push(redirectUri + "?error=access_denied");
  };

  return (
    <div className="section">
      <div className="wrap">
        <div className="mx-auto max-w-2xl card !p-0 overflow-hidden">
        <div className="bg-navy p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-extrabold text-navy">
              IP
            </div>
            <div>
              <h1 className="text-2xl font-extrabold !text-white">Authorization Request</h1>
              <p className="font-mono text-xs uppercase text-white mt-1" style={{ letterSpacing: "0.08em" }}>
                IIPS Project Portal
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <p className="text-lg text-ink mb-6">
            <span className="font-bold">{clientId}</span> is requesting access to your account.
          </p>

          <div className="mb-8">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted mb-3">
              Requested Permissions
            </p>
            <ul className="space-y-3">
              {scope.split(" ").map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <div className="mt-1 flex h-4 w-4 items-center justify-center rounded-sm bg-amber"></div>
                  <span className="text-sm font-bold text-ink">
                    {s === "read_user" ? "Read your basic profile information" : s}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-band border border-line rounded-card p-4 mb-8">
            <p className="text-xs text-ink-2 leading-relaxed font-mono">
              By clicking &ldquo;Authorize&rdquo;, you allow this application to access your data in accordance with their terms of service and privacy policies. You can revoke this access at any time.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="navy" size="lg" className="flex-1" onClick={handleAllow}>
              Authorize
            </Button>
            <Button variant="white" size="lg" className="flex-1" onClick={handleDeny}>
              Cancel
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function OAuthConsentPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl mt-12 text-center font-mono text-xs font-bold uppercase tracking-widest text-ink">
          Loading...
        </div>
      }
    >
      <ConsentForm />
    </Suspense>
  );
}
