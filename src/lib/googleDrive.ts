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
  if (!credential?.accessToken)
    throw new Error("No Google access token returned");
  cachedAccessToken = credential.accessToken;
  tokenExpiresAt = Date.now() + 55 * 60 * 1000; // refresh 5 min before 1-h expiry
  return cachedAccessToken;
}

export async function deleteDriveFile(
  accessToken: string,
  fileId: string,
): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok && res.status !== 404)
    throw new Error(`Drive delete failed: ${res.statusText}`);
}

export async function uploadFileToDrive(
  accessToken: string,
  folderId: string,
  filename: string,
  file: File,
): Promise<string> {
  const metadata = { name: filename, parents: [folderId] };
  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" }),
  );
  form.append("file", file);
  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    },
  );
  if (!res.ok) throw new Error(`Drive upload failed: ${res.statusText}`);
  const data = (await res.json()) as { id: string };
  return data.id;
}

export async function uploadTextToDrive(
  accessToken: string,
  folderId: string,
  filename: string,
  content: string,
): Promise<string> {
  return uploadFileToDrive(
    accessToken,
    folderId,
    filename,
    new File([content], filename, { type: "text/plain" }),
  );
}

// ---------------------------------------------------------------------------
// Asset path helpers — single source of truth for calculated hidden fields
// ---------------------------------------------------------------------------

export function logoAssetPath(filename: string): string {
  return `/assets/images/${filename}`;
}

export function programAssetPath(filename: string): string {
  return `/assets/programs/${filename}`;
}

export function mapAssetPath(filename: string): string {
  return `/assets/maps/${filename}`;
}

// ---------------------------------------------------------------------------
// Conference year helper — derived from startDate when possible
// ---------------------------------------------------------------------------

export function conferenceYear(startDate: string, slug: string): string {
  const year = startDate
    ? startDate.slice(0, 4)
    : new Date().getFullYear().toString();
  return `${slug}-${year}`;
}
