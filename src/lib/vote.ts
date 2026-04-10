import { toast } from "sonner";

/** Maximum number of votes a user may hold at one time per category. */
export const MAX_VOTES = 1;

/**
 * Toggles a vote for the given id, respecting the per-profile vote limit.
 *
 * - If the id is already in the list: removes it (unvote).
 * - If the id is not in the list and the limit has not been reached: adds it.
 * - If the id is not in the list and the limit is already reached: returns the
 *   unchanged array and shows an informational toast message.
 *
 * @param prev      Current list of voted item IDs.
 * @param id        ID of the item being toggled.
 * @param itemLabel Human-readable category label used in the toast message
 *                  (e.g. "session", "exhibitor").
 * @returns The updated list of voted item IDs.
 */
export function castVote(
  prev: string[],
  id: string,
  itemLabel = "item",
): string[] {
  if (prev.includes(id)) {
    // Unvote: remove the existing vote.
    return prev.filter((v) => v !== id);
  }
  if (prev.length >= MAX_VOTES) {
    toast.info(
      `You can only vote for one ${itemLabel}. Remove your current vote first to change it.`,
    );
    return prev;
  }
  return [...prev, id];
}
