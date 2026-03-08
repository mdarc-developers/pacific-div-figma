import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  updateDoc,
} from "firebase/firestore";

/**
 * Reads the list of conference IDs the user has marked as attending.
 * Source: `users/{uid}.attendance` (array of conferenceId strings).
 */
export async function getUserAttendance(uid: string): Promise<string[]> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return [];
  const data = snap.data();
  return Array.isArray(data?.attendance)
    ? (data.attendance as string[])
    : [];
}

/**
 * Adds a conference to the user's attendance.
 * - Primary record: `conferences/{conferenceId}/attendees/{uid}`
 * - Convenience field: adds conferenceId to `users/{uid}.attendance` array
 */
export async function addUserAttendance(
  uid: string,
  conferenceId: string,
): Promise<void> {
  // Primary record — not exposed via public services
  await setDoc(
    doc(db, "conferences", conferenceId, "attendees", uid),
    { uid, joinedAt: serverTimestamp() },
    { merge: true },
  );

  // Convenience field on the user document
  await setDoc(
    doc(db, "users", uid),
    { attendance: arrayUnion(conferenceId) },
    { merge: true },
  );
}

/**
 * Removes a conference from the user's attendance.
 * - Deletes the primary record `conferences/{conferenceId}/attendees/{uid}`
 * - Removes conferenceId from `users/{uid}.attendance` array
 */
export async function removeUserAttendance(
  uid: string,
  conferenceId: string,
): Promise<void> {
  // Remove primary record
  await deleteDoc(
    doc(db, "conferences", conferenceId, "attendees", uid),
  );

  // Remove from convenience array — use updateDoc so it's atomic
  await updateDoc(doc(db, "users", uid), {
    attendance: arrayRemove(conferenceId),
  });
}
