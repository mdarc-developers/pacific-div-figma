import { useState, useEffect, useRef, useCallback } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/localStorage";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getUserProfileFields,
  setUserProfileFields,
} from "@/services/userSettingsService";

const CALLSIGN_KEY = "user_callsign";
const DISPLAY_NAME_KEY = "user_display_name";
const DISPLAY_PROFILE_KEY = "user_display_profile";

export function useUserProfileFields(): {
  callsign: string;
  setCallsign: (value: string) => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  displayProfile: string;
  setDisplayProfile: (value: string) => void;
} {
  const { user } = useAuth();

  const [callsign, setCallsignState] = useState<string>(() =>
    loadFromStorage<string>(CALLSIGN_KEY, ""),
  );
  const [displayName, setDisplayNameState] = useState<string>(() =>
    loadFromStorage<string>(DISPLAY_NAME_KEY, ""),
  );
  const [displayProfile, setDisplayProfileState] = useState<string>(() =>
    loadFromStorage<string>(DISPLAY_PROFILE_KEY, ""),
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

    getUserProfileFields(uidToLoad)
      .then((fields) => {
        if (cancelled || !fields) return;
        setCallsignState(fields.callsign);
        setDisplayNameState(fields.displayName);
        setDisplayProfileState(fields.displayProfile);
        saveToStorage(CALLSIGN_KEY, fields.callsign);
        saveToStorage(DISPLAY_NAME_KEY, fields.displayName);
        saveToStorage(DISPLAY_PROFILE_KEY, fields.displayProfile);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForUidRef.current = uidToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Each setter: persist to localStorage first, then sync to Firestore
  const setCallsign = useCallback(
    (value: string) => {
      setCallsignState(value);
      saveToStorage(CALLSIGN_KEY, value);
      if (user) {
        setUserProfileFields(user.uid, { callsign: value }).catch(console.error);
      }
    },
    [user],
  );

  const setDisplayName = useCallback(
    (value: string) => {
      setDisplayNameState(value);
      saveToStorage(DISPLAY_NAME_KEY, value);
      if (user) {
        setUserProfileFields(user.uid, { displayName: value }).catch(console.error);
      }
    },
    [user],
  );

  const setDisplayProfile = useCallback(
    (value: string) => {
      setDisplayProfileState(value);
      saveToStorage(DISPLAY_PROFILE_KEY, value);
      if (user) {
        setUserProfileFields(user.uid, { displayProfile: value }).catch(console.error);
      }
    },
    [user],
  );

  return { callsign, setCallsign, displayName, setDisplayName, displayProfile, setDisplayProfile };
}
