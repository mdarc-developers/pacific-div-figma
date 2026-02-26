// Firebase Configuration
// Replace these values with your actual Firebase config
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
//import { getAnalytics } from "firebase/analytics";
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Firebase Hosting sets window.__FIREBASE_DEFAULTS__ via an inline XHR that
// fetches /__/firebase/init.json (loaded in index.html before module scripts).
// When that config is present the app reads it at runtime, so no
// VITE_FIREBASE_* build-time secrets are required in CI/CD.
declare global {
  interface Window {
    __FIREBASE_DEFAULTS__?: { config?: Record<string, string> };
  }
}

// Auto-configuration provided by Firebase Hosting at runtime.
const autoConfig =
  typeof window !== "undefined" ? window.__FIREBASE_DEFAULTS__?.config : undefined;

// Env-var configuration used for local development (see .env.example).
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only validate env vars when the Firebase Hosting auto-config is unavailable
// (i.e. during local development or non-Hosting deployments).
if (!autoConfig) {
  const missingVars = (
    [
      ["apiKey", "VITE_FIREBASE_API_KEY"],
      ["authDomain", "VITE_FIREBASE_AUTH_DOMAIN"],
      ["projectId", "VITE_FIREBASE_PROJECT_ID"],
      ["storageBucket", "VITE_FIREBASE_STORAGE_BUCKET"],
      ["messagingSenderId", "VITE_FIREBASE_MESSAGING_SENDER_ID"],
      ["appId", "VITE_FIREBASE_APP_ID"],
    ] as [keyof typeof envConfig, string][]
  )
    .filter(([k]) => !envConfig[k])
    .map(([, envVar]) => envVar);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing Firebase configuration. Ensure the following environment variables are set: ${missingVars.join(", ")}. ` +
        "See .env.example and FIREBASE_SETUP.md for instructions."
    );
  }
}

// Use Firebase Hosting auto-config when available; fall back to env vars.
const firebaseConfig = autoConfig ?? envConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

//match /userSettings/{uid} {
//  allow read, write: if request.auth != null && request.auth.uid == uid;
//}
