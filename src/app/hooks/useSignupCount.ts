import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Fetches the cumulative signup counter from `stats/signupCounter`.
 * This document is publicly readable and is maintained by the
 * `incrementSignupCounter` Cloud Function.
 *
 * Returns null while loading or if the read fails.
 */
export function useSignupCount(): number | null {
  const [signupCount, setSignupCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDoc(doc(db, "stats", "signupCounter"))
      .then((snap) => {
        if (cancelled) return;
        const data = snap.data();
        if (snap.exists() && typeof data?.count === "number") {
          setSignupCount(data.count);
        }
      })
      .catch(() => {
        // Silently ignore errors — count badge is optional
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return signupCount;
}
