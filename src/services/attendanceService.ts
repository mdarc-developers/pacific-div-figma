import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Reads the list of conference IDs the user has marked as attending.
 * Source: `users/{uid}.attendance` (array of conferenceId strings).
 */
export async function getUserAttendance(uid: string): Promise<string[]> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return [];
  const data = snap.data();
  return Array.isArray(data?.attendance) ? (data.attendance as string[]) : [];
}

/**
 * Writes the full attendance list to the user's convenience field.
 * Path: `users/{uid}.attendance`
 */
export async function setUserAttendance(
  uid: string,
  conferenceIds: string[],
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { attendance: conferenceIds },
    { merge: true },
  );
}

/**
 * Creates (or overwrites) the primary attendee record for a single conference.
 * Path: `conferences/{conferenceId}/attendees/{uid}`
 * Not exposed via public read services — only the authenticated owner may write.
 */
export async function addAttendeeRecord(
  uid: string,
  conferenceId: string,
): Promise<void> {
  await setDoc(
    doc(db, "conferences", conferenceId, "attendees", uid),
    { uid, joinedAt: serverTimestamp() },
    { merge: true },
  );
}

/**
 * Deletes the primary attendee record for a single conference.
 * Path: `conferences/{conferenceId}/attendees/{uid}`
 */
export async function removeAttendeeRecord(
  uid: string,
  conferenceId: string,
): Promise<void> {
  await deleteDoc(doc(db, "conferences", conferenceId, "attendees", uid));
}
