import { test, expect, API, loginAs } from "./fixtures";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

test.skip(
  process.env.E2E_WRITE !== "1",
  "write run not approved: rerun with E2E_WRITE=1 (creates tagged rows, then deletes them)"
);

const ARTIFACTS = path.join(__dirname, ".auth", "write-artifacts.json");
const TITLE = `[E2E] Lifecycle Probe ${Date.now()}`;

interface Bag {
  projectId?: number;
  versionPaths?: string[];
  mentorCreated?: boolean;
  mentorId?: number;
  windowId?: number;
  allocationId?: number;
  slotId?: number;
  rubricId?: number;
}

function readBag(): Bag {
  try {
    return JSON.parse(fs.readFileSync(ARTIFACTS, "utf-8"));
  } catch {
    return {};
  }
}

function saveBag(patch: Partial<Bag>) {
  fs.writeFileSync(ARTIFACTS, JSON.stringify({ ...readBag(), ...patch }, null, 2));
}

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// Full vertical slice, dependency order: create -> team -> preferences ->
// mentor -> deadline -> suggest -> confirm -> slot -> upload -> review ->
// startReview -> approve -> evaluate -> showcase/export -> teardown.
// Every row is tagged [E2E]; afterAll deletes everything even on failure.
test.describe.serial("write lifecycle (E2E_WRITE=1)", () => {
  test.setTimeout(240000);
  let studentA = "";
  let studentB = "";
  let guide = "";
  let coordinator = "";
  let admin = "";
  let evaluator = "";

  test.beforeAll(async () => {
    // Reuse the setup project's token cache: zero /auth/* calls, no pacing
    // needed, no hook timeout risk.
    const cached = JSON.parse(
      fs.readFileSync(path.join(__dirname, ".auth", "tokens.json"), "utf-8")
    );
    studentA = cached["student-a"].token;
    studentB = cached["student-b"].token;
    guide = cached["guide"].token;
    coordinator = cached["coordinator"].token;
    admin = cached["admin"].token;
    evaluator = cached["evaluator"].token;
  });

  test.afterAll(() => {
    execFileSync(path.join(__dirname, "cleanup-write.sh"), [], { stdio: "inherit" });
  });

  test("student creates a project through the UI form", async ({ page, request }) => {
    await loginAs(page, "student-a");
    await page.goto("/projects/new");
    await page.getByLabel("Project title *").fill(TITLE);
    await page.getByLabel("Abstract").fill("End to end probe: does the whole slice work.");
    await page.getByLabel("Tech stack").fill("Playwright, Spring Boot");
    await page.getByRole("button", { name: "Save as draft" }).click();
    await expect(page).toHaveURL(/\/projects\/\d+/, { timeout: 15000 });
    const id = Number(page.url().match(/\/projects\/(\d+)/)![1]);
    expect(id).toBeGreaterThan(0);
    saveBag({ projectId: id });
    const got = await request.get(`${API}/projects/${id}`, { headers: auth(studentA) });
    expect(got.status()).toBe(200);
    expect((await got.json()).title).toBe(TITLE);
  });

  test("owner adds the second student to the team", async ({ request }) => {
    const { projectId } = readBag();
    const res = await request.post(`${API}/projects/${projectId}/team`, {
      headers: auth(studentA),
      data: { studentId: 6, teamRole: "DEVELOPER" },
    });
    expect(res.status()).toBe(200);
  });

  test("duplicate team add is rejected", async ({ request }) => {
    const { projectId } = readBag();
    const res = await request.post(`${API}/projects/${projectId}/team`, {
      headers: auth(studentA),
      data: { studentId: 6, teamRole: "TESTER" },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("student posts guide preferences", async ({ request }) => {
    const { projectId } = readBag();
    const res = await request.post(`${API}/allocations/preferences`, {
      headers: auth(studentA),
      data: { projectId, facultyIds: [3] },
    });
    expect(res.status()).toBe(200);
  });

  test("admin assigns the coordinator as batch mentor", async ({ request }) => {
    const existing = await request.get(`${API}/batch-mentors`, { headers: auth(admin) });
    if ((await existing.json()).length > 0) {
      test.skip(true, "a batch mentor already exists; reusing it");
      return;
    }
    const res = await request.post(`${API}/batch-mentors`, {
      headers: auth(admin),
      data: { facultyId: 2, programCode: "IC", batchYear: 2022 },
    });
    expect(res.status()).toBe(200);
    saveBag({ mentorCreated: true, mentorId: (await res.json()).id });
  });

  test("coordinator opens a MINOR deadline window", async ({ request }) => {
    const opens = new Date(Date.now() - 86400000).toISOString().slice(0, 19);
    const closes = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 19);
    const res = await request.post(`${API}/deadlines`, {
      headers: auth(coordinator),
      data: { projectType: "MINOR", opensOn: opens, closesOn: closes },
    });
    expect(res.status()).toBe(200);
    saveBag({ windowId: (await res.json()).id });
  });

  test("coordinator suggest plus confirm allocates the guide", async ({ request }) => {
    const { projectId } = readBag();
    const sug = await request.post(`${API}/allocations/suggest`, { headers: auth(coordinator) });
    expect(sug.status()).toBe(200);
    const mine = (await sug.json()).find((a: any) => a.project?.id === projectId);
    expect(mine, "suggestion for the probe project").toBeTruthy();
    saveBag({ allocationId: mine.id });
    const con = await request.post(`${API}/allocations/confirm`, {
      headers: auth(coordinator),
      data: { allocationId: mine.id },
    });
    expect(con.status()).toBe(200);
    expect((await con.json()).status).toBe("CONFIRMED");
  });

  test("guide offers a slot, student books it, double-book fails", async ({ request }) => {
    const starts = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 19);
    const offer = await request.post(`${API}/slots`, {
      headers: auth(guide),
      data: { startsAt: starts },
    });
    expect(offer.status()).toBe(200);
    const slotId = (await offer.json()).id;
    saveBag({ slotId });
    const book = await request.post(`${API}/slots/${slotId}/book`, { headers: auth(studentA) });
    expect(book.status()).toBe(200);
    const again = await request.post(`${API}/slots/${slotId}/book`, { headers: auth(studentB) });
    expect(again.status()).toBeGreaterThanOrEqual(400);
  });

  test("owner uploads a version file", async ({ request }) => {
    const { projectId } = readBag();
    const up = await request.post(`${API}/projects/${projectId}/versions`, {
      headers: auth(studentA),
      multipart: {
        file: { name: "probe.txt", mimeType: "text/plain", buffer: Buffer.from("e2e probe file") },
        comments: "first probe version",
      },
    });
    expect(up.status()).toBe(200);
    const body = await up.json();
    expect(body.versionNumber).toBe(1);
    expect(body.filePath).toContain("supabase://");
    saveBag({ versionPaths: [body.filePath.replace("supabase://project-files/", "")] });
  });

  test("empty upload is rejected", async ({ request }) => {
    const { projectId } = readBag();
    const up = await request.post(`${API}/projects/${projectId}/versions`, {
      headers: auth(studentA),
      multipart: { file: { name: "empty.txt", mimeType: "text/plain", buffer: Buffer.from("") } },
    });
    expect(up.status()).toBeGreaterThanOrEqual(400);
  });

  test("guide posts a review, bad status is rejected", async ({ request }) => {
    const { projectId } = readBag();
    const bad = await request.post(`${API}/projects/${projectId}/reviews`, {
      headers: auth(guide),
      data: { status: "BOGUS", comments: "x" },
    });
    expect(bad.status()).toBeGreaterThanOrEqual(400);
    const ok = await request.post(`${API}/projects/${projectId}/reviews`, {
      headers: auth(guide),
      data: { status: "APPROVED", comments: "Probe looks good." },
    });
    expect(ok.status()).toBe(200);
  });

  test("guide moves the project to review then approves", async ({ request }) => {
    const { projectId } = readBag();
    const sub = await request.post(`${API}/projects/${projectId}/submit`, { headers: auth(studentA) });
    expect(sub.status()).toBe(200);
    expect((await sub.json()).status).toBe("SUBMITTED");
    const rev = await request.post(`${API}/projects/${projectId}/review`, { headers: auth(guide) });
    expect((await rev.json()).status).toBe("UNDER_REVIEW");
    const ap = await request.post(`${API}/projects/${projectId}/approve`, { headers: auth(guide) });
    expect((await ap.json()).status).toBe("APPROVED");
  });

  test("resubmit of a decided project is rejected", async ({ request }) => {
    const { projectId } = readBag();
    const sub = await request.post(`${API}/projects/${projectId}/submit`, { headers: auth(studentA) });
    expect(sub.status()).toBeGreaterThanOrEqual(400);
  });

  test("marks over 100 are rejected, valid marks evaluate the project", async ({ request }) => {
    const { projectId } = readBag();
    const over = await request.post(`${API}/evaluations`, {
      headers: auth(evaluator),
      data: { projectId, rubricId: 3, totalMarks: 101, feedback: "too much" },
    });
    expect(over.status()).toBeGreaterThanOrEqual(400);
    const ok = await request.post(`${API}/evaluations`, {
      headers: auth(evaluator),
      data: { projectId, rubricId: 3, totalMarks: 78, feedback: "Solid probe." },
    });
    expect(ok.status()).toBe(200);
    const proj = await request.get(`${API}/projects/${projectId}`, { headers: auth(studentA) });
    expect((await proj.json()).status).toBe("EVALUATED");
  });

  test("coordinator creates and updates a rubric", async ({ request }) => {
    const create = await request.post(`${API}/evaluations/rubrics`, {
      headers: auth(coordinator),
      data: { name: "[E2E] Probe Rubric", criteria: { probe: 100 } },
    });
    expect(create.status()).toBe(200);
    const id = (await create.json()).id;
    saveBag({ rubricId: id });
    const upd = await request.put(`${API}/evaluations/rubrics/${id}`, {
      headers: auth(coordinator),
      data: { name: "[E2E] Probe Rubric", criteria: { probe: 60, extra: 40 } },
    });
    expect(upd.status()).toBe(200);
  });

  test("wiki page is saved, listed, then deleted through the endpoint", async ({ request }) => {
    const { projectId } = readBag();
    const save = await request.put(`${API}/projects/${projectId}/wiki`, {
      headers: auth(studentA),
      data: { title: "[E2E] Notes", body: "probe notes" },
    });
    expect(save.status()).toBe(200);
    const list = await request.get(`${API}/projects/${projectId}/wiki`, { headers: auth(studentA) });
    const page = (await list.json()).find((w: any) => w.title === "[E2E] Notes");
    expect(page).toBeTruthy();
    const del = await request.delete(`${API}/projects/${projectId}/wiki/${page.id}`, {
      headers: auth(studentA),
    });
    expect(del.status()).toBe(200);
  });

  test("team member is removed through the endpoint", async ({ request }) => {
    const { projectId } = readBag();
    const list = await request.get(`${API}/projects/${projectId}/team`, { headers: auth(studentA) });
    const member = (await list.json()).find((m: any) => m.student?.id === 6);
    expect(member).toBeTruthy();
    const del = await request.delete(`${API}/projects/${projectId}/team/${member.id}`, {
      headers: auth(studentA),
    });
    expect(del.status()).toBe(200);
  });

  test("evaluated project appears in the public showcase", async ({ request }) => {
    const { projectId } = readBag();
    const res = await request.get(`${API}/projects/showcase`);
    expect(res.status()).toBe(200);
    expect((await res.json()).some((p: any) => p.id === projectId)).toBe(true);
  });

  test("versioned export downloads a non-empty zip", async ({ request }) => {
    const { projectId } = readBag();
    const res = await request.get(`${API}/projects/${projectId}/export`, { headers: auth(studentA) });
    expect(res.status()).toBe(200);
    const buf = await res.body();
    expect(buf.length).toBeGreaterThan(100);
  });

  test("detail page shows the evaluated project", async ({ page }) => {
    const { projectId } = readBag();
    await loginAs(page, "student-a");
    await page.goto(`/projects/${projectId}`);
    await expect(page.getByRole("heading", { name: TITLE })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("EVALUATED")).toBeVisible();
  });
});
