import { test, expect, API } from "./fixtures";

let studentToken = "";

// One /auth/* call per 12s max: the backend allows 10 req/min per IP and the
// setup project plus UI specs share the same window.
async function paceAuth() {
  await new Promise((r) => setTimeout(r, 12000));
}

// API-level edge cases. Mutating calls are asserted only for their rejection
// paths (bad input, bad auth, missing rows): nothing is created or changed.
test.describe.serial("api edge cases", () => {
  test.beforeAll(async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const cached = JSON.parse(
      fs.readFileSync(path.join(__dirname, ".auth", "tokens.json"), "utf-8")
    );
    studentToken = cached["student-a"].token;
  });

  test.beforeEach(async ({}, testInfo) => {
    if (testInfo.title.match(/registration|role|roll number|semester|refresh token/)) {
      await paceAuth();
    }
  });

  test("duplicate registration is rejected", async ({ request }) => {
    const res = await request.post(`${API}/auth/register`, {
      data: { name: "Dupe", email: "e2e-student-a@test.local", password: "E2eTest123!", role: "STUDENT", rollNumber: "IC2k22-90", semester: 6 },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("unknown role is rejected", async ({ request }) => {
    const res = await request.post(`${API}/auth/register`, {
      data: { name: "Weird", email: `e2e-weird-${Date.now()}@test.local`, password: "E2eTest123!", role: "SUPERUSER" },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("malformed roll number is rejected", async ({ request }) => {
    const res = await request.post(`${API}/auth/register`, {
      data: { name: "Bad Roll", email: `e2e-roll-${Date.now()}@test.local`, password: "E2eTest123!", role: "STUDENT", rollNumber: "nope", semester: 6 },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("semester outside 1-10 is rejected", async ({ request }) => {
    const res = await request.post(`${API}/auth/register`, {
      data: { name: "Bad Sem", email: `e2e-sem-${Date.now()}@test.local`, password: "E2eTest123!", role: "STUDENT", rollNumber: "IC2k22-92", semester: 99 },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("garbage refresh token is rejected", async ({ request }) => {
    const res = await request.post(`${API}/auth/refresh`, {
      data: { refreshToken: "definitely-not-a-token" },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("unauthenticated project list is refused", async ({ request }) => {
    const res = await request.get(`${API}/projects`);
    expect([401, 403]).toContain(res.status());
  });

  test("missing project returns 404, not 500", async ({ request }) => {
    const res = await request.get(`${API}/projects/999999`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    expect(res.status()).toBe(404);
  });

  test("missing versions list returns 404, not 500", async ({ request }) => {
    const res = await request.get(`${API}/projects/999999/versions`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    expect([400, 404]).toContain(res.status());
  });

  test("unknown user lookup returns 404, not 500", async ({ request }) => {
    const res = await request.get(`${API}/users/999999`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    expect([400, 403, 404]).toContain(res.status());
  });

  test("unauthenticated upload is refused", async ({ request }) => {
    const res = await request.post(`${API}/projects/1/versions`, {
      multipart: { file: { name: "x.zip", mimeType: "application/zip", buffer: Buffer.from("x") } },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("public showcase answers without auth", async ({ request }) => {
    const res = await request.get(`${API}/projects/showcase`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});
