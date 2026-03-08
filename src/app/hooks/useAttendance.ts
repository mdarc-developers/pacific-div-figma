import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getUserAttendance,
  addUserAttendance,
  removeUserAttendance,
} from "@/services/attendanceService";

/**
 * Hook that loads a user's attended conference list from Firestore on login
 * and exposes functions to add/remove entries.
 *
 * Data lives at:
 *   - Primary: conferences/{conferenceId}/attendees/{uid}
 *   - Convenience: users/{uid}.attendance  (array of conferenceId strings)
 */
export function useAttendance(): {
  attendance: string[];
  addConference: (conferenceId: string) => Promise<void>;
  removeConference: (conferenceId: string) => Promise<void>;
  loading: boolean;
} {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const loadedForUidRef = useRef<string | null>(null);

  // Load from Firestore when the user logs in (only once per login)
  useEffect(() => {
    if (!user) {
      loadedForUidRef.current = null;
      setAttendance([]);
      return;
    }
    if (loadedForUidRef.current === user.uid) return;

    const uidToLoad = user.uid;
    let cancelled = false;
    setLoading(true);

    getUserAttendance(uidToLoad)
      .then((ids) => {
        if (cancelled) return;
        setAttendance(ids);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) {
          loadedForUidRef.current = uidToLoad;
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const addConference = useCallback(
    async (conferenceId: string) => {
      if (!user) return;
      await addUserAttendance(user.uid, conferenceId);
      setAttendance((prev) =>
        prev.includes(conferenceId) ? prev : [...prev, conferenceId],
      );
    },
    [user],
  );

  const removeConference = useCallback(
    async (conferenceId: string) => {
      if (!user) return;
      await removeUserAttendance(user.uid, conferenceId);
      setAttendance((prev) => prev.filter((id) => id !== conferenceId));
    },
    [user],
  );

  return { attendance, addConference, removeConference, loading };
}
