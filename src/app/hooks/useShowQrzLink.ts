import { useState, useEffect, useRef, useCallback } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/localStorage";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getUserShowQrzLink,
  setUserShowQrzLink,
} from "@/services/userSettingsService";

const SHOW_QRZ_LINK_KEY = "show_qrz_link";

export function useShowQrzLink(): {
  showQrzLink: boolean;
  setShowQrzLink: (value: boolean) => void;
} {
  const { user } = useAuth();

  const [showQrzLink, setShowQrzLinkState] = useState<boolean>(() =>
    loadFromStorage<boolean>(SHOW_QRZ_LINK_KEY, false),
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

    getUserShowQrzLink(uidToLoad)
      .then((value) => {
        if (cancelled || value === null) return;
        setShowQrzLinkState(value);
        saveToStorage(SHOW_QRZ_LINK_KEY, value);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForUidRef.current = uidToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const setShowQrzLink = useCallback(
    (value: boolean) => {
      setShowQrzLinkState(value);
      saveToStorage(SHOW_QRZ_LINK_KEY, value);
      if (user) {
        setUserShowQrzLink(user.uid, value).catch(console.error);
      }
    },
    [user],
  );

  return { showQrzLink, setShowQrzLink };
}
