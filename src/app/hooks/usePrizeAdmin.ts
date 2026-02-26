import { useAuth } from "@/app/contexts/AuthContext";
import { UserProfile } from "@/types/conference";

// Load all sampleUserProfiles exports from every conference data file.
// This mirrors the pattern used in PrizesView for prizes/winners.
interface ProfileModule {
  sampleUserProfiles?: UserProfile[];
  [key: string]: unknown;
}

const profileModules = import.meta.glob("../../data/*-20[0-9][0-9].ts", {
  eager: true,
});

const allSampleProfiles: UserProfile[] = [];
Object.values(profileModules).forEach((mod) => {
  const typedMod = mod as ProfileModule;
  if (typedMod.sampleUserProfiles) {
    allSampleProfiles.push(...typedMod.sampleUserProfiles);
  }
});

/**
 * Returns true when the currently authenticated user's email matches a sample
 * UserProfile that belongs to the "prize-admin" group.
 *
 * This simulates a Google Cloud Groups permission check.  When the app is
 * eventually wired to Firestore / Cloud IAM the lookup here can be replaced
 * with a real profile fetch without changing any of the calling components.
 */
export function usePrizeAdmin(): boolean {
  const { user } = useAuth();
  if (!user?.email) return false;
  const profile = allSampleProfiles.find((p) => p.email === user.email);
  return profile?.groups?.includes("prize-admin") ?? false;
}
