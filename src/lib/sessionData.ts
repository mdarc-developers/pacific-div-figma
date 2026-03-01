import { Session, MapImage, Room, Booth, Exhibitor } from "@/types/conference";
import { conferenceModules } from "@/lib/conferenceData";

interface ConferenceModule {
  mapSessions?: [string, Session[]];
  conferenceMaps?: MapImage[];
  mapRooms?: [string, Room[]];
  mapBooths?: [string, Booth[]];
  mapExhibitors?: [string, Exhibitor[]];
  [key: string]: unknown;
}

// Process the modules into a lookup object
export const SESSION_DATA: Record<string, Session[]> = {};
export const MAP_DATA: Record<string, MapImage[]> = {};
// ROOM_DATA, BOOTH_DATA, and EXHIBITOR_DATA use [mapUrl, items[]] tuples so that
// each entry knows which MapImage URL the overlays should be rendered on top of.
export const ROOM_DATA: Record<string, [string, Room[]]> = {};
export const BOOTH_DATA: Record<string, [string, Booth[]]> = {};
export const EXHIBITOR_DATA: Record<string, [string, Exhibitor[]]> = {};
Object.entries(conferenceModules).forEach(([path, module]) => {
  const conferenceId = path.split("/").pop()?.replace(".ts", "") || "";
  const typedModule = module as ConferenceModule;
  if (typedModule.mapSessions) {
    SESSION_DATA[conferenceId] = typedModule.mapSessions[1];
  }
  if (typedModule.conferenceMaps) {
    MAP_DATA[conferenceId] = typedModule.conferenceMaps;
  }
  if (typedModule.mapRooms) {
    ROOM_DATA[conferenceId] = typedModule.mapRooms;
  }
  if (typedModule.mapBooths) {
    BOOTH_DATA[conferenceId] = typedModule.mapBooths;
  }
  if (typedModule.mapExhibitors) {
    EXHIBITOR_DATA[conferenceId] = typedModule.mapExhibitors;
  }
});

// Track the newest supplemental file timestamp token per conference.
export const SESSION_SUPPLEMENTAL_TOKEN: Record<string, string> = {};
export const EXHIBITOR_SUPPLEMENTAL_TOKEN: Record<string, string> = {};

// Override with supplemental session files (e.g. seapac-2026-sesssion-20260227.ts).
// Sorting paths ensures the alphabetically last (= most recent timestamp) wins when
// multiple supplemental files exist for the same conference.
const supplementalSessionModules = import.meta.glob(
  "../data/*-session-*.ts",
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
      const typedModule = supplementalSessionModules[path] as ConferenceModule;
      if (typedModule.mapSessions) {
        SESSION_DATA[conferenceId] = typedModule.mapSessions[1];
        const token = filename.split("-").pop() ?? "";
        if (token && token > (SESSION_SUPPLEMENTAL_TOKEN[conferenceId] ?? "")) {
          SESSION_SUPPLEMENTAL_TOKEN[conferenceId] = token;
        }
      }
    }
  });

// Override with supplemental exhibitor files (e.g. hamcation-2026-exhibitor-20260301.ts).
// Sorting paths ensures the alphabetically last (= most recent timestamp) wins when
// multiple supplemental files exist for the same conference.
const supplementalExhibitorModules = import.meta.glob(
  "../data/*-exhibitor-*.ts",
  { eager: true },
);
Object.keys(supplementalExhibitorModules)
  .sort()
  .forEach((path) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    const match = filename.match(/^(.+)-exhibitor-/);
    if (match) {
      const conferenceId = match[1];
      const typedModule = supplementalExhibitorModules[path] as ConferenceModule;
      if (typedModule.mapExhibitors) {
        EXHIBITOR_DATA[conferenceId] = typedModule.mapExhibitors;
        const token = filename.split("-").pop() ?? "";
        if (
          token &&
          token > (EXHIBITOR_SUPPLEMENTAL_TOKEN[conferenceId] ?? "")
        ) {
          EXHIBITOR_SUPPLEMENTAL_TOKEN[conferenceId] = token;
        }
      }
    }
  });
