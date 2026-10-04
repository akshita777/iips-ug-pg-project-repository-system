import { test, expect } from "@playwright/test";

test.describe("public pages", () => {
  test("landing renders the masthead, navbar, and hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner")).toContainText("International Institute of Professional Studies");
    await expect(page.getByRole("navigation", { name: "Main" })).toContainText("Projects");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("IIPS Project");
    await expect(page.getByRole("link", { name: "Browse Projects" })).toBeVisible();
  });

  test("showcase page answers even with an empty backend", async ({ page }) => {
    await page.goto("/showcase");
    await expect(page.getByRole("heading", { name: "Project showcase" })).toBeVisible();
  });

  test("login sets the tab title and shows the form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("unknown routes get the custom 404", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Projects" }).first()).toBeVisible();
  });
});
