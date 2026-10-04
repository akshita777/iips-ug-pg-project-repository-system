"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import api from "@/lib/api";

const roles = ["STUDENT", "FACULTY", "COORDINATOR", "EVALUATOR", "ADMIN"] as const;

const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be 6 plus characters"),
  role: z.enum(roles),
});

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = schema.safeParse({ name, email, password, role });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your input");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { name, email, password, role });
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", data.email ?? email);
      router.push("/dashboard");
    } catch {
      setError("Registration failed. This email may already be used.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section">
      <div className="wrap">
        <div className="mx-auto max-w-md card">
          <span className="kicker">IIPS Project Portal</span>
          <h1>Create account</h1>
          <p className="muted">Join the IIPS project portal.</p>
          <Link href="/api/auth/signin/github" className="btn btn-outline w-full mt-2">
            Continue with GitHub
          </Link>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Input label="Full name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Sharma" />
            <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@iips.edu" />
            <Input label="Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
            <div className="space-y-1.5">
              <span className="ctl-label" id="role-label">Role</span>
              <div className="seg" role="group" aria-labelledby="role-label">
                {roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={role === r}
                    onClick={() => setRole(r)}
                    className="seg-btn"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {error && <Alert tone="danger">{error}</Alert>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-center">
            Have an account?{" "}
            <Link href="/login" className="font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
