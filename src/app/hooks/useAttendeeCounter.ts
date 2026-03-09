import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Fetches the attendeeCounter field from `conferences/{conferenceId}`.
 * This document is publicly readable and the counter is maintained by the
 * `incrementAttendeeCounter` / `decrementAttendeeCounter` Cloud Functions.
 *
 * Returns null while loading or if the read fails.
 */
export function useAttendeeCounter(conferenceId: string): number | null {
  const [attendeeCounter, setAttendeeCounter] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDoc(doc(db, "conferences", conferenceId))
      .then((snap) => {
        if (cancelled) return;
        const data = snap.data();
        if (snap.exists() && typeof data?.attendeeCounter === "number") {
          setAttendeeCounter(data.attendeeCounter);
        }
      })
      .catch(() => {
        // Silently ignore errors — count badge is optional
      });

    return () => {
      cancelled = true;
    };
  }, [conferenceId]);

  return attendeeCounter;
}
