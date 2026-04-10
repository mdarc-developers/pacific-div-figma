import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConference } from "@/app/contexts/ConferenceContext";
import {
  loadSessionVoteCountsFromLS,
  saveSessionVoteCountsToLS,
  loadExhibitorVoteCountsFromLS,
  saveExhibitorVoteCountsToLS,
} from "@/services/voteCountsService";

interface VoteCountsContextType {
  /** Aggregate vote counts keyed by session id. */
  sessionVoteCounts: Record<string, number>;
  /** Aggregate vote counts keyed by exhibitor id. */
  exhibitorVoteCounts: Record<string, number>;
  /**
   * Replaces the in-memory counts and persists them to localStorage.
   * Called by FirebaseVoteCountsSync after loading from Firestore.
   */
  overrideVoteCounts: (
    sessionCounts: Record<string, number>,
    exhibitorCounts: Record<string, number>,
  ) => void;
  /**
   * Optimistically adjusts a session's local vote count by `delta` (+1 or -1).
   * Called by FirebaseSessionVoteSync immediately when a vote is toggled
   * so the UI reflects the change before the Firestore write completes.
   */
  adjustSessionVoteCount: (sessionId: string, delta: 1 | -1) => void;
  /**
   * Optimistically adjusts an exhibitor's local vote count by `delta` (+1 or -1).
   * Called by FirebaseExhibitorVoteSync immediately when a vote is toggled
   * so the UI reflects the change before the Firestore write completes.
   */
  adjustExhibitorVoteCount: (exhibitorId: string, delta: 1 | -1) => void;
}

const VoteCountsContext = createContext<VoteCountsContextType | undefined>(
  undefined,
);

export function useVoteCountsContext(): VoteCountsContextType {
  const ctx = useContext(VoteCountsContext);
  if (!ctx) {
    throw new Error(
      "useVoteCountsContext must be used within a VoteCountsProvider",
    );
  }
  return ctx;
}

export function VoteCountsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeConference } = useConference();
  const conferenceId = activeConference.id;

  const [sessionVoteCounts, setSessionVoteCounts] = useState<
    Record<string, number>
  >(() => loadSessionVoteCountsFromLS(conferenceId));
  const [exhibitorVoteCounts, setExhibitorVoteCounts] = useState<
    Record<string, number>
  >(() => loadExhibitorVoteCountsFromLS(conferenceId));

  // Reload from localStorage whenever the active conference changes.
  useEffect(() => {
    setSessionVoteCounts(loadSessionVoteCountsFromLS(conferenceId));
    setExhibitorVoteCounts(loadExhibitorVoteCountsFromLS(conferenceId));
  }, [conferenceId]);

  const overrideVoteCounts = useCallback(
    (
      newSessionCounts: Record<string, number>,
      newExhibitorCounts: Record<string, number>,
    ) => {
      setSessionVoteCounts(newSessionCounts);
      setExhibitorVoteCounts(newExhibitorCounts);
      saveSessionVoteCountsToLS(conferenceId, newSessionCounts);
      saveExhibitorVoteCountsToLS(conferenceId, newExhibitorCounts);
    },
    [conferenceId],
  );

  const adjustSessionVoteCount = useCallback(
    (sessionId: string, delta: 1 | -1) => {
      setSessionVoteCounts((prev) => {
        const updated = {
          ...prev,
          [sessionId]: Math.max(0, (prev[sessionId] ?? 0) + delta),
        };
        saveSessionVoteCountsToLS(conferenceId, updated);
        return updated;
      });
    },
    [conferenceId],
  );

  const adjustExhibitorVoteCount = useCallback(
    (exhibitorId: string, delta: 1 | -1) => {
      setExhibitorVoteCounts((prev) => {
        const updated = {
          ...prev,
          [exhibitorId]: Math.max(0, (prev[exhibitorId] ?? 0) + delta),
        };
        saveExhibitorVoteCountsToLS(conferenceId, updated);
        return updated;
      });
    },
    [conferenceId],
  );

  return (
    <VoteCountsContext.Provider
      value={{
        sessionVoteCounts,
        exhibitorVoteCounts,
        overrideVoteCounts,
        adjustSessionVoteCount,
        adjustExhibitorVoteCount,
      }}
    >
      {children}
    </VoteCountsContext.Provider>
  );
}
