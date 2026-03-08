import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useExhibitorBookmarkContext } from "@/app/contexts/ExhibitorBookmarkContext";
import { useBookmarkCountsContext } from "@/app/contexts/BookmarkCountsContext";
import {
  getUserExhibitorBookmarks,
  setUserExhibitorBookmarks,
} from "@/services/userSettingsService";
import { incrementExhibitorBookmarkCount } from "@/services/bookmarkCountsService";

/**
 * Headless sync component.
 * - On user login (or conference change while logged in): loads saved exhibitor
 *   bookmarks from Firestore and applies them via the shared ExhibitorBookmarkContext.
 * - On bookmark change (after initial load): persists updated bookmarks to Firestore
 *   and updates the aggregate bookmark count for the changed exhibitor.
 * - On logout: clears the loaded state so the next login re-reads Firestore.
 */
export function FirebaseExhibitorBookmarkSync() {
  const { user } = useAuth();
  const { activeConference } = useConference();
  const {
    bookmarkedExhibitors,
    prevBookmarkedExhibitors,
    overrideExhibitorBookmarks,
  } = useExhibitorBookmarkContext();
  const { adjustExhibitorCount } = useBookmarkCountsContext();

  const conferenceId = activeConference.id;
  // Composite key: changes when either the user or the active conference changes.
  const loadKey = user ? `${user.uid}:${conferenceId}` : null;

  // Tracks the composite key for which we have already loaded from Firestore.
  const loadedForKeyRef = useRef<string | null>(null);
  // Prevents writing back to Firestore the value we just read from it.
  const justLoadedRef = useRef(false);
  // Snapshot of bookmarkedExhibitors after the last Firestore save — used to
  // compute the diff so we can increment/decrement the aggregate count precisely.
  const savedItemsRef = useRef<string[]>([]);

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

    // Capture local (logged-out) state before any Firestore override.
    const localBookmarks = [...bookmarkedExhibitors];
    const localPrevBookmarks = [...prevBookmarkedExhibitors];

    getUserExhibitorBookmarks(uidToLoad, conferenceId)
      .then(({ bookmarks, prevBookmarks }) => {
        if (cancelled) return;

        // Items added locally while logged out that are not yet in Firestore.
        const bookmarksSet = new Set(bookmarks);
        const localBookmarksSet = new Set(localBookmarks);
        const addedLocally = localBookmarks.filter(
          (id) => !bookmarksSet.has(id),
        );
        // Items the user intentionally removed while logged out (moved to prev
        // in local state) but that are still active in Firestore.
        const removedLocally = localPrevBookmarks.filter(
          (id) => !localBookmarksSet.has(id) && bookmarksSet.has(id),
        );

        const removedLocallySet = new Set(removedLocally);
        const merged =
          addedLocally.length > 0 || removedLocally.length > 0
            ? [...bookmarks, ...addedLocally].filter(
                (id) => !removedLocallySet.has(id),
              )
            : bookmarks;

        const mergedSet = new Set(merged);
        const mergedPrev = [
          ...new Set([...prevBookmarks, ...localPrevBookmarks]),
        ].filter((id) => !mergedSet.has(id));

        justLoadedRef.current = true;
        overrideExhibitorBookmarks(merged, mergedPrev);

        // If the local state differed from Firestore, persist the merged set
        // and update aggregate bookmark counts for newly added items.
        if (addedLocally.length > 0 || removedLocally.length > 0) {
          setUserExhibitorBookmarks(
            uidToLoad,
            conferenceId,
            merged,
            mergedPrev,
          ).catch(console.error);
          addedLocally.forEach((id) => {
            adjustExhibitorCount(id, 1);
            incrementExhibitorBookmarkCount(conferenceId, id, 1).catch(
              console.error,
            );
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
  }, [user, loadKey, conferenceId, overrideExhibitorBookmarks]);

  // Save bookmarks to Firestore whenever they change (only after the initial load).
  // Also update the aggregate bookmark count for any exhibitors that were added or removed.
  useEffect(() => {
    if (!user || loadedForKeyRef.current !== loadKey) return;
    // Skip the write that mirrors the value we just read from Firestore.
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      savedItemsRef.current = [...bookmarkedExhibitors];
      return;
    }

    // Compute diff against the last saved snapshot to update aggregate counts.
    const prev = savedItemsRef.current;
    const next = bookmarkedExhibitors;
    const added = next.filter((id) => !prev.includes(id));
    const removed = prev.filter((id) => !next.includes(id));

    // Optimistically update local counts so the UI reflects the change immediately.
    added.forEach((id) => adjustExhibitorCount(id, 1));
    removed.forEach((id) => adjustExhibitorCount(id, -1));

    added.forEach((id) =>
      incrementExhibitorBookmarkCount(conferenceId, id, 1).catch(console.error),
    );
    removed.forEach((id) =>
      incrementExhibitorBookmarkCount(conferenceId, id, -1).catch(
        console.error,
      ),
    );

    savedItemsRef.current = [...next];

    setUserExhibitorBookmarks(
      user.uid,
      conferenceId,
      bookmarkedExhibitors,
      prevBookmarkedExhibitors,
    ).catch(console.error);
  }, [
    user,
    loadKey,
    conferenceId,
    bookmarkedExhibitors,
    prevBookmarkedExhibitors,
    adjustExhibitorCount,
  ]);

  return null;
}
