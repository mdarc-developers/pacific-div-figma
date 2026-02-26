import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright end-to-end test configuration.
 *
 * Tests run against a `vite preview` server that serves the production build
 * (`dist/`).  Build the app first with `npm run build:test` (which injects
 * stub Firebase keys via .env.test) and then run `npm run test:e2e`.
 *
 * One-liner: `npm run build:test && npm run test:e2e`
 */
export default defineConfig({
  testDir: "./e2e",
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Run tests in files in parallel
  fullyParallel: true,
  // Reporter – concise in CI, verbose list locally
  reporter: process.env.CI ? "github" : "list",
  use: {
    // Base URL for all page.goto('/...') calls
    baseURL: "http://127.0.0.1:5173",
    // Capture traces on first retry to help debug CI failures
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Serve the pre-built production bundle.
  // Run `npm run build:test` first to generate dist/ with stub Firebase keys.
  webServer: {
    command: "npm run preview",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
