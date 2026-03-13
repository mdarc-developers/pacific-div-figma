import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  useConference,
  CONFERENCE_STORAGE_KEY,
} from "@/app/contexts/ConferenceContext";
import {
  getUserActiveConferenceId,
  setUserActiveConferenceId,
} from "@/services/userSettingsService";
import { allConferences } from "@/data/all-conferences";
import { Conference } from "@/types/conference";

/**
 * Headless sync component.
 * - On user login: if localStorage already holds a valid conference ID, use it
 *   as the source of truth and sync it to Firestore (so other devices stay in
 *   sync). Only falls back to reading from Firestore when localStorage has no
 *   stored preference (e.g. first login on a fresh device or after localStorage
 *   has been cleared).
 * - On conference change (after initial load): persists the new conference ID to Firestore.
 * - On logout: clears the loaded state so the next login re-reads Firestore.
 */
export function FirebaseConferenceSync() {
  const { user } = useAuth();
  const { activeConference, setActiveConference } = useConference();
  // Tracks the uid for which we have already loaded from Firestore.
  const loadedForUidRef = useRef<string | null>(null);
  // Prevents writing back to Firestore the value we just read from it.
  const justLoadedRef = useRef(false);

  // Sync active conference on login.
  useEffect(() => {
    if (!user) {
      loadedForUidRef.current = null;
      return;
    }
    if (loadedForUidRef.current === user.uid) return;

    const uidToLoad = user.uid;
    let cancelled = false;

    // localStorage is the source of truth for the active conference.
    // If it holds a valid conference ID, use it and push it to Firestore so
    // other devices stay in sync. Only read from Firestore as a fallback when
    // localStorage has no stored preference (e.g. first login on a fresh device
    // or after localStorage has been cleared).
    let localId: string | null = null;
    try {
      localId = localStorage.getItem(CONFERENCE_STORAGE_KEY);
    } catch {
      // ignore
    }

    if (localId) {
      const localConf = allConferences.find(
        (c) => c.id === localId && c.id !== "---",
      ) as Conference | undefined;
      if (localConf) {
        // Suppress the echoed write from the second effect, then do a single
        // targeted write to keep Firestore in sync with local state.
        justLoadedRef.current = true;
        loadedForUidRef.current = uidToLoad;
        setUserActiveConferenceId(uidToLoad, localId).catch(console.error);
        return;
      }
    }

    // No valid local preference — fall back to Firestore.
    getUserActiveConferenceId(uidToLoad)
      .then((savedId) => {
        if (cancelled) return;
        if (savedId) {
          const found = allConferences.find(
            (c) => c.id === savedId && c.id !== "---",
          ) as Conference | undefined;
          if (found) {
            justLoadedRef.current = true;
            setActiveConference(found);
          }
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForUidRef.current = uidToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [user, setActiveConference]);

  // Save active conference ID to Firestore whenever it changes (only after the initial load).
  useEffect(() => {
    if (!user || loadedForUidRef.current !== user.uid) return;
    // Skip the write that mirrors the value we just read from Firestore.
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }
    setUserActiveConferenceId(user.uid, activeConference.id).catch(
      console.error,
    );
  }, [user, activeConference]);

  return null;
}
