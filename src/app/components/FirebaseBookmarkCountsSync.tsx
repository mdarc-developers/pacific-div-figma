import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useBookmarkCountsContext } from "@/app/contexts/BookmarkCountsContext";
import { getBookmarkCounts } from "@/services/bookmarkCountsService";

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
        overrideCounts(sessionCounts, exhibitorCounts);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForKeyRef.current = keyToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [loadKey, conferenceId, overrideCounts]);

  return null;
}
