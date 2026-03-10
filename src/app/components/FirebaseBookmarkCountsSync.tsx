import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useBookmarkCountsContext } from "@/app/contexts/BookmarkCountsContext";
import {
  getBookmarkCounts,
  withZeroFallbacks,
  loadSessionCountsFromLS,
  loadExhibitorCountsFromLS,
} from "@/services/bookmarkCountsService";
import { SESSION_DATA, EXHIBITOR_DATA } from "@/lib/sessionData";

/**
 * Headless sync component.
 * - On conference or auth change: loads aggregate bookmark counts from Firestore
 *   and applies them via the shared BookmarkCountsContext.
 * - Individual count increments are handled by FirebaseBookmarkSync and
 *   FirebaseExhibitorBookmarkSync when a user-initiated toggle occurs.
 */
export function FirebaseBookmarkCountsSync() {
  const { user } = useAuth();
  const { activeConference } = useConference();
  const { overrideCounts } = useBookmarkCountsContext();

  const conferenceId = activeConference.id;
  // Composite key so we reload whenever either the conference or auth state changes.
  const loadKey = `${conferenceId}:${user?.uid ?? "anon"}`;
  const loadedForKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (loadedForKeyRef.current === loadKey) return;
    const keyToLoad = loadKey;
    const conferenceToLoad = conferenceId;
    let cancelled = false;

    getBookmarkCounts(conferenceToLoad)
      .then(({ sessionCounts, exhibitorCounts }) => {
        if (cancelled) return;
        const sessionIds = (SESSION_DATA[conferenceToLoad] ?? []).map(
          (s) => s.id,
        );
        // EXHIBITOR_DATA entries are [mapUrl, exhibitors] tuples; index 1 is the array.
        const exhibitorIds = (EXHIBITOR_DATA[conferenceToLoad]?.[1] ?? []).map(
          (e) => e.id,
        );
        overrideCounts(
          withZeroFallbacks(sessionCounts, sessionIds),
          withZeroFallbacks(exhibitorCounts, exhibitorIds),
        );
      })
      .catch((err) => {
        console.error(err);
        if (cancelled) return;
        // Firebase rules may block the read. Fall back to localStorage-cached
        // values with zero-fallbacks for every known ID so the UI shows 0
        // (not undefined) while the sync is unavailable.
        const sessionIds = (SESSION_DATA[conferenceToLoad] ?? []).map(
          (s) => s.id,
        );
        const exhibitorIds = (EXHIBITOR_DATA[conferenceToLoad]?.[1] ?? []).map(
          (e) => e.id,
        );
        overrideCounts(
          withZeroFallbacks(
            loadSessionCountsFromLS(conferenceToLoad),
            sessionIds,
          ),
          withZeroFallbacks(
            loadExhibitorCountsFromLS(conferenceToLoad),
            exhibitorIds,
          ),
        );
      })
      .finally(() => {
        if (!cancelled) loadedForKeyRef.current = keyToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [loadKey, conferenceId, overrideCounts]);

  return null;
}
