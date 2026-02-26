/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  /** Full git commit SHA injected at build time via vite.config.ts; empty string if git is unavailable. */
  readonly VITE_GIT_SHA: string;
  /** ISO-8601 timestamp of when the bundle was built, injected at build time via vite.config.ts. */
  readonly VITE_BUILD_DATE: string;
  /** Where the build was produced: "local" for local deploys, "gha" for GitHub Actions.
   *  Typed as a loose string union to allow future values without breaking the build. */
  readonly VITE_BUILD_SOURCE: "local" | "gha" | (string & {});
  /** GitHub Actions run ID when built by CI; empty string for local builds. */
  readonly VITE_BUILD_RUN_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
