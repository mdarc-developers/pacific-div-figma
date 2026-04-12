/**
 * Server-side vote validation utilities.
 *
 * Pure functions with no Firebase dependencies so they can be unit-tested
 * without mocking the admin SDK.  The `castVote` Cloud Function in index.ts
 * uses these helpers to enforce the same MAX_VOTES limit that the client-side
 * castVote (src/lib/vote.ts) enforces locally.
 *
 * Compiled output lands in functions/lib/voteValidation.js.
 */

/** Maximum number of votes a user may hold at one time per category per conference. */
export const MAX_VOTES = 1;

/**
 * Sanitizes an untrusted value into a string array capped at `MAX_VOTES`.
 *
 * - Non-array values are treated as empty.
 * - Non-string elements are filtered out.
 * - Arrays longer than MAX_VOTES are truncated to the first MAX_VOTES items.
 *
 * Used to normalise data read from Firestore before validation.
 */
export function sanitizeVotes(
  votes: unknown,
  maxVotes: number = MAX_VOTES,
): string[] {
  if (!Array.isArray(votes)) return [];
  return votes
    .filter((v): v is string => typeof v === "string")
    .slice(0, maxVotes);
}

/**
 * Validates an add-vote operation.
 *
 * @param currentVotes Sanitized list of votes the user currently holds.
 * @param itemId       ID of the item the user wants to vote for.
 * @param maxVotes     Vote limit (defaults to MAX_VOTES).
 * @returns `null` when the vote is valid, or an error-reason string when not:
 *   - `"already-voted"` — the user has already voted for this item.
 *   - `"vote-limit-reached"` — the user is already at the vote limit.
 */
export function validateAddVote(
  currentVotes: string[],
  itemId: string,
  maxVotes: number = MAX_VOTES,
): string | null {
  if (currentVotes.includes(itemId)) return "already-voted";
  if (currentVotes.length >= maxVotes) return "vote-limit-reached";
  return null;
}

/**
 * Validates a remove-vote operation.
 *
 * @param currentVotes Sanitized list of votes the user currently holds.
 * @param itemId       ID of the item the user wants to remove their vote from.
 * @returns `null` when the removal is valid, or `"not-voted"` when the user
 *   has not voted for that item.
 */
export function validateRemoveVote(
  currentVotes: string[],
  itemId: string,
): string | null {
  if (!currentVotes.includes(itemId)) return "not-voted";
  return null;
}
