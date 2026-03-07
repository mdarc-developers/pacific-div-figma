import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useBookmarkCountsContext } from "@/app/contexts/BookmarkCountsContext";
import { getBookmarkCounts } from "@/services/bookmarkCountsService";

/**
 * Headless sync component.
 * - On conference change (regardless of auth): loads aggregate bookmark counts
 *   from Firestore and applies them via the shared BookmarkCountsContext.
 * - Individual count increments are handled by FirebaseBookmarkSync and
 *   FirebaseExhibitorBookmarkSync when a user-initiated toggle occurs.
 */
export function FirebaseBookmarkCountsSync() {
  const { user } = useAuth();
  const { activeConference } = useConference();
  const { overrideCounts } = useBookmarkCountsContext();

  const conferenceId = activeConference.id;
  const loadedForConferenceRef = useRef<string | null>(null);

  useEffect(() => {
    // Reload whenever the conference changes (even when not logged in, since
    // aggregate counts are public read data).
    if (loadedForConferenceRef.current === conferenceId) return;
    const conferenceToLoad = conferenceId;
    let cancelled = false;

    getBookmarkCounts(conferenceToLoad)
      .then(({ sessionCounts, exhibitorCounts }) => {
        if (cancelled) return;
        overrideCounts(sessionCounts, exhibitorCounts);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForConferenceRef.current = conferenceToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [conferenceId, overrideCounts]);

  // Reset when user logs out so the next login triggers a fresh load.
  useEffect(() => {
    if (!user) {
      loadedForConferenceRef.current = null;
    }
  }, [user]);

  return null;
}
