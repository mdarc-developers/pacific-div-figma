import { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { ALL_USER_PROFILES, ALL_USER_PROFILE_GROUPS } from "@/lib/userProfileData";
import { loadFromStorage, saveToStorage } from "@/lib/localStorage";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const STORAGE_KEY_PREFIX = "mdarc-developer:";

/**
 * Returns true when the currently authenticated user is a member of the
 * "mdarc-developers" group, determined by checking three sources in order:
 *
 * 1. Local data — `mapUserProfileGroups` entries (matched by uid) and
 *    `mapUserProfiles` entries whose `groups` array includes "mdarc-developers"
 *    (matched by email).
 * 2. localStorage — a cached result from a previous Firebase lookup.
 * 3. Firebase `groups/mdarc-developers` document — the `members` map field
 *    keyed by uid.  The result is persisted to localStorage for subsequent
 *    page loads.
 *
 * The hook returns synchronously from the local/cache sources while the
 * Firebase fetch runs in the background.  Once the fetch resolves the
 * returned value is updated if needed.
 */
export function useMdarcDeveloper(): boolean {
  const { user } = useAuth();

  // --- synchronous local check (by uid via mapUserProfileGroups) ---
  const localByUid = user
    ? (ALL_USER_PROFILE_GROUPS.find((g) => g.uid === user.uid)
        ?.groups?.includes("mdarc-developers") ?? false)
    : false;

  // --- synchronous local check (by email via mapUserProfiles) ---
  const localByEmail =
    user?.email
      ? (ALL_USER_PROFILES.find((p) => p.email === user.email)
          ?.groups?.includes("mdarc-developers") ?? false)
      : false;

  const localResult = localByUid || localByEmail;

  // --- asynchronous Firebase + localStorage cached check ---
  const cacheKey = user ? STORAGE_KEY_PREFIX + user.uid : null;
  const [firebaseResult, setFirebaseResult] = useState<boolean>(() => {
    if (!cacheKey) return false;
    return loadFromStorage<boolean>(cacheKey, false);
  });

  useEffect(() => {
    if (!user || !cacheKey) {
      setFirebaseResult(false);
      return;
    }

    // Refresh the cached value from the live Firebase groups document.
    let cancelled = false;
    getDoc(doc(db, "groups", "mdarc-developers"))
      .then((snap) => {
        if (cancelled) return;
        const members = snap.exists() ? (snap.data()?.members ?? {}) : {};
        const isMember = members[user.uid] === true;
        setFirebaseResult(isMember);
        saveToStorage(cacheKey, isMember);
      })
      .catch((err: unknown) => {
        // Fall back to local / cached value on fetch failure.
        console.warn(
          "useMdarcDeveloper: Firebase groups fetch failed, using cached/local value:",
          err,
        );
      });

    return () => {
      cancelled = true;
    };
  }, [user, cacheKey]);

  return localResult || firebaseResult;
}
