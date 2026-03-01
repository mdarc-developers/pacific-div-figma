import { UserProfile } from "@/types/conference";

interface AttendeeModule {
  sampleAttendees?: UserProfile[];
  [key: string]: unknown;
}

// Import all attendee data files at once using Vite's glob import
const conferenceModules = import.meta.glob("../data/*-20[0-9][0-9].ts", {
  eager: true,
});

// Process the modules into a lookup object
export const ATTENDEE_DATA: Record<string, UserProfile[]> = {};
Object.entries(conferenceModules).forEach(([path, module]) => {
  const conferenceId = path.split("/").pop()?.replace(".ts", "") || "";
  const typedModule = module as AttendeeModule;
  if (typedModule.sampleAttendees) {
    ATTENDEE_DATA[conferenceId] = typedModule.sampleAttendees;
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
      const typedModule = supplementalAttendeeModules[path] as AttendeeModule;
      if (typedModule.sampleAttendees) {
        ATTENDEE_DATA[conferenceId] = typedModule.sampleAttendees;
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
