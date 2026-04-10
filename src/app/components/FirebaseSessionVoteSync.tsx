import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useSessionVoteContext } from "@/app/contexts/SessionVoteContext";
import { useVoteCountsContext } from "@/app/contexts/VoteCountsContext";
import {
  getUserSessionVotes,
  setUserSessionVotes,
} from "@/services/userSettingsService";
import { incrementSessionVoteCount } from "@/services/voteCountsService";

/**
 * Headless sync component.
 * - On user login (or conference change while logged in): loads saved session
 *   votes from Firestore and applies them via the shared SessionVoteContext.
 * - On vote change (after initial load): persists updated votes to Firestore
 *   and updates the aggregate vote count for the changed session.
 * - On logout: clears the loaded state so the next login re-reads Firestore.
 */
export function FirebaseSessionVoteSync() {
  const { user } = useAuth();
  const { activeConference } = useConference();
  const { votedSessions, overrideSessionVotes } = useSessionVoteContext();
  const { adjustSessionVoteCount } = useVoteCountsContext();

  const conferenceId = activeConference.id;
  // Composite key: changes when either the user or the active conference changes.
  const loadKey = user ? `${user.uid}:${conferenceId}` : null;

  // Tracks the composite key for which we have already loaded from Firestore.
  const loadedForKeyRef = useRef<string | null>(null);
  // Prevents writing back to Firestore the value we just read from it.
  const justLoadedRef = useRef(false);
  // Snapshot of votedSessions after the last Firestore save — used to compute
  // the diff so we can increment/decrement the aggregate count precisely.
  const savedItemsRef = useRef<string[]>([]);

  // Load votes from Firestore whenever a new user logs in or the active
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

    // Capture local (logged-out) votes before any Firestore override.
    const localVotes = [...votedSessions];

    getUserSessionVotes(uidToLoad, conferenceId)
      .then((votes) => {
        if (cancelled) return;

        // Preserve any locally-cast votes not yet in Firestore.
        const votesSet = new Set(votes);
        const addedLocally = localVotes.filter((id) => !votesSet.has(id));
        const merged =
          addedLocally.length > 0 ? [...votes, ...addedLocally] : votes;

        justLoadedRef.current = true;
        savedItemsRef.current = merged;
        overrideSessionVotes(merged);

        // If there were locally-cast votes, persist the merged set to Firestore
        // and update aggregate vote counts for the newly added items.
        if (addedLocally.length > 0) {
          setUserSessionVotes(uidToLoad, conferenceId, merged).catch(
            console.error,
          );
          addedLocally.forEach((id) => {
            adjustSessionVoteCount(id, 1);
            incrementSessionVoteCount(conferenceId, id, 1).catch(console.error);
          });
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForKeyRef.current = keyToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [user, loadKey, conferenceId, overrideSessionVotes]);

  // Save votes to Firestore whenever they change (only after the initial load).
  // Also update the aggregate vote count for any sessions that were added or removed.
  useEffect(() => {
    if (!user || loadedForKeyRef.current !== loadKey) return;
    // Skip the write that mirrors the value we just read from Firestore.
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      savedItemsRef.current = [...votedSessions];
      return;
    }

    // Compute diff against the last saved snapshot to update aggregate counts.
    const prev = savedItemsRef.current;
    const next = votedSessions;
    const added = next.filter((id) => !prev.includes(id));
    const removed = prev.filter((id) => !next.includes(id));

    // Optimistically update local counts so the UI reflects the change immediately.
    added.forEach((id) => adjustSessionVoteCount(id, 1));
    removed.forEach((id) => adjustSessionVoteCount(id, -1));

    added.forEach((id) =>
      incrementSessionVoteCount(conferenceId, id, 1).catch(console.error),
    );
    removed.forEach((id) =>
      incrementSessionVoteCount(conferenceId, id, -1).catch(console.error),
    );

    savedItemsRef.current = [...next];

    setUserSessionVotes(user.uid, conferenceId, votedSessions).catch(
      console.error,
    );
  }, [user, loadKey, conferenceId, votedSessions, adjustSessionVoteCount]);

  return null;
}
