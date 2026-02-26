import { defineConfig } from "vite";
import path from "path";
import { execSync } from "child_process";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import eslint from "@nabla/vite-plugin-eslint";

function getGitSha(): string {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    // Skip the ESLint plugin during test runs — its file-system watchers keep
    // the Vitest process alive after tests complete (37 dangling FILEHANDLE).
    ...(process.env.VITEST ? [] : [eslint()]),
  ],
  define: {
    // Bake the current git commit SHA and build timestamp into the bundle at
    // build time. Works for both local and CI builds without any extra env vars.
    "import.meta.env.VITE_GIT_SHA": JSON.stringify(getGitSha()),
    "import.meta.env.VITE_BUILD_DATE": JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
  },
  test: {
    environment: "jsdom",
    globals: true,
    css: false,
    setupFiles: ["./src/test-setup.ts"],
    // Exclude Playwright e2e specs — they use a different test runner
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
  },
});
