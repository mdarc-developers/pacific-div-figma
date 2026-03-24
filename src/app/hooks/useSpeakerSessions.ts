import { useState, useEffect, useRef, useCallback } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/localStorage";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getUserSpeakerSessions,
  setUserSpeakerSessions,
} from "@/services/userSettingsService";

const STORAGE_KEY_PREFIX = "speaker_sessions_";

export function useSpeakerSessions(conferenceId: string): {
  speakerSessions: string[];
  addSpeakerSession: (sessionId: string) => void;
  removeSpeakerSession: (sessionId: string) => void;
} {
  const { user } = useAuth();

  const storageKey = STORAGE_KEY_PREFIX + conferenceId;

  const [speakerSessions, setSpeakerSessionsState] = useState<string[]>(() =>
    loadFromStorage<string[]>(storageKey, []),
  );

  // Reload from localStorage whenever the active conference changes.
  useEffect(() => {
    setSpeakerSessionsState(loadFromStorage<string[]>(storageKey, []));
  }, [storageKey]);

  // Track the composite key for which we have already loaded from Firestore.
  const loadedForKeyRef = useRef<string | null>(null);

  // Load from Firestore when a user logs in or the conference changes.
  useEffect(() => {
    const loadKey = user ? `${user.uid}:${conferenceId}` : null;
    if (!loadKey) {
      loadedForKeyRef.current = null;
      return;
    }
    if (loadedForKeyRef.current === loadKey) return;

    const uidToLoad = user!.uid;
    let cancelled = false;

    getUserSpeakerSessions(uidToLoad, conferenceId)
      .then((sessions) => {
        if (cancelled) return;
        setSpeakerSessionsState(sessions);
        saveToStorage(storageKey, sessions);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForKeyRef.current = loadKey;
      });

    return () => {
      cancelled = true;
    };
  }, [user, conferenceId, storageKey]);

  const addSpeakerSession = useCallback(
    (sessionId: string) => {
      setSpeakerSessionsState((prev) => {
        if (prev.includes(sessionId)) return prev;
        const next = [...prev, sessionId];
        saveToStorage(storageKey, next);
        if (user) {
          setUserSpeakerSessions(user.uid, conferenceId, next).catch(
            console.error,
          );
        }
        return next;
      });
    },
    [user, conferenceId, storageKey],
  );

  const removeSpeakerSession = useCallback(
    (sessionId: string) => {
      setSpeakerSessionsState((prev) => {
        const next = prev.filter((id) => id !== sessionId);
        saveToStorage(storageKey, next);
        if (user) {
          setUserSpeakerSessions(user.uid, conferenceId, next).catch(
            console.error,
          );
        }
        return next;
      });
    },
    [user, conferenceId, storageKey],
  );

  return { speakerSessions, addSpeakerSession, removeSpeakerSession };
}
