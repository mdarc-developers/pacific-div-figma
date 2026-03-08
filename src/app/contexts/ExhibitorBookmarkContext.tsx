import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConference } from "@/app/contexts/ConferenceContext";

const STORAGE_KEY_PREFIX = "exhibitor_bookmarks_";

function loadFromLS(key: string): string[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function saveToLS(key: string, items: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // silently ignore storage errors (e.g. private browsing quota)
  }
}

interface ExhibitorBookmarkContextType {
  bookmarkedExhibitors: string[];
  prevBookmarkedExhibitors: string[];
  toggleExhibitorBookmark: (exhibitorId: string) => void;
  /** Permanently removes an item from the previously-bookmarked list. */
  removePrevExhibitorBookmark: (exhibitorId: string) => void;
  /** Used by FirebaseExhibitorBookmarkSync to apply values loaded from Firestore. */
  overrideExhibitorBookmarks: (items: string[], prevItems: string[]) => void;
}

const ExhibitorBookmarkContext = createContext<
  ExhibitorBookmarkContextType | undefined
>(undefined);

export function useExhibitorBookmarkContext(): ExhibitorBookmarkContextType {
  const ctx = useContext(ExhibitorBookmarkContext);
  if (!ctx) {
    throw new Error(
      "useExhibitorBookmarkContext must be used within an ExhibitorBookmarkProvider",
    );
  }
  return ctx;
}

export function ExhibitorBookmarkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeConference } = useConference();
  const conferenceId = activeConference.id;

  const bookmarkKey = STORAGE_KEY_PREFIX + conferenceId;
  const prevBookmarkKey = "prev_" + STORAGE_KEY_PREFIX + conferenceId;

  const [bookmarkedExhibitors, setBookmarkedExhibitors] = useState<string[]>(
    () => loadFromLS(bookmarkKey),
  );
  const [prevBookmarkedExhibitors, setPrevBookmarkedExhibitors] = useState<
    string[]
  >(() => loadFromLS(prevBookmarkKey));

  // Reload from localStorage whenever the active conference changes.
  useEffect(() => {
    setBookmarkedExhibitors(loadFromLS(bookmarkKey));
    setPrevBookmarkedExhibitors(loadFromLS(prevBookmarkKey));
  }, [bookmarkKey, prevBookmarkKey]);

  const toggleExhibitorBookmark = useCallback(
    (exhibitorId: string) => {
      setBookmarkedExhibitors((prev) => {
        const isCurrentlyBookmarked = prev.includes(exhibitorId);
        const next = isCurrentlyBookmarked
          ? prev.filter((id) => id !== exhibitorId)
          : [...prev, exhibitorId];
        saveToLS(bookmarkKey, next);

        if (isCurrentlyBookmarked) {
          setPrevBookmarkedExhibitors((prevPrev) => {
            if (prevPrev.includes(exhibitorId)) return prevPrev;
            const nextPrev = [...prevPrev, exhibitorId];
            saveToLS(prevBookmarkKey, nextPrev);
            return nextPrev;
          });
        } else {
          setPrevBookmarkedExhibitors((prevPrev) => {
            const nextPrev = prevPrev.filter((id) => id !== exhibitorId);
            saveToLS(prevBookmarkKey, nextPrev);
            return nextPrev;
          });
        }

        return next;
      });
    },
    [bookmarkKey, prevBookmarkKey],
  );

  const removePrevExhibitorBookmark = useCallback(
    (exhibitorId: string) => {
      setPrevBookmarkedExhibitors((prevPrev) => {
        const nextPrev = prevPrev.filter((id) => id !== exhibitorId);
        saveToLS(prevBookmarkKey, nextPrev);
        return nextPrev;
      });
    },
    [prevBookmarkKey],
  );

  /**
   * Replaces the in-memory bookmark state and persists to localStorage.
   * Called by FirebaseExhibitorBookmarkSync after loading from Firestore so that
   * the Firestore values win over any stale localStorage data.
   */
  const overrideExhibitorBookmarks = useCallback(
    (items: string[], prevItems: string[]) => {
      setBookmarkedExhibitors(items);
      setPrevBookmarkedExhibitors(prevItems);
      saveToLS(bookmarkKey, items);
      saveToLS(prevBookmarkKey, prevItems);
    },
    [bookmarkKey, prevBookmarkKey],
  );

  return (
    <ExhibitorBookmarkContext.Provider
      value={{
        bookmarkedExhibitors,
        prevBookmarkedExhibitors,
        toggleExhibitorBookmark,
        removePrevExhibitorBookmark,
        overrideExhibitorBookmarks,
      }}
    >
      {children}
    </ExhibitorBookmarkContext.Provider>
  );
}
