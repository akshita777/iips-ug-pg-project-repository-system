import { test as setup, type APIResponse } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const API = process.env.E2E_API_URL || "http://localhost:8080/api/v1";
const PW = process.env.E2E_PASSWORD || "E2eTest123!";
const DIR = path.join(__dirname, ".auth");

const ACCOUNTS = [
  { role: "ADMIN", email: "e2e-admin@test.local" },
  { role: "COORDINATOR", email: "e2e-coordinator@test.local" },
  { role: "FACULTY", email: "e2e-guide@test.local" },
  { role: "EVALUATOR", email: "e2e-evaluator@test.local" },
  { role: "STUDENT", email: "e2e-student-a@test.local" },
  { role: "STUDENT", email: "e2e-student-b@test.local" },
] as const;

// Logs every seeded account in once (serial: 6 auth calls, under the 10/min cap)
// and stores tokens plus Playwright storage states for the suite to reuse.
setup("seed auth cache", async ({ request }) => {
  setup.setTimeout(180000);
  fs.mkdirSync(DIR, { recursive: true });
  const tokens: Record<string, { token: string; refreshToken: string; role: string; email: string }> = {};
  for (const a of ACCOUNTS) {
    // Pace logins: /auth/* allows 10 req/min per IP, and the api/auth specs
    // make their own paced calls later in the same window.
    await new Promise((r) => setTimeout(r, 12000));
    let res: APIResponse | undefined;
    for (let attempt = 1; attempt <= 6; attempt++) {
      res = await request.post(`${API}/auth/login`, {
        data: { email: a.email, password: PW },
      });
      if (res.status() !== 429) break;
      // Known constraint: /auth/* allows 10 req/min per IP. Back off and retry.
      await new Promise((r) => setTimeout(r, 15000));
    }
    if (!res || res.status() === 429) {
      throw new Error(`rate limited seeding ${a.email} after retries; wait a minute and rerun`);
    }
    if (!res.ok()) {
      throw new Error(`seed login failed for ${a.email}: ${res.status()} ${await res.text()}`);
    }
    const body = await res.json();
    const key = a.email.split("@")[0].replace("e2e-", "");
    tokens[key] = { token: body.token, refreshToken: body.refreshToken, role: body.role, email: body.email ?? a.email };
    fs.writeFileSync(
      path.join(DIR, `${key}.json`),
      JSON.stringify({
        origins: [
          {
            origin: process.env.E2E_BASE_URL || "http://localhost:3000",
            localStorage: [
              { name: "token", value: body.token },
              { name: "refreshToken", value: body.refreshToken ?? "" },
              { name: "role", value: body.role },
              { name: "email", value: body.email ?? a.email },
            ],
          },
        ],
      })
    );
  }
  fs.writeFileSync(path.join(DIR, "tokens.json"), JSON.stringify(tokens, null, 2));
});
