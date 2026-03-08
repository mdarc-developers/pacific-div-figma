import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useHeaderCollapsed } from "@/app/contexts/HeaderCollapsedContext";
import {
  getUserHeaderCollapsed,
  setUserHeaderCollapsed,
} from "@/services/userSettingsService";

/**
 * Headless sync component.
 * - On user login: loads saved header-collapsed state from Firestore and applies it.
 * - On state change (after initial load): persists the new value to Firestore.
 * - On logout: clears the loaded state so the next login re-reads Firestore.
 */
export function FirebaseHeaderCollapsedSync() {
  const { user } = useAuth();
  const { isHeaderCollapsed, overrideHeaderCollapsed } = useHeaderCollapsed();
  // Tracks the uid for which we have already loaded from Firestore.
  const loadedForUidRef = useRef<string | null>(null);
  // Prevents writing back to Firestore the value we just read from it.
  const justLoadedRef = useRef(false);

  // Load header-collapsed state from Firestore whenever a new user logs in.
  useEffect(() => {
    if (!user) {
      loadedForUidRef.current = null;
      return;
    }
    if (loadedForUidRef.current === user.uid) return;

    const uidToLoad = user.uid;
    let cancelled = false;

    getUserHeaderCollapsed(uidToLoad)
      .then((savedCollapsed) => {
        if (cancelled) return;
        if (savedCollapsed !== null) {
          justLoadedRef.current = true;
          overrideHeaderCollapsed(savedCollapsed);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForUidRef.current = uidToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [user, overrideHeaderCollapsed]);

  // Save header-collapsed state to Firestore whenever it changes (only after the initial load).
  useEffect(() => {
    if (!user || loadedForUidRef.current !== user.uid) return;
    // Skip the write that mirrors the value we just read from Firestore.
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }
    setUserHeaderCollapsed(user.uid, isHeaderCollapsed).catch(console.error);
  }, [user, isHeaderCollapsed]);

  return null;
}
