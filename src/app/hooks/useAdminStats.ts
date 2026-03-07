import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getCountFromServer,
  doc,
  getDoc,
} from "firebase/firestore";

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
 *
 * Requires the requesting user to be listed in the `groups/mdarc-developers`
 * Firestore document (members map) and for the `stats` collection to be
 * readable by mdarc-developers.  See FIREBASE_SETUP.md §5 for the required
 * Firestore security rules and the `groups/mdarc-developers` setup.
 *
 * Uses Promise.allSettled so a failure in one query does not prevent the
 * other from succeeding.  If only the signupCounter read fails, signupCount
 * is silently left as null.  If the users count query fails, `error` is set.
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

    Promise.allSettled([
      getCountFromServer(collection(db, "users")),
      getDoc(doc(db, "stats", "signupCounter")),
    ]).then(([usersResult, counterResult]) => {
      if (cancelled) return;

      if (usersResult.status === "fulfilled") {
        setUserProfileCount(usersResult.value.data().count);
      } else {
        const err = usersResult.reason;
        setError(err instanceof Error ? err.message : "Failed to load stats");
      }

      if (counterResult.status === "fulfilled") {
        const data = counterResult.value.data();
        setSignupCount(
          counterResult.value.exists() && typeof data?.count === "number"
            ? data.count
            : null,
        );
      }
      // If counterResult failed, signupCount stays null — this is acceptable
      // since signupCount is a secondary metric.

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { userProfileCount, signupCount, loading, error };
}
