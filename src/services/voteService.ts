import { getFunctions, httpsCallable } from "firebase/functions";
import app from "@/lib/firebase";

export interface CastVoteInput {
  conferenceId: string;
  voteType: "session" | "exhibitor";
  itemId: string;
  action: "add" | "remove";
}

export interface CastVoteOutput {
  votes: string[];
}

const _functions = getFunctions(app);
const _castVoteCallable = httpsCallable<CastVoteInput, CastVoteOutput>(
  _functions,
  "castVote",
);

/**
 * Calls the server-side `castVote` Cloud Function which atomically:
 *  - Validates the vote (auth, profile exists, MAX_VOTES limit, no duplicates).
 *  - Updates the user's vote list in `users/{uid}`.
 *  - Updates the aggregate vote count in `voteCounts/{conferenceId}`.
 *
 * Throws a `FirebaseError` (from `firebase/functions`) if the server rejects
 * the vote (e.g. already-exists, resource-exhausted, unauthenticated).
 *
 * @returns The updated votes array for the conference after the operation.
 */
export async function castVoteServer(
  input: CastVoteInput,
): Promise<string[]> {
  const result = await _castVoteCallable(input);
  return result.data.votes;
}
