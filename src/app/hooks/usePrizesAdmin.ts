import { useAuth } from "@/app/contexts/AuthContext";
import { ALL_USER_PROFILES } from "@/lib/userProfileData";

/**
 * Returns true when the currently authenticated user's email matches a sample
 * UserProfile that belongs to the "prize-admin" group.
 *
 * This simulates a Google Cloud Groups permission check.  When the app is
 * eventually wired to Firestore / Cloud IAM the lookup here can be replaced
 * with a real profile fetch without changing any of the calling components.
 */
export function usePrizesAdmin(): boolean {
  const { user } = useAuth();
  if (!user?.email) return false;
  const profile = ALL_USER_PROFILES.find((p) => p.email === user.email);
  return profile?.groups?.includes("prize-admin") ?? false;
}
