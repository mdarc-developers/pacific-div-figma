import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useVoteCountsContext } from "@/app/contexts/VoteCountsContext";
import {
  getVoteCounts,
  loadSessionVoteCountsFromLS,
  loadExhibitorVoteCountsFromLS,
} from "@/services/voteCountsService";

/**
 * Headless sync component.
 * - On conference or auth change: loads aggregate vote counts from Firestore
 *   and applies them via the shared VoteCountsContext.
 * - Individual count increments are handled by FirebaseVoteSync and
 *   FirebaseExhibitorVoteSync when a user-initiated toggle occurs.
 */
export function FirebaseVoteCountsSync() {
  const { user } = useAuth();
  const { activeConference } = useConference();
  const { overrideVoteCounts } = useVoteCountsContext();

  const conferenceId = activeConference.id;
  // Composite key so we reload whenever either the conference or auth state changes.
  const loadKey = `${conferenceId}:${user?.uid ?? "anon"}`;
  const loadedForKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (loadedForKeyRef.current === loadKey) return;
    const keyToLoad = loadKey;
    const conferenceToLoad = conferenceId;
    let cancelled = false;

    getVoteCounts(conferenceToLoad)
      .then(({ sessionCounts, exhibitorCounts }) => {
        if (cancelled) return;
        overrideVoteCounts(sessionCounts, exhibitorCounts);
      })
      .catch((err) => {
        console.error(err);
        if (cancelled) return;
        // Firebase rules may block the read. Fall back to localStorage-cached
        // values so the UI shows the last known counts.
        overrideVoteCounts(
          loadSessionVoteCountsFromLS(conferenceToLoad),
          loadExhibitorVoteCountsFromLS(conferenceToLoad),
        );
      })
      .finally(() => {
        if (!cancelled) loadedForKeyRef.current = keyToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [loadKey, conferenceId, overrideVoteCounts]);

  return null;
}
