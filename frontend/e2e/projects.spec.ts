import { test, expect, loginAs } from "./fixtures";

test.describe("project registry", () => {
  test("student sees the registry with search and status filter", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
    await page.getByLabel("Search").fill("zzzz-no-such-project");
    await expect(page.getByText("No projects match")).toBeVisible();
    await page.getByLabel("Search").fill("");
  });

  test("status buckets filter without errors", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.goto("/projects");
    for (const bucket of ["All", "Draft and active", "Reviewing", "Decided"]) {
      await page.getByRole("button", { name: bucket }).click();
      await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
    }
  });

  test("new-project link is offered to students", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.goto("/projects");
    await expect(page.getByRole("link", { name: "New project" })).toBeVisible();
  });
});

test.describe("submission form validation (no data written)", () => {
  test("empty title is rejected client-side", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.goto("/projects/new");
    await page.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText("Title is required.")).toBeVisible();
  });

  test("creating a project is skipped: read-only run", async () => {
    test.skip(true, "needs write permission: POST /projects would create a live row");
  });

  test("submitting for review is skipped: read-only run", async () => {
    test.skip(true, "needs write permission: POST /projects/{id}/submit mutates state");
  });

  test("version upload is skipped: read-only run", async () => {
    test.skip(true, "needs write permission: multipart upload writes to Supabase storage");
  });
});

test.describe("project detail", () => {
  test("unknown project id does not show a perpetual loader", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.goto("/projects/999999");
    // BUG (recorded): on load failure the page keeps the "Loading project"
    // skeleton forever because the error state is never rendered.
    await expect(page.getByText("Loading project")).toBeHidden({ timeout: 15000 });
  });
});
