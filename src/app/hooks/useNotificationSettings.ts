import { useState, useEffect, useRef, useCallback } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/localStorage";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  getUserNotificationSettings,
  setUserNotificationSettings,
} from "@/services/userSettingsService";

const SMS_ENABLED_KEY = "sms_notifications_enabled";
const PHONE_NUMBER_KEY = "sms_phone_number";

export function useNotificationSettings(): {
  smsEnabled: boolean;
  setSmsEnabled: (value: boolean) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
} {
  const { user } = useAuth();

  const [smsEnabled, setSmsEnabledState] = useState<boolean>(() =>
    loadFromStorage<boolean>(SMS_ENABLED_KEY, false),
  );
  const [phoneNumber, setPhoneNumberState] = useState<string>(() =>
    loadFromStorage<string>(PHONE_NUMBER_KEY, ""),
  );

  // Refs for use inside callbacks to avoid stale closures
  const smsEnabledRef = useRef(smsEnabled);
  const phoneNumberRef = useRef(phoneNumber);
  useEffect(() => {
    smsEnabledRef.current = smsEnabled;
  }, [smsEnabled]);
  useEffect(() => {
    phoneNumberRef.current = phoneNumber;
  }, [phoneNumber]);

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

    getUserNotificationSettings(uidToLoad)
      .then((settings) => {
        if (cancelled || !settings) return;
        setSmsEnabledState(settings.smsEnabled);
        setPhoneNumberState(settings.phoneNumber);
        saveToStorage(SMS_ENABLED_KEY, settings.smsEnabled);
        saveToStorage(PHONE_NUMBER_KEY, settings.phoneNumber);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForUidRef.current = uidToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const setSmsEnabled = useCallback(
    (value: boolean) => {
      setSmsEnabledState(value);
      saveToStorage(SMS_ENABLED_KEY, value);
      if (user) {
        setUserNotificationSettings(user.uid, {
          smsEnabled: value,
          phoneNumber: phoneNumberRef.current,
        }).catch(console.error);
      }
    },
    [user],
  );

  const setPhoneNumber = useCallback(
    (value: string) => {
      setPhoneNumberState(value);
      saveToStorage(PHONE_NUMBER_KEY, value);
      if (user) {
        setUserNotificationSettings(user.uid, {
          smsEnabled: smsEnabledRef.current,
          phoneNumber: value,
        }).catch(console.error);
      }
    },
    [user],
  );

  return { smsEnabled, setSmsEnabled, phoneNumber, setPhoneNumber };
}
