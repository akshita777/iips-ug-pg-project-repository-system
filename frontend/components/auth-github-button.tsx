"use client";

import { signIn } from "next-auth/react";

export function GitHubLoginButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
      className="brutal-btn bg-ink text-white block text-center mt-4 w-full"
    >
      Continue with GitHub
    </button>
  );
}
