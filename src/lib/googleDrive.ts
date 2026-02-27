import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

// Cache the token for the browser session; Google access tokens expire in 1 h.
let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

/** Return a cached Drive-scoped access token, re-authenticating only when expired. */
export async function getGoogleAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }
  const provider = new GoogleAuthProvider();
  provider.addScope(DRIVE_SCOPE);
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) throw new Error("No Google access token returned");
  cachedAccessToken = credential.accessToken;
  tokenExpiresAt = Date.now() + 55 * 60 * 1000; // refresh 5 min before 1-h expiry
  return cachedAccessToken;
}

export async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok && res.status !== 404) throw new Error(`Drive delete failed: ${res.statusText}`);
}
