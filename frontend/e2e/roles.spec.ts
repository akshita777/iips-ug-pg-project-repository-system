import { test, expect, loginAs, type RoleKey } from "./fixtures";

async function dashboardShows(page: Parameters<typeof loginAs>[0], who: RoleKey, role: string, chip: string) {
  await loginAs(page, who);
  await page.goto("/dashboard");
  await expect(page.getByText(`${role} dashboard`)).toBeVisible();
  await expect(page.locator("ul.chips").getByRole("link", { name: chip })).toBeVisible();
}

test.describe("dashboards render per role", () => {
  test("student dashboard offers submission and preferences", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.goto("/dashboard");
    await expect(page.getByText("STUDENT dashboard")).toBeVisible();
    await expect(page.getByRole("link", { name: "Submit a project" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Guide preferences" })).toBeVisible();
  });

  test("faculty dashboard offers the review queue", async ({ page }) => {
    await dashboardShows(page, "guide", "FACULTY", "Review queue");
  });

  test("coordinator dashboard offers allocation management", async ({ page }) => {
    await dashboardShows(page, "coordinator", "COORDINATOR", "Manage allocations");
  });

  test("evaluator dashboard offers assigned projects", async ({ page }) => {
    await dashboardShows(page, "evaluator", "EVALUATOR", "Evaluate assigned projects");
  });

  test("admin dashboard offers users and analytics", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/dashboard");
    await expect(page.getByText("ADMIN dashboard")).toBeVisible();
    await expect(page.getByRole("link", { name: "Manage users" })).toBeVisible();
    await expect(page.locator("ul.chips").getByRole("link", { name: "Analytics" })).toBeVisible();
  });
});

test.describe("role pages load with live data or honest empty states", () => {
  test("admin users table renders", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { name: "Users and system" })).toBeVisible();
    await expect(page.getByText("e2e-student-a@test.local")).toBeVisible();
  });

  test("admin analytics renders summary or empty state", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/analytics");
    await expect(
      page.getByRole("heading", { name: "Department analytics" }).or(page.getByText("No analytics"))
    ).toBeVisible();
  });

  test("guide review queue renders", async ({ page }) => {
    await loginAs(page, "guide");
    await page.goto("/guide/reviews");
    await expect(page.getByRole("heading", { name: "Review queue" })).toBeVisible();
  });

  test("guide students page renders", async ({ page }) => {
    await loginAs(page, "guide");
    await page.goto("/guide/students");
    await expect(page.getByRole("heading", { name: "My students" })).toBeVisible();
  });

  test("coordinator allocation page renders", async ({ page }) => {
    await loginAs(page, "coordinator");
    await page.goto("/coordinator/allocation");
    await expect(page.getByRole("heading", { name: "Guide allocation" })).toBeVisible();
  });

  test("coordinator rubrics page renders", async ({ page }) => {
    await loginAs(page, "coordinator");
    await page.goto("/coordinator/rubrics");
    await expect(page.getByRole("heading", { name: "Rubric management" })).toBeVisible();
  });

  test("evaluator assigned page renders", async ({ page }) => {
    await loginAs(page, "evaluator");
    await page.goto("/evaluator/assigned");
    await expect(page.getByRole("heading", { name: "Assigned evaluations" })).toBeVisible();
  });

  test("notifications inbox renders", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.goto("/notifications");
    await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  });

  test("student preferences form renders", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.goto("/preferences");
    await expect(page.getByRole("heading", { name: "Guide preferences" })).toBeVisible();
    await expect(page.getByLabel("My project ID")).toBeVisible();
    await expect(page.getByLabel("Faculty IDs in rank order")).toBeVisible();
  });

  test("showcase renders with zero evaluated projects", async ({ page }) => {
    await page.goto("/showcase");
    await expect(page.getByRole("heading", { name: "Project showcase" })).toBeVisible();
    await expect(page.getByText("No evaluated projects yet")).toBeVisible();
  });
});

test.describe("cross-role gating", () => {
  test("student is bounced off the admin users page", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/dashboard/);
  });

  test("student is bounced off the coordinator allocation page", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.goto("/coordinator/allocation");
    await expect(page).toHaveURL(/dashboard/);
  });

  test("guide is bounced off the evaluator page", async ({ page }) => {
    await loginAs(page, "guide");
    await page.goto("/evaluator/assigned");
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe("mutating role actions (skipped: read-only run)", () => {
  const skipped: Array<[string, string]> = [
    ["role change applies", "PUT user role would mutate a live account"],
    ["allocation run assigns guides", "POST allocation writes live rows"],
    ["rubric save persists", "PUT rubric mutates shared config"],
    ["marks submit records evaluation", "POST evaluation writes a live grade"],
    ["preference save persists", "POST preferences writes a live row"],
    ["review post appears", "POST review writes a live row"],
    ["mark notification read", "no notifications exist and POST would mutate"],
  ];
  for (const [name, reason] of skipped) {
    test(name, async () => {
      test.skip(true, `needs write permission: ${reason}`);
    });
  }
});
