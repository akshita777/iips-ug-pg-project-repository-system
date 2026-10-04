import { test as base, type Page, type APIRequestContext, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

export const API = process.env.E2E_API_URL || "http://localhost:8080/api/v1";
export const PASSWORD = process.env.E2E_PASSWORD || "E2eTest123!";

export type RoleKey = "admin" | "coordinator" | "guide" | "evaluator" | "student-a" | "student-b";

interface CachedToken {
  token: string;
  refreshToken: string;
  role: string;
  email: string;
}

function readTokens(): Record<string, CachedToken> {
  const file = path.join(__dirname, ".auth", "tokens.json");
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

// Shared auth cache: the setup project writes tokens.json once, so specs make
// zero /auth/* calls and never trip the 10 req/min login rate limit.
export async function loginAs(page: Page, who: RoleKey) {
  const cached = readTokens()[who];
  if (!cached) {
    throw new Error(
      `no cached token for "${who}": run the setup project first (it seeds e2e accounts)`
    );
  }
  await page.addInitScript(
    ({ token, refreshToken, role, email }) => {
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("role", role);
      localStorage.setItem("email", email);
    },
    cached
  );
}

export async function logout(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

export const test = base;
export { expect };
export type { APIRequestContext };
