import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";

export interface AdminStats {
  userProfileCount: number | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches aggregate admin statistics from Firestore.
 * Currently returns the number of documents in the `users` collection,
 * which represents the number of users who have created a Firebase profile.
 */
export function useAdminStats(): AdminStats {
  const [userProfileCount, setUserProfileCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getCountFromServer(collection(db, "users"))
      .then((snapshot) => {
        if (!cancelled) {
          setUserProfileCount(snapshot.data().count);
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

  return { userProfileCount, loading, error };
}
