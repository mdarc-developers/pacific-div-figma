import { Session } from "@/types/conference";

interface SessionModule {
  mapSessions?: [string, Session[]];
  [key: string]: unknown;
}

// Import all session data files at once using Vite's glob import
const conferenceModules = import.meta.glob("../data/*-20[0-9][0-9].ts", {
  eager: true,
});

// Process the modules into a lookup object
export const SESSION_DATA: Record<string, Session[]> = {};
Object.entries(conferenceModules).forEach(([path, module]) => {
  const conferenceId = path.split("/").pop()?.replace(".ts", "") || "";
  const typedModule = module as SessionModule;
  if (typedModule.mapSessions) {
    SESSION_DATA[conferenceId] = typedModule.mapSessions[1];
  }
});

// Track the newest supplemental file timestamp token per conference.
export const SESSION_SUPPLEMENTAL_TOKEN: Record<string, string> = {};

// Override with supplemental session files (e.g. seapac-2026-sesssion-20260227.ts).
// The glob matches both "session" and "sesssion" (common typo) via the * wildcard.
// Sorting paths ensures the alphabetically last (= most recent timestamp) wins when
// multiple supplemental files exist for the same conference.
const supplementalSessionModules = import.meta.glob(
  "../data/*-sess*ion-*.ts",
  { eager: true },
);
Object.keys(supplementalSessionModules)
  .sort()
  .forEach((path) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    // The regex matches both "session" and "sesssion" (triple-s typo in first file).
    const conferenceIdMatch = filename.match(/^(.+)-sess.*ion-/);
    if (conferenceIdMatch) {
      const conferenceId = conferenceIdMatch[1];
      const typedModule = supplementalSessionModules[path] as SessionModule;
      if (typedModule.mapSessions) {
        SESSION_DATA[conferenceId] = typedModule.mapSessions[1];
        const token = filename.split("-").pop() ?? "";
        if (token && token > (SESSION_SUPPLEMENTAL_TOKEN[conferenceId] ?? "")) {
          SESSION_SUPPLEMENTAL_TOKEN[conferenceId] = token;
        }
      }
    }
  });
