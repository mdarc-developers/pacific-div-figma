import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import { getUserTheme, setUserTheme } from "@/services/userSettingsService";

/**
 * Headless sync component.
 * - On user login: loads saved theme from Firestore and applies it.
 * - On theme change (after initial load): persists the new theme to Firestore.
 * - On logout: clears the loaded state so the next login re-reads Firestore.
 */
export function FirebaseThemeSync() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  // Tracks the uid for which we have already loaded from Firestore.
  const loadedForUidRef = useRef<string | null>(null);
  // Prevents writing back to Firestore the value we just read from it.
  const justLoadedRef = useRef(false);

  // Load theme from Firestore whenever a new user logs in.
  useEffect(() => {
    if (!user) {
      loadedForUidRef.current = null;
      return;
    }
    if (loadedForUidRef.current === user.uid) return;

    const uidToLoad = user.uid;
    let cancelled = false;

    getUserTheme(uidToLoad)
      .then((savedTheme) => {
        if (cancelled) return;
        if (savedTheme) {
          justLoadedRef.current = true;
          setTheme(savedTheme);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) loadedForUidRef.current = uidToLoad;
      });

    return () => {
      cancelled = true;
    };
  }, [user, setTheme]);

  // Save theme to Firestore whenever it changes (only after the initial load).
  useEffect(() => {
    if (!user || loadedForUidRef.current !== user.uid) return;
    // Skip the write that mirrors the value we just read from Firestore.
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }
    setUserTheme(user.uid, theme).catch(console.error);
  }, [user, theme]);

  return null;
}
