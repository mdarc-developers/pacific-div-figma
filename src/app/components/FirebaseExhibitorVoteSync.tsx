import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useExhibitorVoteContext } from "@/app/contexts/ExhibitorVoteContext";
import { useVoteCountsContext } from "@/app/contexts/VoteCountsContext";
import { getUserExhibitorVotes } from "@/services/userSettingsService";
import { castVoteServer } from "@/services/voteService";
import { MAX_VOTES } from "@/lib/vote";

/**
 * Headless sync component.
 * - On user login (or conference change while logged in): loads saved exhibitor
 *   votes from Firestore and applies them via the shared ExhibitorVoteContext.
 * - On vote change (after initial load): persists updated votes to Firestore
 *   and updates the aggregate vote count for the changed exhibitor.
 * - On logout: clears the loaded state so the next login re-reads Firestore.
 */
export function FirebaseExhibitorVoteSync() {
  const { user } = useAuth();
  const { activeConference } = useConference();
  const { votedExhibitors, overrideExhibitorVotes } = useExhibitorVoteContext();
  const { adjustExhibitorVoteCount } = useVoteCountsContext();

  const conferenceId = activeConference.id;
  // Composite key: changes when either the user or the active conference changes.
  const loadKey = user ? `${user.uid}:${conferenceId}` : null;

  // Tracks the composite key for which we have already loaded from Firestore.
  const loadedForKeyRef = useRef<string | null>(null);
  // Prevents writing back to Firestore the value we just read from it.
  const justLoadedRef = useRef(false);
  // Snapshot of votedExhibitors after the last Firestore save — used to
  // compute the diff so we can increment/decrement the aggregate count precisely.
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
    const localVotes = [...votedExhibitors];

    getUserExhibitorVotes(uidToLoad, conferenceId)
      .then((votes) => {
        if (cancelled) return;

        // Preserve any locally-cast votes not yet in Firestore, respecting
        // MAX_VOTES so the merged result never exceeds the server-side limit.
        const votesSet = new Set(votes);
        const addedLocally = localVotes.filter((id) => !votesSet.has(id));
        const availableSlots = MAX_VOTES - votes.length;
        const toAdd = availableSlots > 0 ? addedLocally.slice(0, availableSlots) : [];
        const merged = toAdd.length > 0 ? [...votes, ...toAdd] : votes;

        justLoadedRef.current = true;
        savedItemsRef.current = merged;
        overrideExhibitorVotes(merged);

        // If there were locally-cast votes that fit within MAX_VOTES, push
        // them to the server via the castVote callable (which atomically
        // updates both the user doc and aggregate counts).
        if (toAdd.length > 0) {
          toAdd.forEach((id) => {
            adjustExhibitorVoteCount(id, 1);
            castVoteServer({
              conferenceId,
              voteType: "exhibitor",
              itemId: id,
              action: "add",
            }).catch(console.error);
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
  }, [user, loadKey, conferenceId, overrideExhibitorVotes]);

  // Save votes to Firestore whenever they change (only after the initial load).
  // Also update the aggregate vote count for any exhibitors that were added or removed.
  useEffect(() => {
    if (!user || loadedForKeyRef.current !== loadKey) return;
    // Skip the write that mirrors the value we just read from Firestore.
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      savedItemsRef.current = [...votedExhibitors];
      return;
    }

    // Compute diff against the last saved snapshot to update aggregate counts.
    const prev = savedItemsRef.current;
    const next = votedExhibitors;
    const added = next.filter((id) => !prev.includes(id));
    const removed = prev.filter((id) => !next.includes(id));

    // Optimistically update local counts so the UI reflects the change immediately.
    added.forEach((id) => adjustExhibitorVoteCount(id, 1));
    removed.forEach((id) => adjustExhibitorVoteCount(id, -1));

    // Persist via the castVote callable, which atomically validates, updates
    // the user doc, and updates the aggregate vote count server-side.
    added.forEach((id) =>
      castVoteServer({
        conferenceId,
        voteType: "exhibitor",
        itemId: id,
        action: "add",
      }).catch(console.error),
    );
    removed.forEach((id) =>
      castVoteServer({
        conferenceId,
        voteType: "exhibitor",
        itemId: id,
        action: "remove",
      }).catch(console.error),
    );

    savedItemsRef.current = [...next];
  }, [user, loadKey, conferenceId, votedExhibitors, adjustExhibitorVoteCount]);

  return null;
}
