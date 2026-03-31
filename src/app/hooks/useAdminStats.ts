import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getCountFromServer,
  doc,
  getDoc,
  FirestoreError,
} from "firebase/firestore";

export interface AdminStats {
  userProfileCount: number | null;
  signupCount: number | null;
  loading: boolean;
  error: string | null;
  /** True when the error is specifically a permission or authentication failure. */
  permissionDenied: boolean;
}

/**
 * Classifies a Firestore (or unknown) error into a user-friendly message and
 * a flag indicating whether it is a permission/auth failure.
 */
function classifyError(err: unknown): {
  message: string;
  permissionDenied: boolean;
} {
  if (err instanceof FirestoreError) {
    switch (err.code) {
      case "permission-denied":
        return {
          message: "Permission denied – your account cannot read these stats",
          permissionDenied: true,
        };
      case "unauthenticated":
        return {
          message: "Not signed in",
          permissionDenied: true,
        };
      case "unavailable":
        return {
          message: "Service unavailable – check your connection and try again",
          permissionDenied: false,
        };
      case "deadline-exceeded":
        return { message: "Request timed out", permissionDenied: false };
      case "resource-exhausted":
        return { message: "Quota exceeded", permissionDenied: false };
      default:
        return { message: err.message, permissionDenied: false };
    }
  }
  return {
    message: err instanceof Error ? err.message : "Failed to load stats",
    permissionDenied: false,
  };
}

/**
 * Fetches aggregate admin statistics from Firestore.
 * Returns:
 *   - userProfileCount: live count of documents in the `users` collection
 *   - signupCount: cumulative counter maintained by the `incrementSignupCounter`
 *     Cloud Function (stored at `stats/signupCounter`)
 *   - permissionDenied: true when the Firestore query was rejected due to
 *     missing permissions or the user not being authenticated.  Callers should
 *     hide the admin UI entirely in this case.
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
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    Promise.allSettled([
      getCountFromServer(collection(db, "users")),
      getDoc(doc(db, "stats", "signupCounter")),
    ]).then(([usersResult, counterResult]) => {
      if (cancelled) return;

      if (usersResult.status === "fulfilled") {
        setUserProfileCount(usersResult.value.data().count);
      } else {
        const { message, permissionDenied: isDenied } = classifyError(
          usersResult.reason,
        );
        setError(message);
        setPermissionDenied(isDenied);
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

  return { userProfileCount, signupCount, loading, error, permissionDenied };
}
