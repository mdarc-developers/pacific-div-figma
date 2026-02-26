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

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingVars = (
  [
    ["apiKey", "VITE_FIREBASE_API_KEY"],
    ["authDomain", "VITE_FIREBASE_AUTH_DOMAIN"],
    ["projectId", "VITE_FIREBASE_PROJECT_ID"],
    ["storageBucket", "VITE_FIREBASE_STORAGE_BUCKET"],
    ["messagingSenderId", "VITE_FIREBASE_MESSAGING_SENDER_ID"],
    ["appId", "VITE_FIREBASE_APP_ID"],
  ] as [keyof typeof firebaseConfig, string][]
)
  .filter(([k]) => !firebaseConfig[k])
  .map(([, envVar]) => envVar);

if (missingVars.length > 0) {
  throw new Error(
    `Missing Firebase configuration. Ensure the following environment variables are set: ${missingVars.join(", ")}. ` +
      "See .env.example and FIREBASE_SETUP.md for instructions."
  );
}

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
