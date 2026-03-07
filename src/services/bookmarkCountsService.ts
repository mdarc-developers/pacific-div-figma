import { db } from "@/lib/firebase";
import { doc, getDoc, increment, setDoc } from "firebase/firestore";

const SESSION_COUNTS_STORAGE_PREFIX = "session_bookmark_counts_";
const EXHIBITOR_COUNTS_STORAGE_PREFIX = "exhibitor_bookmark_counts_";

// ── localStorage helpers ──────────────────────────────────────────────────────

export function loadSessionCountsFromLS(
  conferenceId: string,
): Record<string, number> {
  try {
    const stored = localStorage.getItem(
      SESSION_COUNTS_STORAGE_PREFIX + conferenceId,
    );
    return stored ? (JSON.parse(stored) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function saveSessionCountsToLS(
  conferenceId: string,
  counts: Record<string, number>,
): void {
  try {
    localStorage.setItem(
      SESSION_COUNTS_STORAGE_PREFIX + conferenceId,
      JSON.stringify(counts),
    );
  } catch {
    // silently ignore storage errors
  }
}

export function loadExhibitorCountsFromLS(
  conferenceId: string,
): Record<string, number> {
  try {
    const stored = localStorage.getItem(
      EXHIBITOR_COUNTS_STORAGE_PREFIX + conferenceId,
    );
    return stored ? (JSON.parse(stored) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function saveExhibitorCountsToLS(
  conferenceId: string,
  counts: Record<string, number>,
): void {
  try {
    localStorage.setItem(
      EXHIBITOR_COUNTS_STORAGE_PREFIX + conferenceId,
      JSON.stringify(counts),
    );
  } catch {
    // silently ignore storage errors
  }
}

// ── Firestore helpers ─────────────────────────────────────────────────────────

/**
 * Reads aggregate bookmark counts for a conference from Firestore.
 * Path: `bookmarkCounts/{conferenceId}`
 */
export async function getBookmarkCounts(conferenceId: string): Promise<{
  sessionCounts: Record<string, number>;
  exhibitorCounts: Record<string, number>;
}> {
  const snap = await getDoc(doc(db, "bookmarkCounts", conferenceId));
  if (!snap.exists()) return { sessionCounts: {}, exhibitorCounts: {} };
  const data = snap.data();
  return {
    sessionCounts: (data?.sessions ?? {}) as Record<string, number>,
    exhibitorCounts: (data?.exhibitors ?? {}) as Record<string, number>,
  };
}

/**
 * Returns a copy of `counts` that includes a zero entry for every id in
 * `knownIds` that does not already have a count.  Existing non-zero values are
 * preserved unchanged.
 */
export function withZeroFallbacks(
  counts: Record<string, number>,
  knownIds: string[],
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const id of knownIds) {
    result[id] = 0;
  }
  return { ...result, ...counts };
}

/**
 * Atomically increments (or decrements) the aggregate bookmark count for a
 * session.  `delta` should be `1` when bookmarking and `-1` when removing.
 */
export async function incrementSessionBookmarkCount(
  conferenceId: string,
  sessionId: string,
  delta: 1 | -1,
): Promise<void> {
  await setDoc(
    doc(db, "bookmarkCounts", conferenceId),
    { sessions: { [sessionId]: increment(delta) } },
    { merge: true },
  );
}

/**
 * Atomically increments (or decrements) the aggregate bookmark count for an
 * exhibitor.  `delta` should be `1` when bookmarking and `-1` when removing.
 */
export async function incrementExhibitorBookmarkCount(
  conferenceId: string,
  exhibitorId: string,
  delta: 1 | -1,
): Promise<void> {
  await setDoc(
    doc(db, "bookmarkCounts", conferenceId),
    { exhibitors: { [exhibitorId]: increment(delta) } },
    { merge: true },
  );
}
