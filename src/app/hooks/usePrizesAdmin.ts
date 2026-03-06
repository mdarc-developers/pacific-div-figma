import { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Returns true when the currently authenticated user's UID is listed in the
 * `groups/prize-admin` Firestore document's `members` map.
 *
 * Reads: groups/prize-admin → { members: { [uid]: true } }
 * See FIREBASE_SETUP.md §5a for how to create this document.
 */
export function usePrizesAdmin(): boolean {
  const { user } = useAuth();
  const [isPrizesAdmin, setIsPrizesAdmin] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setIsPrizesAdmin(false);
      return;
    }

    let cancelled = false;
    getDoc(doc(db, "groups", "prize-admin"))
      .then((snap) => {
        if (cancelled) return;
        const members = snap.data()?.members as
          | Record<string, boolean>
          | undefined;
        setIsPrizesAdmin(members?.[user.uid] === true);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("usePrizesAdmin: failed to read groups/prize-admin", err);
          setIsPrizesAdmin(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  return isPrizesAdmin;
}
