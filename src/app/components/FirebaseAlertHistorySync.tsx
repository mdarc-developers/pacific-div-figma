import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  useAlertHistoryContext,
  MAX_ALERT_HISTORY,
} from "@/app/contexts/AlertHistoryContext";
import {
  getUserAlertHistory,
  setUserAlertHistory,
} from "@/services/userSettingsService";

/**
 * Headless sync component.
 * - On user login: loads saved alert history from Firestore, merges with any
 *   locally-accumulated alerts, and applies the result via AlertHistoryContext.
 * - On history change (after initial load): persists the updated list to
 *   `users/{uid}.alertHistory`.
 * - On logout: clears the loaded state so the next login re-reads Firestore.
 */
export function FirebaseAlertHistorySync() {
  const { user } = useAuth();
  const { alertHistory, overrideAlertHistory } = useAlertHistoryContext();

  const loadedForUidRef = useRef<string | null>(null);
  const justLoadedRef = useRef(false);

  // Load alert history from Firestore when a user logs in (once per login).
  useEffect(() => {
    if (!user) {
      loadedForUidRef.current = null;
      return;
    }
    if (loadedForUidRef.current === user.uid) return;

    const uidToLoad = user.uid;
    let cancelled = false;

    // Capture local (pre-login) alerts before any Firestore override.
    const localHistory = [...alertHistory];

    getUserAlertHistory(uidToLoad)
      .then((firestoreHistory) => {
        if (cancelled) return;

        // Merge: Firestore wins for existing ids; locally-seen alerts are appended.
        const firestoreIds = new Set(firestoreHistory.map((a) => a.id));
        const addedLocally = localHistory.filter(
          (a) => !firestoreIds.has(a.id),
        );
        const merged =
          addedLocally.length > 0
            ? [...firestoreHistory, ...addedLocally]
            : firestoreHistory;

        // Sort newest first, then cap to avoid unbounded growth.
        merged.sort((a, b) => b.timestamp - a.timestamp);
        const capped = merged.slice(0, MAX_ALERT_HISTORY);

        justLoadedRef.current = true;
        overrideAlertHistory(capped);

        // If we added locally-seen alerts, persist the merged list.
        if (addedLocally.length > 0) {
          setUserAlertHistory(uidToLoad, capped).catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForUidRef.current = uidToLoad;
      });

    return () => {
      cancelled = true;
    };
    // alertHistory is intentionally excluded from this effect's deps — a snapshot
    // is captured at login time to avoid re-running the load on every history change.
  }, [user, overrideAlertHistory]);

  // Save history to Firestore whenever it changes (only after the initial load).
  useEffect(() => {
    if (!user || loadedForUidRef.current !== user.uid) return;
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }

    setUserAlertHistory(user.uid, alertHistory).catch(console.error);
  }, [user, alertHistory]);

  return null;
}
