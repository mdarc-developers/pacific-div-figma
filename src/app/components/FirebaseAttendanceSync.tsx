import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useAttendanceContext } from "@/app/contexts/AttendanceContext";
import {
  getUserAttendance,
  setUserAttendance,
  addAttendeeRecord,
  removeAttendeeRecord,
} from "@/services/attendanceService";

/**
 * Headless sync component.
 * - On user login: loads saved attendance from Firestore, merges with any
 *   locally-added conferences, and applies the result via AttendanceContext.
 * - On attendance change (after initial load): persists the updated list to
 *   `users/{uid}.attendance` and creates/deletes the primary attendee records
 *   at `conferences/{conferenceId}/attendees/{uid}`.
 * - On logout: clears the loaded state so the next login re-reads Firestore.
 */
export function FirebaseAttendanceSync() {
  const { user } = useAuth();
  const { attendance, overrideAttendance } = useAttendanceContext();

  // Tracks the uid for which we have already loaded from Firestore.
  const loadedForUidRef = useRef<string | null>(null);
  // Prevents writing back to Firestore the value we just read from it.
  const justLoadedRef = useRef(false);
  // Snapshot of attendance after the last Firestore save — used to compute diffs.
  const savedItemsRef = useRef<string[]>([]);

  // Load attendance from Firestore when a user logs in (once per login).
  useEffect(() => {
    if (!user) {
      loadedForUidRef.current = null;
      return;
    }
    if (loadedForUidRef.current === user.uid) return;

    const uidToLoad = user.uid;
    let cancelled = false;

    // Capture local (logged-out) state before any Firestore override.
    const localAttendance = [...attendance];

    getUserAttendance(uidToLoad)
      .then((firestoreIds) => {
        if (cancelled) return;

        // Preserve any conferences added locally while logged out.
        const firestoreSet = new Set(firestoreIds);
        const addedLocally = localAttendance.filter(
          (id) => !firestoreSet.has(id),
        );
        const merged =
          addedLocally.length > 0
            ? [...firestoreIds, ...addedLocally]
            : firestoreIds;

        justLoadedRef.current = true;
        savedItemsRef.current = merged;
        overrideAttendance(merged);

        // If there were locally-added conferences, persist the merged list
        // and create primary attendee records for the new entries.
        if (addedLocally.length > 0) {
          setUserAttendance(uidToLoad, merged).catch(console.error);
          addedLocally.forEach((conferenceId) => {
            addAttendeeRecord(uidToLoad, conferenceId).catch(console.error);
          });
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForUidRef.current = uidToLoad;
      });

    return () => {
      cancelled = true;
    };
  // attendance intentionally omitted: we only want to snapshot it at login time,
  // not re-run the load on every local change.
  }, [user, overrideAttendance]);

  // Persist to Firestore whenever attendance changes (only after initial load).
  // Also create/delete the primary conference attendee records for the diff.
  useEffect(() => {
    if (!user || loadedForUidRef.current !== user.uid) return;
    // Skip the write that mirrors the value we just read from Firestore.
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      savedItemsRef.current = [...attendance];
      return;
    }

    const prev = savedItemsRef.current;
    const next = attendance;
    const added = next.filter((id) => !prev.includes(id));
    const removed = prev.filter((id) => !next.includes(id));

    savedItemsRef.current = [...next];

    // Write the convenience field
    setUserAttendance(user.uid, next).catch(console.error);

    // Maintain primary attendee records
    added.forEach((conferenceId) => {
      addAttendeeRecord(user.uid, conferenceId).catch(console.error);
    });
    removed.forEach((conferenceId) => {
      removeAttendeeRecord(user.uid, conferenceId).catch(console.error);
    });
  }, [user, attendance]);

  return null;
}
