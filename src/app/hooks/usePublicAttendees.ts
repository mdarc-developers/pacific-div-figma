import { useState, useEffect, useCallback } from "react";
import { PublicAttendeeProfile } from "@/types/conference";
import {
  fetchPublicAttendees,
  loadAttendeesFromStorage,
  saveAttendeesToStorage,
} from "@/services/attendeesService";
import { useAuth } from "@/app/contexts/AuthContext";

export interface UsePublicAttendeesResult {
  /** Attendees loaded from Firestore or localStorage cache. */
  attendees: PublicAttendeeProfile[];
  /** True while the Firestore fetch is in progress. */
  loading: boolean;
  /** Error message from the most recent fetch attempt, or null. */
  error: string | null;
  /** Manually trigger a fresh fetch from Firestore. */
  refresh: () => void;
  /**
   * True when the current user is authenticated and has a verified email
   * address, meaning they are permitted to fetch the attendee list.
   * False when not signed in, when email is unverified, or while auth is
   * still initialising.
   */
  hasAccess: boolean;
  /** True while Firebase Auth is still determining the initial auth state. */
  authLoading: boolean;
}

/**
 * Loads the public attendee list from the `publicProfiles` Firestore
 * collection with localStorage caching for offline access.
 *
 * Requires an authenticated user with a verified email address.
 * If the user is not authenticated or has not verified their email,
 * the hook returns an empty array without attempting a Firestore fetch.
 * The Firestore security rules enforce this requirement server-side as well.
 *
 * On mount (when authenticated) the hook:
 *   1. Immediately returns whatever is cached in localStorage.
 *   2. Fetches fresh data from Firestore in the background.
 *   3. Saves the fresh data back to localStorage on success.
 *
 * Calling `refresh()` re-triggers the Firestore fetch at any time.
 */
export function usePublicAttendees(): UsePublicAttendeesResult {
  const { user, loading: authLoading } = useAuth();
  const [attendees, setAttendees] = useState<PublicAttendeeProfile[]>(() =>
    loadAttendeesFromStorage(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchTick, setFetchTick] = useState(0);

  const refresh = useCallback(() => {
    setFetchTick((t) => t + 1);
  }, []);

  useEffect(() => {
    // Only fetch if the user is authenticated and has a verified email.
    if (!user || !user.emailVerified) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPublicAttendees()
      .then((data) => {
        if (cancelled) return;
        setAttendees(data);
        saveAttendeesToStorage(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load attendees";
        setError(message);
        // Keep the stale localStorage cache in `attendees` — it was set on
        // initialization from localStorage so the UI still has data.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchTick, user]);

  return {
    attendees,
    loading,
    error,
    refresh,
    hasAccess: !!(user && user.emailVerified),
    authLoading,
  };
}
