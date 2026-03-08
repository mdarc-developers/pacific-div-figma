import { useAuth } from "@/app/contexts/AuthContext";
import {
  ALL_USER_PROFILES,
  ALL_USER_PROFILE_GROUPS,
} from "@/lib/userProfileData";

/**
 * Returns true when the currently authenticated user is a member of the
 * "exhibitor-admin" group, determined by checking:
 *
 * 1. `mapUserProfileGroups` entries (matched by uid).
 * 2. `mapUserProfiles` entries whose `groups` array includes "exhibitor-admin"
 *    (matched by email).
 *
 * When the app is eventually wired to Firestore / Cloud IAM the lookup here
 * can be replaced with a real profile fetch without changing any of the
 * calling components.
 */
export function useExhibitorAdmin(): boolean {
  const { user } = useAuth();
  if (!user) return false;

  // Check by uid via mapUserProfileGroups
  const byUid =
    ALL_USER_PROFILE_GROUPS.find((g) => g.uid === user.uid)?.groups?.includes(
      "exhibitor-admin",
    ) ?? false;
  if (byUid) return true;

  // Check by email via mapUserProfiles
  if (!user.email) return false;
  const profile = ALL_USER_PROFILES.find((p) => p.email === user.email);
  return profile?.groups?.includes("exhibitor-admin") ?? false;
}
