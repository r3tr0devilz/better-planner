import { expect, test } from "@playwright/test";

test("redirects signed-out visitors to the login page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Better Planner" })).toBeVisible();
  await expect(page.getByText("Sign in to your dashboard.")).toBeVisible();
});

test("shows an accessible sign-in form", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
