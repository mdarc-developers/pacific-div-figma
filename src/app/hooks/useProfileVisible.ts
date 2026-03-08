import { useState, useEffect, useRef, useCallback } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/localStorage";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getUserProfileVisible,
  setUserProfileVisible,
} from "@/services/userSettingsService";

const PROFILE_VISIBLE_KEY = "profile_visible_in_attendees";

export function useProfileVisible(): {
  profileVisible: boolean;
  setProfileVisible: (value: boolean) => void;
} {
  const { user } = useAuth();

  const [profileVisible, setProfileVisibleState] = useState<boolean>(() =>
    loadFromStorage<boolean>(PROFILE_VISIBLE_KEY, false),
  );

  // Track the uid we have loaded settings for, so we only load once per login
  const loadedForUidRef = useRef<string | null>(null);

  // Load from Firestore when a user logs in
  useEffect(() => {
    if (!user) {
      loadedForUidRef.current = null;
      return;
    }
    if (loadedForUidRef.current === user.uid) return;

    const uidToLoad = user.uid;
    let cancelled = false;

    getUserProfileVisible(uidToLoad)
      .then((value) => {
        if (cancelled || value === null) return;
        setProfileVisibleState(value);
        saveToStorage(PROFILE_VISIBLE_KEY, value);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForUidRef.current = uidToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const setProfileVisible = useCallback(
    (value: boolean) => {
      setProfileVisibleState(value);
      saveToStorage(PROFILE_VISIBLE_KEY, value);
      if (user) {
        setUserProfileVisible(user.uid, value).catch(console.error);
      }
    },
    [user],
  );

  return { profileVisible, setProfileVisible };
}
