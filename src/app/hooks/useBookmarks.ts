import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY_PREFIX = 'bookmarks_';

function loadBookmarks(conferenceId: string): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + conferenceId);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(conferenceId: string, bookmarks: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + conferenceId, JSON.stringify(bookmarks));
  } catch {
    // silently ignore storage errors (e.g. private browsing quota)
  }
}

export function useBookmarks(conferenceId: string): [string[], (sessionId: string) => void] {
  const [bookmarkedSessions, setBookmarkedSessions] = useState<string[]>(() =>
    loadBookmarks(conferenceId)
  );

  // Reload bookmarks whenever the active conference changes
  useEffect(() => {
    setBookmarkedSessions(loadBookmarks(conferenceId));
  }, [conferenceId]);

  const toggleBookmark = useCallback(
    (sessionId: string) => {
      setBookmarkedSessions(prev => {
        const next = prev.includes(sessionId)
          ? prev.filter(id => id !== sessionId)
          : [...prev, sessionId];
        saveBookmarks(conferenceId, next);
        return next;
      });
    },
    [conferenceId]
  );

  return [bookmarkedSessions, toggleBookmark];
}
