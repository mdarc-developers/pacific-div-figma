import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { loadFromStorage, saveToStorage } from "@/lib/localStorage";
import { PublicAttendeeProfile } from "@/types/conference";

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
 * The collection is publicly readable and is maintained by the
 * `syncPublicProfile` Cloud Function.
 *
 * Throws if the Firestore read fails (e.g. network error).
 */
export async function fetchPublicAttendees(): Promise<PublicAttendeeProfile[]> {
  const snap = await getDocs(collection(db, "publicProfiles"));
  return snap.docs.map((d) => {
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
      ...(typeof data.email === "string" && data.email
        ? { email: data.email }
        : {}),
      ...(Array.isArray(data.groups) ? { groups: data.groups as string[] } : {}),
      ...(Array.isArray(data.sessions)
        ? { sessions: data.sessions as string[] }
        : {}),
      ...(Array.isArray(data.exhibitors)
        ? { exhibitors: data.exhibitors as string[] }
        : {}),
      ...(Array.isArray(data.prizesDonated)
        ? { prizesDonated: data.prizesDonated as string[] }
        : {}),
    } satisfies PublicAttendeeProfile;
  });
}

/**
 * Writes a public profile entry to `publicProfiles/{uid}` in Firestore.
 * Called client-side when a user enables profile visibility so the UI
 * reflects the change immediately without waiting for the Cloud Function.
 */
export async function writePublicProfile(
  uid: string,
  profile: PublicAttendeeProfile,
): Promise<void> {
  await setDoc(doc(db, "publicProfiles", uid), profile, { merge: true });
}

/**
 * Deletes the public profile entry for the given uid from `publicProfiles`.
 * Called client-side when a user disables profile visibility.
 */
export async function deletePublicProfile(uid: string): Promise<void> {
  await deleteDoc(doc(db, "publicProfiles", uid));
}
