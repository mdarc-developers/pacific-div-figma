import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY_PREFIX = "bookmarks_";

function loadBookmarks(
  conferenceId: string,
  keyPrefix: string = STORAGE_KEY_PREFIX,
): string[] {
  try {
    const stored = localStorage.getItem(keyPrefix + conferenceId);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(
  conferenceId: string,
  bookmarks: string[],
  keyPrefix: string = STORAGE_KEY_PREFIX,
): void {
  try {
    localStorage.setItem(keyPrefix + conferenceId, JSON.stringify(bookmarks));
  } catch {
    // silently ignore storage errors (e.g. private browsing quota)
  }
}

export function useBookmarks(
  conferenceId: string,
  keyPrefix: string = STORAGE_KEY_PREFIX,
): [string[], (itemId: string) => void, string[]] {
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>(() =>
    loadBookmarks(conferenceId, keyPrefix),
  );
  const prevKeyPrefix = "prev_" + keyPrefix;
  const [prevBookmarkedItems, setPrevBookmarkedItems] = useState<string[]>(() =>
    loadBookmarks(conferenceId, prevKeyPrefix),
  );

  // Reload bookmarks whenever the active conference or key prefix changes
  useEffect(() => {
    setBookmarkedItems(loadBookmarks(conferenceId, keyPrefix));
    setPrevBookmarkedItems(loadBookmarks(conferenceId, prevKeyPrefix));
  }, [conferenceId, keyPrefix, prevKeyPrefix]);

  const toggleBookmark = useCallback(
    (itemId: string) => {
      setBookmarkedItems((prev) => {
        const isCurrentlyBookmarked = prev.includes(itemId);
        const next = isCurrentlyBookmarked
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId];
        saveBookmarks(conferenceId, next, keyPrefix);

        // When unbookmarking, add to previously-bookmarked list
        if (isCurrentlyBookmarked) {
          setPrevBookmarkedItems((prevPrev) => {
            if (prevPrev.includes(itemId)) return prevPrev;
            const nextPrev = [...prevPrev, itemId];
            saveBookmarks(conferenceId, nextPrev, prevKeyPrefix);
            return nextPrev;
          });
        } else {
          // When re-bookmarking, remove from previously-bookmarked list
          setPrevBookmarkedItems((prevPrev) => {
            const nextPrev = prevPrev.filter((id) => id !== itemId);
            saveBookmarks(conferenceId, nextPrev, prevKeyPrefix);
            return nextPrev;
          });
        }

        return next;
      });
    },
    [conferenceId, keyPrefix, prevKeyPrefix],
  );

  return [bookmarkedItems, toggleBookmark, prevBookmarkedItems];
}
