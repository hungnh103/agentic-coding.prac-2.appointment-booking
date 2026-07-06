import { expect, test } from "@playwright/test";

test("patient can open availability and submit a booking request", async ({ page }) => {
  await page.goto("/doctors/11111111-1111-1111-1111-111111111111");

  await expect(page.getByRole("heading", { name: "Dr. Lan Ngo" })).toBeVisible();
  await page.getByLabel("Full name").fill("Jamie Patient");
  await page.getByLabel("Phone").fill("0123456789");
  await page.getByLabel("Email").fill("jamie@example.com");
  await page.getByRole("button", { name: "Book appointment" }).click();

  await expect(page).toHaveURL(/\/appointments\//);
  await expect(page.getByText("Appointment summary")).toBeVisible();
});
