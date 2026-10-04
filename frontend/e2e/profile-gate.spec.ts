import { test, expect, loginAs } from "./fixtures";

const INCOMPLETE = {
  id: 5,
  name: "Aarav E2E",
  email: "e2e-student-a@test.local",
  role: "STUDENT",
  rollNumber: null,
  semester: null,
  section: null,
};

test.describe("submit gate", () => {
  test("student without a roll number gets the complete-profile gate", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.route("**/api/v1/users/me", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(INCOMPLETE) })
    );
    await page.goto("/projects/new");
    await expect(page.getByRole("heading", { name: "Complete your profile first" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Complete profile" })).toBeVisible();
    await expect(page.getByLabel("Project title *")).toHaveCount(0);
  });

  test("complete-profile update mode prefills and saves", async ({ page }) => {
    await loginAs(page, "student-a");
    await page.route("**/api/v1/users/me", (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...INCOMPLETE, name: "Aarav E2E" }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...INCOMPLETE, rollNumber: "IC2k22-90", semester: 6 }),
      });
    });
    await page.goto("/auth/complete-profile");
    await expect(page.getByRole("heading", { name: "Update profile" })).toBeVisible();
    await page.getByLabel("Full name").fill("Aarav E2E");
    await page.getByLabel("Roll Number").fill("IC2k22-90");
    await page.getByLabel("Semester (1-10)").fill("6");
    await page.getByRole("button", { name: "Save and continue" }).click();
    await expect(page).toHaveURL(/projects\/new/);
  });

  test("complete-profile without session or login bounces to login", async ({ page }) => {
    await page.goto("/auth/complete-profile");
    await expect(page).toHaveURL(/login/);
  });
});
