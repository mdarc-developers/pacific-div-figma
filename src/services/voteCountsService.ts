import { db } from "@/lib/firebase";
import { doc, getDoc, increment, setDoc } from "firebase/firestore";

const SESSION_VOTE_COUNTS_STORAGE_PREFIX = "session_vote_counts_";
const EXHIBITOR_VOTE_COUNTS_STORAGE_PREFIX = "exhibitor_vote_counts_";

// ── localStorage helpers ──────────────────────────────────────────────────────

export function loadSessionVoteCountsFromLS(
  conferenceId: string,
): Record<string, number> {
  try {
    const stored = localStorage.getItem(
      SESSION_VOTE_COUNTS_STORAGE_PREFIX + conferenceId,
    );
    return stored ? (JSON.parse(stored) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function saveSessionVoteCountsToLS(
  conferenceId: string,
  counts: Record<string, number>,
): void {
  try {
    localStorage.setItem(
      SESSION_VOTE_COUNTS_STORAGE_PREFIX + conferenceId,
      JSON.stringify(counts),
    );
  } catch {
    // silently ignore storage errors
  }
}

export function loadExhibitorVoteCountsFromLS(
  conferenceId: string,
): Record<string, number> {
  try {
    const stored = localStorage.getItem(
      EXHIBITOR_VOTE_COUNTS_STORAGE_PREFIX + conferenceId,
    );
    return stored ? (JSON.parse(stored) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function saveExhibitorVoteCountsToLS(
  conferenceId: string,
  counts: Record<string, number>,
): void {
  try {
    localStorage.setItem(
      EXHIBITOR_VOTE_COUNTS_STORAGE_PREFIX + conferenceId,
      JSON.stringify(counts),
    );
  } catch {
    // silently ignore storage errors
  }
}

// ── Firestore helpers ─────────────────────────────────────────────────────────

/**
 * Reads aggregate vote counts for a conference from Firestore.
 * Path: `voteCounts/{conferenceId}`
 */
export async function getVoteCounts(conferenceId: string): Promise<{
  sessionCounts: Record<string, number>;
  exhibitorCounts: Record<string, number>;
}> {
  const snap = await getDoc(doc(db, "voteCounts", conferenceId));
  if (!snap.exists()) return { sessionCounts: {}, exhibitorCounts: {} };
  const data = snap.data();
  return {
    sessionCounts: (data?.sessions ?? {}) as Record<string, number>,
    exhibitorCounts: (data?.exhibitors ?? {}) as Record<string, number>,
  };
}

/**
 * Atomically increments (or decrements) the aggregate vote count for a
 * session.  `delta` should be `1` when voting and `-1` when removing a vote.
 */
export async function incrementSessionVoteCount(
  conferenceId: string,
  sessionId: string,
  delta: 1 | -1,
): Promise<void> {
  await setDoc(
    doc(db, "voteCounts", conferenceId),
    { sessions: { [sessionId]: increment(delta) } },
    { merge: true },
  );
}

/**
 * Atomically increments (or decrements) the aggregate vote count for an
 * exhibitor.  `delta` should be `1` when voting and `-1` when removing a vote.
 */
export async function incrementExhibitorVoteCount(
  conferenceId: string,
  exhibitorId: string,
  delta: 1 | -1,
): Promise<void> {
  await setDoc(
    doc(db, "voteCounts", conferenceId),
    { exhibitors: { [exhibitorId]: increment(delta) } },
    { merge: true },
  );
}
