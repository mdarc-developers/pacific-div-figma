import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import {
  getUserActiveConferenceId,
  setUserActiveConferenceId,
} from "@/services/userSettingsService";
import { allConferences } from "@/data/all-conferences";
import { Conference } from "@/types/conference";

/**
 * Headless sync component.
 * - On user login: loads saved active conference ID from Firestore and applies it.
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

  // Load active conference from Firestore whenever a new user logs in.
  useEffect(() => {
    if (!user) {
      loadedForUidRef.current = null;
      return;
    }
    if (loadedForUidRef.current === user.uid) return;

    const uidToLoad = user.uid;
    let cancelled = false;

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
