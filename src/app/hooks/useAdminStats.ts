import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer, doc, getDoc } from "firebase/firestore";

export interface AdminStats {
  userProfileCount: number | null;
  signupCount: number | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches aggregate admin statistics from Firestore.
 * Returns:
 *   - userProfileCount: live count of documents in the `users` collection
 *   - signupCount: cumulative counter maintained by the `incrementSignupCounter`
 *     Cloud Function (stored at `stats/signupCounter`)
 */
export function useAdminStats(): AdminStats {
  const [userProfileCount, setUserProfileCount] = useState<number | null>(null);
  const [signupCount, setSignupCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getCountFromServer(collection(db, "users")),
      getDoc(doc(db, "stats", "signupCounter")),
    ])
      .then(([usersSnapshot, counterSnapshot]) => {
        if (!cancelled) {
          setUserProfileCount(usersSnapshot.data().count);
          const data = counterSnapshot.data();
          setSignupCount(
            counterSnapshot.exists() && typeof data?.count === "number"
              ? data.count
              : null,
          );
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load stats");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { userProfileCount, signupCount, loading, error };
}
