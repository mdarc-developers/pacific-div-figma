import { useState, useEffect, useRef, useCallback } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/localStorage";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getUserExhibitorMember,
  setUserExhibitorMember,
} from "@/services/userSettingsService";

const IS_EXHIBITOR_MEMBER_KEY = "is_exhibitor_member";
const EXHIBITOR_MEMBER_ID_KEY = "exhibitor_member_id";

export function useExhibitorMember(): {
  isExhibitorMember: boolean;
  setIsExhibitorMember: (value: boolean) => void;
  exhibitorMemberId: string;
  setExhibitorMemberId: (value: string) => void;
} {
  const { user } = useAuth();

  const [isExhibitorMember, setIsExhibitorMemberState] = useState<boolean>(() =>
    loadFromStorage<boolean>(IS_EXHIBITOR_MEMBER_KEY, false),
  );
  const [exhibitorMemberId, setExhibitorMemberIdState] = useState<string>(() =>
    loadFromStorage<string>(EXHIBITOR_MEMBER_ID_KEY, ""),
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

    getUserExhibitorMember(uidToLoad)
      .then((settings) => {
        if (cancelled || settings === null) return;
        setIsExhibitorMemberState(settings.isExhibitorMember);
        setExhibitorMemberIdState(settings.exhibitorMemberId);
        saveToStorage(IS_EXHIBITOR_MEMBER_KEY, settings.isExhibitorMember);
        saveToStorage(EXHIBITOR_MEMBER_ID_KEY, settings.exhibitorMemberId);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForUidRef.current = uidToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const setIsExhibitorMember = useCallback(
    (value: boolean) => {
      setIsExhibitorMemberState(value);
      saveToStorage(IS_EXHIBITOR_MEMBER_KEY, value);
      if (user) {
        setUserExhibitorMember(user.uid, { isExhibitorMember: value }).catch(
          console.error,
        );
      }
    },
    [user],
  );

  const setExhibitorMemberId = useCallback(
    (value: string) => {
      setExhibitorMemberIdState(value);
      saveToStorage(EXHIBITOR_MEMBER_ID_KEY, value);
      if (user) {
        setUserExhibitorMember(user.uid, { exhibitorMemberId: value }).catch(
          console.error,
        );
      }
    },
    [user],
  );

  return {
    isExhibitorMember,
    setIsExhibitorMember,
    exhibitorMemberId,
    setExhibitorMemberId,
  };
}
