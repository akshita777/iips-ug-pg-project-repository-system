"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { GithubButton } from "@/components/auth/github-button";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { token, ready, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && token) router.replace("/dashboard");
  }, [ready, token, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your input");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.refreshToken, data.role, data.email ?? email);
      router.push("/dashboard");
    } catch {
      setError("Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section">
      <div className="wrap">
        <div className="mx-auto max-w-md card">
          <span className="kicker">IIPS Project Portal</span>
          <h1>Welcome back</h1>
          <p className="muted">Login to your IIPS project account.</p>
          <GithubButton className="w-full mt-4" />
          
          <div className="flex items-center gap-3 my-6">
            <hr className="flex-1 border-line" />
            <span className="text-xs uppercase font-bold text-muted" style={{ letterSpacing: "0.06em" }}>Or</span>
            <hr className="flex-1 border-line" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@iips.edu" />
            <Input label="Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
            {error && <Alert tone="danger">{error}</Alert>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-center">
            No account?{" "}
            <Link href="/register" className="font-semibold">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
