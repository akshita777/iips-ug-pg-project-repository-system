"use client";

import { getSupabase } from "@/lib/supabase";

export function GithubButton({ className, text = "Continue with GitHub" }: { className?: string, text?: string }) {
  const handleGithubLogin = async () => {
    await getSupabase().auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleGithubLogin}
      className={`btn btn-outline w-full ${className || ""}`}
    >
      {text}
    </button>
  );
}
