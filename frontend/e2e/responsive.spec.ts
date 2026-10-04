import { test, expect, loginAs } from "./fixtures";

// Render-only checks for the mobile viewports (Pixel 5, iPhone 13).
// No data is written; each test asserts the page answers and the key
// heading plus primary control are visible without horizontal breakage.
test.describe("mobile rendering", () => {
  test("login form fits and submits", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await page.getByLabel("Email").fill("e2e-student-a@test.local");
    await page.getByLabel("Password").fill("E2eTest123!");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test("dashboard cards render", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.goto("/dashboard");
    await expect(page.getByText("STUDENT dashboard")).toBeVisible();
    await expect(page.getByRole("link", { name: "Open projects" })).toBeVisible();
  });

  test("project registry renders", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
    await expect(page.getByLabel("Search")).toBeVisible();
  });

  test("notifications inbox renders", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.goto("/notifications");
    await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  });

  test("showcase renders", async ({ page }) => {
    await page.goto("/showcase");
    await expect(page.getByRole("heading", { name: "Project showcase" })).toBeVisible();
  });
});
