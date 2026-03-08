import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { loadFromStorage, saveToStorage } from "@/lib/localStorage";
import { PublicAttendeeProfile } from "@/types/conference";
import { writeAuditLog } from "@/services/exportDataService";

export const ATTENDEES_STORAGE_KEY = "public_attendees";

/**
 * Loads the cached public attendee list from localStorage.
 * Returns an empty array if nothing is cached or the cache is malformed.
 */
export function loadAttendeesFromStorage(): PublicAttendeeProfile[] {
  return loadFromStorage<PublicAttendeeProfile[]>(ATTENDEES_STORAGE_KEY, []);
}

/**
 * Persists the given attendee list to localStorage for offline access.
 */
export function saveAttendeesToStorage(
  attendees: PublicAttendeeProfile[],
): void {
  saveToStorage(ATTENDEES_STORAGE_KEY, attendees);
}

/**
 * Fetches all documents from the `publicProfiles` Firestore collection.
 * Requires a verified-email authenticated user (enforced by Firestore rules).
 *
 * Only the allowed public fields (uid, displayName, callsign, displayProfile)
 * are returned. Sensitive fields (email, groups, sessions, exhibitors,
 * prizesDonated) are intentionally excluded.
 *
 * An audit log entry is written to `users/{uid}/auditLog` recording the read
 * attempt and its outcome (result code), without logging the data contents.
 *
 * Throws if the Firestore read fails (e.g. network error or permission denied).
 */
export async function fetchPublicAttendees(
  uid: string,
): Promise<PublicAttendeeProfile[]> {
  let resultCode = 200;
  try {
    const snap = await getDocs(collection(db, "publicProfiles"));
    const attendees = snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        ...(typeof data.displayName === "string" && data.displayName
          ? { displayName: data.displayName }
          : {}),
        ...(typeof data.callsign === "string" && data.callsign
          ? { callsign: data.callsign }
          : {}),
        ...(typeof data.displayProfile === "string" && data.displayProfile
          ? { displayProfile: data.displayProfile }
          : {}),
      } satisfies PublicAttendeeProfile;
    });
    await writeAuditLog(uid, "attendee_list_read", {
      resultCode,
      count: attendees.length,
    });
    return attendees;
  } catch (err) {
    resultCode = 500;
    // Check for Firebase permission-denied code or fall back to message inspection
    if (
      err != null &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "permission-denied"
    ) {
      resultCode = 403;
    }
    await writeAuditLog(uid, "attendee_list_read", { resultCode });
    throw err;
  }
}

/**
 * Writes a public profile entry to `publicProfiles/{uid}` in Firestore.
 * Called client-side when a user enables profile visibility so the UI
 * reflects the change immediately without waiting for the Cloud Function.
 *
 * Only the allowed fields (displayName, callsign, displayProfile) are written.
 * Sensitive fields are stripped before the Firestore write.
 */
export async function writePublicProfile(
  uid: string,
  profile: PublicAttendeeProfile,
): Promise<void> {
  // Destructure only the allowed public fields; discard anything else.
  const { displayName, callsign, displayProfile } = profile;
  const safeProfile: PublicAttendeeProfile = { uid };
  if (displayName !== undefined) safeProfile.displayName = displayName;
  if (callsign !== undefined) safeProfile.callsign = callsign;
  if (displayProfile !== undefined) safeProfile.displayProfile = displayProfile;
  await setDoc(doc(db, "publicProfiles", uid), safeProfile, { merge: true });
}

/**
 * Deletes the public profile entry for the given uid from `publicProfiles`.
 * Called client-side when a user disables profile visibility.
 */
export async function deletePublicProfile(uid: string): Promise<void> {
  await deleteDoc(doc(db, "publicProfiles", uid));
}
