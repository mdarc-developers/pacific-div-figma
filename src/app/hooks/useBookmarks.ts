import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY_PREFIX = "bookmarks_";

function loadBookmarks(conferenceId: string, keyPrefix: string = STORAGE_KEY_PREFIX): string[] {
  try {
    const stored = localStorage.getItem(keyPrefix + conferenceId);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(conferenceId: string, bookmarks: string[], keyPrefix: string = STORAGE_KEY_PREFIX): void {
  try {
    localStorage.setItem(
      keyPrefix + conferenceId,
      JSON.stringify(bookmarks),
    );
  } catch {
    // silently ignore storage errors (e.g. private browsing quota)
  }
}

export function useBookmarks(
  conferenceId: string,
  keyPrefix: string = STORAGE_KEY_PREFIX,
): [string[], (itemId: string) => void] {
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>(() =>
    loadBookmarks(conferenceId, keyPrefix),
  );

  // Reload bookmarks whenever the active conference or key prefix changes
  useEffect(() => {
    setBookmarkedItems(loadBookmarks(conferenceId, keyPrefix));
  }, [conferenceId, keyPrefix]);

  const toggleBookmark = useCallback(
    (itemId: string) => {
      setBookmarkedItems((prev) => {
        const next = prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId];
        saveBookmarks(conferenceId, next, keyPrefix);
        return next;
      });
    },
    [conferenceId, keyPrefix],
  );

  return [bookmarkedItems, toggleBookmark];
}
