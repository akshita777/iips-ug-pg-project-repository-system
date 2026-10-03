"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import api from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", data.email ?? email);
      router.push("/dashboard");
    } catch {
      setError("Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="bg-white">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Login to your IIPS project account.</CardDescription>
        <Link href="/api/auth/signin/github" className="brutal-btn bg-ink text-white block text-center mt-4">Continue with GitHub</Link>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@iips.edu" />
          <Input label="Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
          {error && (
            <Alert tone="danger">{error}</Alert>
          )}
          <Button type="submit" variant="dark" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-center">
          No account?{" "}
          <Link href="/register" className="font-bold underline underline-offset-2">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}
