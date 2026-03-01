import { UserProfile } from "@/types/conference";
import { conferenceModules } from "@/lib/conferenceData";

interface ProfileModule {
  sampleUserProfiles?: UserProfile[];
  [key: string]: unknown;
}

// Collect all sampleUserProfiles exports from every conference data file.
export const ALL_USER_PROFILES: UserProfile[] = [];
Object.values(conferenceModules).forEach((module) => {
  const typedModule = module as ProfileModule;
  if (typedModule.sampleUserProfiles) {
    ALL_USER_PROFILES.push(...typedModule.sampleUserProfiles);
  }
});
