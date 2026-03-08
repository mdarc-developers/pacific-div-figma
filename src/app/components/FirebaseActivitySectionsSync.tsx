import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useActivitySections } from "@/app/contexts/ActivitySectionsContext";
import {
  getUserActivitySections,
  setUserActivitySections,
} from "@/services/userSettingsService";

/**
 * Headless sync component.
 * - On user login: loads saved activity-section collapse states from Firestore
 *   and applies them via ActivitySectionsContext.
 * - On state change (after initial load): persists the new state to Firestore.
 * - On logout: clears the loaded state so the next login re-reads Firestore.
 */
export function FirebaseActivitySectionsSync() {
  const { user } = useAuth();
  const { sections, overrideSections } = useActivitySections();
  // Tracks the uid for which we have already loaded from Firestore.
  const loadedForUidRef = useRef<string | null>(null);
  // Prevents writing back to Firestore the value we just read from it.
  const justLoadedRef = useRef(false);

  // Load from Firestore whenever a new user logs in.
  useEffect(() => {
    if (!user) {
      loadedForUidRef.current = null;
      return;
    }
    if (loadedForUidRef.current === user.uid) return;

    const uidToLoad = user.uid;
    let cancelled = false;

    getUserActivitySections(uidToLoad)
      .then((saved) => {
        if (cancelled) return;
        if (saved) {
          justLoadedRef.current = true;
          overrideSections(saved);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForUidRef.current = uidToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [user, overrideSections]);

  // Save to Firestore whenever sections change (only after the initial load).
  useEffect(() => {
    if (!user || loadedForUidRef.current !== user.uid) return;
    // Skip the write that mirrors the value we just read from Firestore.
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }
    setUserActivitySections(user.uid, sections).catch(console.error);
  }, [user, sections]);

  return null;
}
