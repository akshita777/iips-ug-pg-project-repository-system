import { test, expect, loginAs } from "./fixtures";

const NEW_ACCOUNT = `e2e-new-${Date.now()}@test.local`;

test.describe("login form", () => {
  test("student logs in and lands on the student dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("e2e-student-a@test.local");
    await page.getByLabel("Password").fill("E2eTest123!");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText("STUDENT dashboard")).toBeVisible();
  });

  test("wrong password shows an error and stays on login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("e2e-student-a@test.local");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByText("Login failed. Check your email and password.")).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });

  test("malformed email never leaves the login page", async ({ page }) => {
    // NOTE (recorded): the email input is type=email, so the browser's native
    // validation bubble fires and the app's own "Enter a valid email" error
    // never renders. Assert the honest behavior: no navigation happens.
    await page.goto("/login");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("whatever");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page).toHaveURL(/login/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("empty password is rejected before any request", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("e2e-student-a@test.local");
    await page.getByLabel("Password").fill("");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("logout returns to the login page", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.goto("/dashboard");
    await expect(page.getByText("STUDENT dashboard")).toBeVisible();
    await page.getByRole("button", { name: "Logout" }).first().click();
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("route protection", () => {
  test("anonymous visitor is sent from dashboard to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });

  test("student can open the submission form", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.goto("/projects/new");
    await expect(page.getByRole("heading", { name: "Submit project" })).toBeVisible();
  });

  test("faculty is bounced off the student-only submission form", async ({ page }) => {
    await loginAs(page, "guide");
    await page.goto("/projects/new");
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe("register form", () => {
  test("fresh evaluator account registers and lands on dashboard", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("E2E Fresh");
    await page.getByLabel("Email").fill(NEW_ACCOUNT);
    await page.getByLabel("Password").fill("E2eTest123!");
    await page.getByRole("button", { name: "EVALUATOR", exact: true }).click();
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText("EVALUATOR dashboard")).toBeVisible();
  });

  test("duplicate email shows a failure message", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("E2E Dupe");
    await page.getByLabel("Email").fill("e2e-student-a@test.local");
    await page.getByLabel("Password").fill("E2eTest123!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Registration failed. This email may already be used.")).toBeVisible();
  });

  test("short name is rejected client-side", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("X");
    await page.getByLabel("Email").fill(`e2e-ok-${Date.now()}@test.local`);
    await page.getByLabel("Password").fill("E2eTest123!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Enter your full name")).toBeVisible();
  });
});
