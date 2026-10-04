"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";

const roles = ["STUDENT", "FACULTY", "COORDINATOR", "EVALUATOR"] as const;

type Mode = "register" | "update";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { login, token, ready } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("STUDENT");
  
  // Student specific
  const [rollNumber, setRollNumber] = useState("");
  const [semester, setSemester] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  
  useEffect(() => {
    if (!ready) return;
    // GitHub first-timers arrive with session data and register a new account.
    const storedEmail = sessionStorage.getItem("githubEmail");
    const storedToken = sessionStorage.getItem("githubToken");

    if (storedEmail && storedToken) {
      setEmail(storedEmail);
      setMode("register");
      return;
    }

    // Logged-in users with gaps (no roll number yet) update their profile.
    if (token) {
      api
        .get<{ name: string; role: string; rollNumber?: string | null; semester?: number | null }>(
          "/users/me"
        )
        .then((res) => {
          setEmail("");
          setName(res.data.name ?? "");
          if ((roles as readonly string[]).includes(res.data.role)) {
            setRole(res.data.role as (typeof roles)[number]);
          }
          setRollNumber(res.data.rollNumber ?? "");
          setSemester(res.data.semester ? String(res.data.semester) : "");
          setMode("update");
        })
        .catch(() => router.push("/login?error=profile_failed"));
      return;
    }

    router.push("/login?error=missing_github_data");
  }, [router, ready, token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    if (name.length < 2) {
      setError("Enter your full name");
      return;
    }
    
    if (role === "STUDENT") {
      if (!rollNumber) {
        setError("Roll number is required for students");
        return;
      }
      if (!semester || isNaN(Number(semester)) || Number(semester) < 1 || Number(semester) > 10) {
        setError("Semester must be between 1 and 10");
        return;
      }
    }
    
    setLoading(true);
    try {
      if (mode === "update") {
        const payload: { name?: string; rollNumber?: string; semester?: number } = {};
        if (name.trim()) payload.name = name.trim();
        if (role === "STUDENT") {
          if (rollNumber.trim()) payload.rollNumber = rollNumber.toUpperCase();
          if (semester) payload.semester = Number(semester);
        }
        await api.patch("/users/me", payload);
        router.push("/projects/new");
        return;
      }
      // Generate a secure random password since they will use GitHub to login
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + "Aa1!";
      
      const payload: any = {
        name,
        email,
        password: randomPassword,
        role
      };
      
      if (role === "STUDENT") {
        payload.rollNumber = rollNumber.toUpperCase();
        payload.semester = Number(semester);
      }
      
      const { data } = await api.post("/auth/register", payload);
      
      // Successfully registered! Clear session storage and log them in
      sessionStorage.removeItem("githubEmail");
      sessionStorage.removeItem("githubName");
      sessionStorage.removeItem("githubToken");
      
      login(data.token, data.refreshToken, data.role, data.email);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. This email may already be used.");
    } finally {
      setLoading(false);
    }
  }

  if (!mode) {
    return (
      <div className="section">
        <div className="wrap">
          <div className="mx-auto max-w-md card" aria-busy="true" aria-label="Loading">
            <div className="skeleton h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="wrap">
        <div className="mx-auto max-w-md card">
          <span className="kicker">IIPS Project Portal</span>
          <h1>{mode === "update" ? "Update profile" : "Complete Profile"}</h1>
          <p className="muted">
            {mode === "update"
              ? "Fill in the missing details to unlock project submission."
              : "We just need a few more details to set up your IIPS account."}
          </p>
          
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <Input 
                label="Email" 
                type="email" 
                name="email" 
                value={email} 
                disabled 
                className="bg-muted cursor-not-allowed text-ink-2" 
              />
            )}
            
            <Input 
              label="Full name" 
              name="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Aarav Sharma" 
            />
            
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
            
            {role === "STUDENT" && (
              <div className="p-4 bg-band border border-line rounded-card space-y-4 mt-4">
                <Input 
                  label="Roll Number" 
                  name="rollNumber" 
                  value={rollNumber} 
                  onChange={(e) => setRollNumber(e.target.value)} 
                  placeholder="e.g. IT-2K22-01" 
                />
                <Input 
                  label="Semester (1-10)" 
                  name="semester" 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={semester} 
                  onChange={(e) => setSemester(e.target.value)} 
                  placeholder="7" 
                />
              </div>
            )}
            
            {error && <Alert tone="danger">{error}</Alert>}
            
            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? "Saving..." : mode === "update" ? "Save and continue" : "Complete Registration"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
