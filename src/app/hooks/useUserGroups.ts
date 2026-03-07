import { useMemo } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { ALL_USER_PROFILES, ALL_USER_PROFILE_GROUPS } from "@/lib/userProfileData";

/**
 * Returns the deduplicated list of groups the currently authenticated user
 * belongs to, determined by checking:
 *
 * 1. `mapUserProfileGroups` entries (matched by uid).
 * 2. `mapUserProfiles` entries whose `groups` array is populated
 *    (matched by email).
 *
 * Returns an empty array when the user is not authenticated or has no
 * group memberships.
 */
export function useUserGroups(): string[] {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return [];

    const collected = new Set<string>();

    // Check by uid via mapUserProfileGroups
    const byUid = ALL_USER_PROFILE_GROUPS.find((g) => g.uid === user.uid);
    byUid?.groups?.forEach((g) => collected.add(g));

    // Check by email via mapUserProfiles
    if (user.email) {
      const profile = ALL_USER_PROFILES.find((p) => p.email === user.email);
      profile?.groups?.forEach((g) => collected.add(g));
    }

    return Array.from(collected);
    // ALL_USER_PROFILES and ALL_USER_PROFILE_GROUPS are module-level constants
    // that never change after initialisation, so they are intentionally omitted.
  }, [user]);
}
