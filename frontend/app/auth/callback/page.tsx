"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function AuthCallback() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    (async () => {
      let session = null;
      try {
        const supabase = getSupabase();
        const { data } = await getSupabase().auth.getSession();
        session = data.session;
      } catch {
        router.push("/login?error=no_session");
        return;
      }
      if (session?.access_token) {
        try {
          // Pass the Supabase token to the Spring Boot backend
          const { data } = await api.post("/auth/supabase", {
            access_token: session.access_token,
          });

          if (data.needsRegistration) {
            sessionStorage.setItem("githubEmail", data.email);
            sessionStorage.setItem("githubName", data.name || "");
            sessionStorage.setItem("githubToken", session.access_token);
            router.push("/auth/complete-profile");
            return;
          }

          // Log into your custom auth context
          login(data.token, data.refreshToken, data.role, data.email);
          router.push("/dashboard");
        } catch (error) {
          console.error("Backend auth failed", error instanceof Error ? error.message : error);
          router.push("/login?error=auth_failed");
        }
      } else {
        router.push("/login?error=no_session");
      }
    })();
  }, [router, login]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-paper">
      <div className="text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-navy text-lg font-extrabold text-white animate-pulse">
          IP
        </div>
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink">
          Authenticating...
        </p>
      </div>
    </div>
  );
}
