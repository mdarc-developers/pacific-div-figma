import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useBookmarkContext } from "@/app/contexts/BookmarkContext";
import {
  getUserBookmarks,
  setUserBookmarks,
} from "@/services/userSettingsService";

/**
 * Headless sync component.
 * - On user login (or conference change while logged in): loads saved bookmarks
 *   from Firestore and applies them via the shared BookmarkContext.
 * - On bookmark change (after initial load): persists updated bookmarks to Firestore.
 * - On logout: clears the loaded state so the next login re-reads Firestore.
 */
export function FirebaseBookmarkSync() {
  const { user } = useAuth();
  const { activeConference } = useConference();
  const { bookmarkedItems, prevBookmarkedItems, overrideBookmarks } =
    useBookmarkContext();

  const conferenceId = activeConference.id;
  // Composite key: changes when either the user or the active conference changes.
  const loadKey = user ? `${user.uid}:${conferenceId}` : null;

  // Tracks the composite key for which we have already loaded from Firestore.
  const loadedForKeyRef = useRef<string | null>(null);
  // Prevents writing back to Firestore the value we just read from it.
  const justLoadedRef = useRef(false);

  // Load bookmarks from Firestore whenever a new user logs in or the active
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

    getUserBookmarks(uidToLoad, conferenceId)
      .then(({ bookmarks, prevBookmarks }) => {
        if (cancelled) return;
        justLoadedRef.current = true;
        overrideBookmarks(bookmarks, prevBookmarks);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForKeyRef.current = keyToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [user, loadKey, conferenceId, overrideBookmarks]);

  // Save bookmarks to Firestore whenever they change (only after the initial load).
  useEffect(() => {
    if (!user || loadedForKeyRef.current !== loadKey) return;
    // Skip the write that mirrors the value we just read from Firestore.
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }
    setUserBookmarks(
      user.uid,
      conferenceId,
      bookmarkedItems,
      prevBookmarkedItems,
    ).catch(console.error);
  }, [user, loadKey, conferenceId, bookmarkedItems, prevBookmarkedItems]);

  return null;
}
