import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConference } from "@/app/contexts/ConferenceContext";
import {
  loadSessionCountsFromLS,
  saveSessionCountsToLS,
  loadExhibitorCountsFromLS,
  saveExhibitorCountsToLS,
} from "@/services/bookmarkCountsService";

interface BookmarkCountsContextType {
  /** Aggregate bookmark counts keyed by session id. */
  sessionCounts: Record<string, number>;
  /** Aggregate bookmark counts keyed by exhibitor id. */
  exhibitorCounts: Record<string, number>;
  /**
   * Replaces the in-memory counts and persists them to localStorage.
   * Called by FirebaseBookmarkCountsSync after loading from Firestore.
   */
  overrideCounts: (
    sessionCounts: Record<string, number>,
    exhibitorCounts: Record<string, number>,
  ) => void;
  /**
   * Optimistically adjusts an exhibitor's local count by `delta` (+1 or -1).
   * Called by FirebaseExhibitorBookmarkSync immediately when a bookmark is toggled
   * so the UI reflects the change before the Firestore write completes.
   */
  adjustExhibitorCount: (exhibitorId: string, delta: 1 | -1) => void;
}

const BookmarkCountsContext = createContext<
  BookmarkCountsContextType | undefined
>(undefined);

export function useBookmarkCountsContext(): BookmarkCountsContextType {
  const ctx = useContext(BookmarkCountsContext);
  if (!ctx) {
    throw new Error(
      "useBookmarkCountsContext must be used within a BookmarkCountsProvider",
    );
  }
  return ctx;
}

export function BookmarkCountsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeConference } = useConference();
  const conferenceId = activeConference.id;

  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>(
    () => loadSessionCountsFromLS(conferenceId),
  );
  const [exhibitorCounts, setExhibitorCounts] = useState<
    Record<string, number>
  >(() => loadExhibitorCountsFromLS(conferenceId));

  // Reload from localStorage whenever the active conference changes.
  useEffect(() => {
    setSessionCounts(loadSessionCountsFromLS(conferenceId));
    setExhibitorCounts(loadExhibitorCountsFromLS(conferenceId));
  }, [conferenceId]);

  const overrideCounts = useCallback(
    (
      newSessionCounts: Record<string, number>,
      newExhibitorCounts: Record<string, number>,
    ) => {
      setSessionCounts(newSessionCounts);
      setExhibitorCounts(newExhibitorCounts);
      saveSessionCountsToLS(conferenceId, newSessionCounts);
      saveExhibitorCountsToLS(conferenceId, newExhibitorCounts);
    },
    [conferenceId],
  );

  const adjustExhibitorCount = useCallback(
    (exhibitorId: string, delta: 1 | -1) => {
      setExhibitorCounts((prev) => {
        const updated = {
          ...prev,
          [exhibitorId]: Math.max(0, (prev[exhibitorId] ?? 0) + delta),
        };
        saveExhibitorCountsToLS(conferenceId, updated);
        return updated;
      });
    },
    [conferenceId],
  );

  return (
    <BookmarkCountsContext.Provider
      value={{ sessionCounts, exhibitorCounts, overrideCounts, adjustExhibitorCount }}
    >
      {children}
    </BookmarkCountsContext.Provider>
  );
}
