import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { type PrizeWinner } from "@/types/conference";

/**
 * Saves (creates or updates) a prize winner document in the `prizeWinners`
 * Firestore collection.
 *
 * Requires the authenticated user to be in the `prize-admin` group or to be
 * an mdarc-developer (enforced by Firestore security rules).
 *
 * The Cloud Function `notifyPrizeWinner` fires on document creation and sends
 * SMS/email notifications to attendees whose ticket numbers match.
 */
export async function savePrizeWinnerToFirestore(
  winner: PrizeWinner,
): Promise<void> {
  const ref = doc(db, "prizeWinners", winner.id);
  await setDoc(ref, winner, { merge: true });
}

/**
 * Deletes a prize winner document from the `prizeWinners` Firestore collection.
 *
 * Requires the authenticated user to be in the `prize-admin` group or to be
 * an mdarc-developer (enforced by Firestore security rules).
 */
export async function deletePrizeWinnerFromFirestore(
  winnerId: string,
): Promise<void> {
  await deleteDoc(doc(db, "prizeWinners", winnerId));
}
