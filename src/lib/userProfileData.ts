import { UserProfile, UserProfileGroups } from "@/types/conference";
import { conferenceModules } from "@/lib/conferenceData";

interface ProfileModule {
  mapUserProfiles?: UserProfile[];
  mapUserProfileGroups?: UserProfileGroups[];
  [key: string]: unknown;
}

// Collect all mapUserProfiles exports from every conference data file.
export const ALL_USER_PROFILES: UserProfile[] = [];
Object.values(conferenceModules).forEach((module) => {
  const typedModule = module as ProfileModule;
  if (typedModule.mapUserProfiles) {
    ALL_USER_PROFILES.push(...typedModule.mapUserProfiles);
  }
});

// Collect all mapUserProfileGroups exports from every conference data file.
// These lightweight uid+groups entries allow specifying group membership
// without requiring a full UserProfile record.
export const ALL_USER_PROFILE_GROUPS: UserProfileGroups[] = [];
Object.values(conferenceModules).forEach((module) => {
  const typedModule = module as ProfileModule;
  if (typedModule.mapUserProfileGroups) {
    ALL_USER_PROFILE_GROUPS.push(...typedModule.mapUserProfileGroups);
  }
});

// Process the modules into a lookup object
export const ATTENDEE_DATA: Record<string, UserProfile[]> = {};
Object.entries(conferenceModules).forEach(([path, module]) => {
  const conferenceId = path.split("/").pop()?.replace(".ts", "") || "";
  const typedModule = module as ProfileModule;
  if (typedModule.mapUserProfiles) {
    ATTENDEE_DATA[conferenceId] = typedModule.mapUserProfiles;
  }
});

// Track the newest supplemental file timestamp token per conference.
export const ATTENDEE_SUPPLEMENTAL_TOKEN: Record<string, string> = {};

// Override with supplemental userprofile files (e.g. quartzfest-2027-userprofile-20260301.ts).
// Sorting paths ensures the alphabetically last (= most recent timestamp) wins when
// multiple supplemental files exist for the same conference.
const supplementalAttendeeModules = import.meta.glob(
  "../data/*-userprofile-*.ts",
  { eager: true },
);
Object.keys(supplementalAttendeeModules)
  .sort()
  .forEach((path) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    const match = filename.match(/^(.+)-userprofile-/);
    if (match) {
      const conferenceId = match[1];
      const typedModule = supplementalAttendeeModules[path] as ProfileModule;
      if (typedModule.mapUserProfiles) {
        ATTENDEE_DATA[conferenceId] = typedModule.mapUserProfiles;
        const token = filename.split("-").pop() ?? "";
        if (
          token &&
          token > (ATTENDEE_SUPPLEMENTAL_TOKEN[conferenceId] ?? "")
        ) {
          ATTENDEE_SUPPLEMENTAL_TOKEN[conferenceId] = token;
        }
      }
    }
  });
