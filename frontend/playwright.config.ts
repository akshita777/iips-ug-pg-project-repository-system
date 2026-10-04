import { defineConfig, devices } from "@playwright/test";

const SYSLIBS = "/home/ani/.cache/ms-playwright/syslibs/usr/lib/x86_64-linux-gnu";

export default defineConfig({
  testDir: "./e2e",
  // Auth endpoints allow 10 req/min per IP: single worker, serial files,
  // and every direct /auth/* call is paced (see paceAuth in setup/api specs).
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        launchOptions: { env: { ...process.env, LD_LIBRARY_PATH: SYSLIBS } },
      },
      dependencies: ["setup"],
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testMatch: /responsive\.spec\.ts/,
      dependencies: ["setup"],
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 13"] },
      testMatch: /responsive\.spec\.ts/,
      dependencies: ["setup"],
    },
  ],
});
