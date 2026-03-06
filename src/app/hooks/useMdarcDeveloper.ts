import { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Returns true when the currently authenticated user's UID is listed in the
 * `groups/mdarc-developers` Firestore document's `members` map.
 *
 * Reads: groups/mdarc-developers → { members: { [uid]: true } }
 * See FIREBASE_SETUP.md §5a for how to create this document.
 */
export function useMdarcDeveloper(): boolean {
  const { user } = useAuth();
  const [isMdarcDeveloper, setIsMdarcDeveloper] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setIsMdarcDeveloper(false);
      return;
    }

    let cancelled = false;
    getDoc(doc(db, "groups", "mdarc-developers"))
      .then((snap) => {
        if (cancelled) return;
        const members = snap.data()?.members as
          | Record<string, boolean>
          | undefined;
        setIsMdarcDeveloper(members?.[user.uid] === true);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("useMdarcDeveloper: failed to read groups/mdarc-developers", err);
          setIsMdarcDeveloper(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  return isMdarcDeveloper;
}
