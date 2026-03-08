import { useState, useEffect, useCallback } from "react";
import { PublicAttendeeProfile } from "@/types/conference";
import {
  fetchPublicAttendees,
  loadAttendeesFromStorage,
  saveAttendeesToStorage,
} from "@/services/attendeesService";

export interface UsePublicAttendeesResult {
  /** Attendees loaded from Firestore or localStorage cache. */
  attendees: PublicAttendeeProfile[];
  /** True while the Firestore fetch is in progress. */
  loading: boolean;
  /** Error message from the most recent fetch attempt, or null. */
  error: string | null;
  /** Manually trigger a fresh fetch from Firestore. */
  refresh: () => void;
}

/**
 * Loads the public attendee list from the `publicProfiles` Firestore
 * collection with localStorage caching for offline access.
 *
 * On mount the hook:
 *   1. Immediately returns whatever is cached in localStorage.
 *   2. Fetches fresh data from Firestore in the background.
 *   3. Saves the fresh data back to localStorage on success.
 *
 * Calling `refresh()` re-triggers the Firestore fetch at any time.
 */
export function usePublicAttendees(): UsePublicAttendeesResult {
  const [attendees, setAttendees] = useState<PublicAttendeeProfile[]>(
    () => loadAttendeesFromStorage(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchTick, setFetchTick] = useState(0);

  const refresh = useCallback(() => {
    setFetchTick((t) => t + 1);
  }, []);

  useEffect(() => {
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
  }, [fetchTick]);

  return { attendees, loading, error, refresh };
}
