import { expect, test } from "@playwright/test";

test("admin can sign in and review appointments", async ({ page }) => {
  await page.goto("/admin/login");

  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/admin\/appointments/);
  await expect(page.getByRole("heading", { name: "Admin appointment review" })).toBeVisible();
});
