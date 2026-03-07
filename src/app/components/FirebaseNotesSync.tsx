import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useNotesContext } from "@/app/contexts/NotesContext";
import { getUserNotes, setUserNotes } from "@/services/userSettingsService";

/**
 * Headless sync component.
 * - On user login (or conference change while logged in): loads saved session notes
 *   from Firestore and applies them via the shared NotesContext.
 * - On notes change (after initial load): persists updated notes to Firestore.
 * - On logout: clears the loaded state so the next login re-reads Firestore.
 */
export function FirebaseNotesSync() {
  const { user } = useAuth();
  const { activeConference } = useConference();
  const { notes, overrideNotes } = useNotesContext();

  const conferenceId = activeConference.id;
  // Composite key: changes when either the user or the active conference changes.
  const loadKey = user ? `${user.uid}:${conferenceId}` : null;

  // Tracks the composite key for which we have already loaded from Firestore.
  const loadedForKeyRef = useRef<string | null>(null);
  // Prevents writing back to Firestore the value we just read from it.
  const justLoadedRef = useRef(false);

  // Load notes from Firestore whenever a new user logs in or the active
  // conference changes while the user is already logged in.
  useEffect(() => {
    if (!user || !loadKey) {
      loadedForKeyRef.current = null;
      return;
    }
    if (loadedForKeyRef.current === loadKey) return;

    const keyToLoad = loadKey;
    const uidToLoad = user.uid;
    let cancelled = false;

    getUserNotes(uidToLoad, conferenceId)
      .then((savedNotes) => {
        if (cancelled) return;
        justLoadedRef.current = true;
        overrideNotes(savedNotes);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForKeyRef.current = keyToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [user, loadKey, conferenceId, overrideNotes]);

  // Save notes to Firestore whenever they change (only after the initial load).
  useEffect(() => {
    if (!user || loadedForKeyRef.current !== loadKey) return;
    // Skip the write that mirrors the value we just read from Firestore.
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }
    setUserNotes(user.uid, conferenceId, notes).catch(console.error);
  }, [user, loadKey, conferenceId, notes]);

  return null;
}
