import { expect, test } from "@playwright/test";

test("appointment detail page shows status timeline and reminder-ready copy", async ({ page }) => {
  await page.goto("/appointments/demo-confirmed");

  await expect(page.getByText("Status timeline")).toBeVisible();
  await expect(page.getByText(/reminder-ready/i)).toBeVisible();
});
