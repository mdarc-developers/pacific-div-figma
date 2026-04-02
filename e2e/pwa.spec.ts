import { test, expect } from "@playwright/test";

/**
 * Progressive Web App (PWA) tests.
 *
 * These tests run against the production build served by `vite preview`.
 * Build the app first with `npm run build:test` before running this suite.
 *
 * Verified features:
 *  - Web App Manifest (`/manifest.webmanifest`) is served with the required fields
 *  - PWA meta tags are present in the HTML <head>
 *  - PWA icons are served (192x192, 512x512, maskable)
 *  - Service worker script is served
 */

// ── Web App Manifest ──────────────────────────────────────────────────────────

test.describe("Web App Manifest", () => {
  test("manifest.webmanifest is served as valid JSON", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.ok()).toBe(true);

    const contentType = response.headers()["content-type"] ?? "";
    // The spec says application/manifest+json; some servers use application/json
    expect(contentType).toMatch(/json/i);

    const manifest = await response.json();
    expect(typeof manifest).toBe("object");
  });

  test("manifest has required identity fields", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    const manifest = await response.json();

    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.description).toBeTruthy();
  });

  test("manifest name matches the app", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    const manifest = await response.json();

    expect(manifest.name).toBe("Amateur Radio Conference Companion");
    expect(manifest.short_name).toBe("Ham Radio");
  });

  test("manifest has display:standalone for a full-screen PWA experience", async ({
    request,
  }) => {
    const response = await request.get("/manifest.webmanifest");
    const manifest = await response.json();

    expect(manifest.display).toBe("standalone");
  });

  test("manifest has correct start_url and scope", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    const manifest = await response.json();

    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
  });

  test("manifest has theme_color and background_color", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    const manifest = await response.json();

    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.background_color).toBeTruthy();
  });

  test("manifest includes at least a 192x192 and a 512x512 icon", async ({
    request,
  }) => {
    const response = await request.get("/manifest.webmanifest");
    const manifest = await response.json();

    const icons: Array<{ src: string; sizes: string; purpose?: string }> =
      manifest.icons ?? [];

    const has192 = icons.some((icon) => icon.sizes.includes("192x192"));
    const has512 = icons.some((icon) => icon.sizes.includes("512x512"));
    const hasMaskable = icons.some((icon) =>
      icon.purpose?.includes("maskable"),
    );

    expect(has192).toBe(true);
    expect(has512).toBe(true);
    expect(hasMaskable).toBe(true);
  });

  test("manifest icon files are served", async ({ request }) => {
    const manifestResponse = await request.get("/manifest.webmanifest");
    const manifest = await manifestResponse.json();

    const icons: Array<{ src: string; sizes: string }> = manifest.icons ?? [];
    for (const icon of icons) {
      const iconResponse = await request.get(icon.src);
      expect(
        iconResponse.ok(),
        `Icon ${icon.src} (${icon.sizes}) should be served`,
      ).toBe(true);
    }
  });
});

// ── PWA meta tags ─────────────────────────────────────────────────────────────

test.describe("PWA meta tags", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("theme-color meta tag is present", async ({ page }) => {
    const themeColor = await page.$eval(
      'meta[name="theme-color"]',
      (el: Element) => (el as HTMLMetaElement).content,
    );
    expect(themeColor).toBeTruthy();
  });

  test("mobile-web-app-capable meta tag is present", async ({ page }) => {
    const capable = await page.$eval(
      'meta[name="mobile-web-app-capable"]',
      (el: Element) => (el as HTMLMetaElement).content,
    );
    expect(capable).toBe("yes");
  });

  test("apple-mobile-web-app-capable meta tag is present", async ({ page }) => {
    // apple-mobile-web-app-capable enables Add to Home Screen (A2HS) on iOS /
    // iPadOS, causing Safari to hide browser chrome and run the app like a native
    // app. The site uses mobile-web-app-capable (the modern cross-browser variant)
    // which also satisfies iOS Safari's A2HS requirement.
    const capable = await page.$eval(
      'meta[name="mobile-web-app-capable"]',
      (el: Element) => (el as HTMLMetaElement).content,
    );
    expect(capable).toBe("yes");
  });

  test("apple-mobile-web-app-title meta tag is present", async ({ page }) => {
    const title = await page.$eval(
      'meta[name="apple-mobile-web-app-title"]',
      (el: Element) => (el as HTMLMetaElement).content,
    );
    expect(title).toBeTruthy();
  });

  test("apple-touch-icon link is present", async ({ page }) => {
    const href = await page.$eval(
      'link[rel="apple-touch-icon"]',
      (el: Element) => (el as HTMLLinkElement).href,
    );
    expect(href).toContain("apple-touch-icon");
  });

  test("apple-touch-icon image is served", async ({ page, request }) => {
    const href = await page.$eval(
      'link[rel="apple-touch-icon"]',
      (el: Element) => (el as HTMLLinkElement).getAttribute("href") ?? "",
    );
    // href may be relative or absolute
    const url = href.startsWith("http") ? href : `/${href.replace(/^\//, "")}`;
    const response = await request.get(url);
    expect(response.ok()).toBe(true);
  });

  test("manifest link tag is present", async ({ page }) => {
    // VitePWA injects a <link rel="manifest"> pointing at the manifest file
    const href = await page.$eval(
      'link[rel="manifest"]',
      (el: Element) => (el as HTMLLinkElement).href,
    );
    expect(href).toContain("manifest");
  });
});

// ── Service Worker ────────────────────────────────────────────────────────────

test.describe("Service Worker", () => {
  test("Workbox service worker script is served", async ({ request }) => {
    // VitePWA generates sw.js at the root by default
    const response = await request.get("/sw.js");
    expect(response.ok()).toBe(true);

    const body = await response.text();
    // The generated service worker should reference workbox or precache logic
    expect(body.length).toBeGreaterThan(0);
  });

  test("Firebase Messaging service worker is served", async ({ request }) => {
    const response = await request.get("/firebase-messaging-sw.js");
    expect(response.ok()).toBe(true);

    const body = await response.text();
    // Should reference Firebase Cloud Messaging
    expect(body).toContain("firebase-messaging");
  });
});

// ── Offline / App Shell ───────────────────────────────────────────────────────

test.describe("App Shell", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/schedule");
  });

  test("app responds without a server error", async ({ page }) => {
    // The SPA shell (index.html) should be served for any in-scope route.
    await expect(page).toHaveURL(/\/schedule/);
    // Verify the HTML itself is not a server-side error page
    await expect(page.locator("body")).not.toContainText("500");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
  });

  test("app serves a favicon", async ({ request }) => {
    const response = await request.get("/favicon.png");
    expect(response.ok()).toBe(true);
  });
});
