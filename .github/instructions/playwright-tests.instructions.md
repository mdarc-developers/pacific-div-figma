---
applyTo: "e2e/**/*.spec.ts"
---

## Playwright E2E test requirements

The E2E test suite targets the production bundle served by `vite preview`.
Always build first, then test:

```bash
npm run build:test   # builds with --mode test (stub Firebase keys are fine)
npm run test:e2e     # runs Playwright against http://127.0.0.1:5173
```

When writing or modifying Playwright tests, follow these guidelines:

1. **Use stable locators** — prefer `getByRole()`, `getByText()`, and `getByTestId()` over CSS selectors or XPath.
2. **Write isolated tests** — each test must be independent and must not rely on state from other tests.
3. **Follow naming conventions** — use descriptive test names and `*.spec.ts` file names inside `e2e/`.
4. **Use Playwright's auto-wait** — avoid `setTimeout()` and rely on Playwright's built-in waiting mechanisms.
5. **Test Chromium only** — the project's `playwright.config.ts` targets Desktop Chrome; do not add other browser projects without discussion.
6. **No hard-coded waits** — use `expect(locator).toBeVisible()` or similar assertions instead of `page.waitForTimeout()`.
7. **Base URL** — all navigation uses `baseURL: "http://127.0.0.1:5173"` (set in `playwright.config.ts`); use relative paths in `page.goto()` calls (e.g., `page.goto('/maps')`).
