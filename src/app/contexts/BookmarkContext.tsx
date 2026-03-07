import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConference } from "@/app/contexts/ConferenceContext";

const STORAGE_KEY_PREFIX = "bookmarks_";

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

interface BookmarkContextType {
  bookmarkedItems: string[];
  prevBookmarkedItems: string[];
  toggleBookmark: (itemId: string) => void;
  /** Used by FirebaseBookmarkSync to apply values loaded from Firestore. */
  overrideBookmarks: (items: string[], prevItems: string[]) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined,
);

export function useBookmarkContext(): BookmarkContextType {
  const ctx = useContext(BookmarkContext);
  if (!ctx) {
    throw new Error(
      "useBookmarkContext must be used within a BookmarkProvider",
    );
  }
  return ctx;
}

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const { activeConference } = useConference();
  const conferenceId = activeConference.id;

  const bookmarkKey = STORAGE_KEY_PREFIX + conferenceId;
  const prevBookmarkKey = "prev_" + STORAGE_KEY_PREFIX + conferenceId;

  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>(() =>
    loadFromLS(bookmarkKey),
  );
  const [prevBookmarkedItems, setPrevBookmarkedItems] = useState<string[]>(() =>
    loadFromLS(prevBookmarkKey),
  );

  // Reload from localStorage whenever the active conference changes.
  useEffect(() => {
    setBookmarkedItems(loadFromLS(bookmarkKey));
    setPrevBookmarkedItems(loadFromLS(prevBookmarkKey));
  }, [bookmarkKey, prevBookmarkKey]);

  const toggleBookmark = useCallback(
    (itemId: string) => {
      setBookmarkedItems((prev) => {
        const isCurrentlyBookmarked = prev.includes(itemId);
        const next = isCurrentlyBookmarked
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId];
        saveToLS(bookmarkKey, next);

        if (isCurrentlyBookmarked) {
          setPrevBookmarkedItems((prevPrev) => {
            if (prevPrev.includes(itemId)) return prevPrev;
            const nextPrev = [...prevPrev, itemId];
            saveToLS(prevBookmarkKey, nextPrev);
            return nextPrev;
          });
        } else {
          setPrevBookmarkedItems((prevPrev) => {
            const nextPrev = prevPrev.filter((id) => id !== itemId);
            saveToLS(prevBookmarkKey, nextPrev);
            return nextPrev;
          });
        }

        return next;
      });
    },
    [bookmarkKey, prevBookmarkKey],
  );

  /**
   * Replaces the in-memory bookmark state and persists to localStorage.
   * Called by FirebaseBookmarkSync after loading from Firestore so that
   * the Firestore values win over any stale localStorage data.
   */
  const overrideBookmarks = useCallback(
    (items: string[], prevItems: string[]) => {
      setBookmarkedItems(items);
      setPrevBookmarkedItems(prevItems);
      saveToLS(bookmarkKey, items);
      saveToLS(prevBookmarkKey, prevItems);
    },
    [bookmarkKey, prevBookmarkKey],
  );

  return (
    <BookmarkContext.Provider
      value={{
        bookmarkedItems,
        prevBookmarkedItems,
        toggleBookmark,
        overrideBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}
