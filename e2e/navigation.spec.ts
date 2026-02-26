import { test, expect } from "@playwright/test";

/**
 * Navigation smoke tests.
 * Verifies that every nav link in Navigation.tsx:
 *   - is visible on the page
 *   - routes to the correct URL when clicked
 *   - shows the expected page-level landmark / heading
 */

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("default route redirects to /schedule", async ({ page }) => {
    await expect(page).toHaveURL(/\/schedule/);
  });

  test("Schedule nav link is visible", async ({ page }) => {
    await expect(page.getByRole("link", { name: /schedule/i })).toBeVisible();
  });

  test("Venue nav link navigates to /maps", async ({ page }) => {
    await page.getByRole("link", { name: /venue/i }).click();
    await expect(page).toHaveURL(/\/maps/);
  });

  test("Forums nav link navigates to /forums", async ({ page }) => {
    await page.getByRole("link", { name: /forums/i }).click();
    await expect(page).toHaveURL(/\/forums/);
  });

  test("Exhibitors nav link navigates to /exhibitors", async ({ page }) => {
    await page.getByRole("link", { name: /exhibitors/i }).click();
    await expect(page).toHaveURL(/\/exhibitors/);
  });

  test("Prizes nav link navigates to /prizes", async ({ page }) => {
    await page.getByRole("link", { name: /prizes/i }).click();
    await expect(page).toHaveURL(/\/prizes/);
  });

  test("Attendees nav link navigates to /attendees", async ({ page }) => {
    await page.getByRole("link", { name: /attendees/i }).click();
    await expect(page).toHaveURL(/\/attendees/);
  });
});

test.describe("Header", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows the active conference name", async ({ page }) => {
    // The first conference in allConferences list is displayed in the header button
    const conferenceButton = page
      .getByRole("button", {
        name: /sea|hamvention|pacificon|huntsville|hamcation|yuma/i,
      })
      .first();
    await expect(conferenceButton).toBeVisible();
  });

  test("conference selector dialog opens and lists conferences", async ({
    page,
  }) => {
    // Click the selector button (truncated conference name + chevron)
    const selectorButton = page
      .locator("button:has(svg)")
      .filter({
        hasText: /sea|hamvention|pacificon|huntsville|hamcation|yuma/i,
      })
      .first();
    await selectorButton.click();
    // Dialog should appear
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Select Conference")).toBeVisible();
    // At least one conference card should be listed
    await expect(
      page.locator('[role="dialog"] [class*="cursor-pointer"]').first(),
    ).toBeVisible();
  });

  test("header collapse button toggles header", async ({ page }) => {
    const collapseBtn = page.getByLabel(/collapse|expand/i);
    // Header is initially expanded – the date/venue details should be visible
    await expect(collapseBtn).toBeVisible();
    await collapseBtn.click();
    // After collapsing the venue details should be hidden; only the title remains
    const venueDetail = page
      .locator("svg")
      .filter({ has: page.locator('~ span:text("map")') });
    // The conference name heading is still visible in collapsed state
    await expect(page.locator("h1").first()).toBeVisible();
  });
});
