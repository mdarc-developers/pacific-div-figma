import { Session, MapImage, Room, Booth, Exhibitor } from "@/types/conference";
import { conferenceModules } from "@/lib/conferenceData";
import { resolveSessionEndTime, warnOutOfRangeSessions, warnEmptyMapData } from "@/lib/overrideUtils";
import { allConferences } from "@/data/all-conferences";

interface ConferenceModule {
  mapSessions?: [string, Session[]];
  conferenceMaps?: MapImage[];
  mapRooms?: [string, Room[]];
  mapBooths?: [string, Booth[]];
  mapExhibitors?: [string, Exhibitor[]];
  [key: string]: unknown;
}

// Populate mapSessionRooms on the matching Conference object in allConferences.
// type "sessions" updates the first boolean (mapSessions loaded);
// type "rooms" updates the second boolean (mapRooms loaded).
// Throws if the boolean being set is already true, unless isSupplemental is true
// (supplemental files override the base data and do not trigger the duplicate check).
function updateMapSessionRooms(
  conferenceId: string,
  url: string,
  type: "sessions" | "rooms",
  isSupplemental = false,
): void {
  const conf = allConferences.find((c) => c.id === conferenceId);
  if (!conf) return;
  if (!conf.mapSessionRooms || conf.mapSessionRooms[0] !== url) {
    conf.mapSessionRooms = [url, false, false];
  }
  if (type === "sessions") {
    if (conf.mapSessionRooms[1] && !isSupplemental) {
      throw new Error(
        `mapSessions already loaded for conference "${conferenceId}" URL "${url}"`,
      );
    }
    conf.mapSessionRooms[1] = true;
  } else {
    if (conf.mapSessionRooms[2] && !isSupplemental) {
      throw new Error(
        `mapRooms already loaded for conference "${conferenceId}" URL "${url}"`,
      );
    }
    conf.mapSessionRooms[2] = true;
  }
}

// Populate mapExhibitorBooths on the matching Conference object in allConferences.
// type "exhibitors" updates the first boolean (mapExhibitors loaded);
// type "booths" updates the second boolean (mapBooths loaded).
// Throws if the boolean being set is already true, unless isSupplemental is true
// (supplemental files override the base data and do not trigger the duplicate check).
function updateMapExhibitorBooths(
  conferenceId: string,
  url: string,
  type: "exhibitors" | "booths",
  isSupplemental = false,
): void {
  const conf = allConferences.find((c) => c.id === conferenceId);
  if (!conf) return;
  if (!conf.mapExhibitorBooths || conf.mapExhibitorBooths[0] !== url) {
    conf.mapExhibitorBooths = [url, false, false];
  }
  if (type === "exhibitors") {
    if (conf.mapExhibitorBooths[1] && !isSupplemental) {
      throw new Error(
        `mapExhibitors already loaded for conference "${conferenceId}" URL "${url}"`,
      );
    }
    conf.mapExhibitorBooths[1] = true;
  } else {
    if (conf.mapExhibitorBooths[2] && !isSupplemental) {
      throw new Error(
        `mapBooths already loaded for conference "${conferenceId}" URL "${url}"`,
      );
    }
    conf.mapExhibitorBooths[2] = true;
  }
}

// Process the modules into a lookup object
function normalizeSessions(sessions: Session[]): Session[] {
  return sessions.map((s) => ({
    ...s,
    endTime: resolveSessionEndTime(s.startTime, s.endTime),
  }));
}

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
    SESSION_DATA[conferenceId] = normalizeSessions(typedModule.mapSessions[1]);
    updateMapSessionRooms(conferenceId, typedModule.mapSessions[0], "sessions");
    const conf = allConferences.find((c) => c.id === conferenceId);
    if (conf) warnOutOfRangeSessions(conferenceId, SESSION_DATA[conferenceId], conf);
  }
  if (typedModule.conferenceMaps) {
    MAP_DATA[conferenceId] = typedModule.conferenceMaps;
  }
  if (typedModule.mapRooms) {
    ROOM_DATA[conferenceId] = typedModule.mapRooms;
    updateMapSessionRooms(conferenceId, typedModule.mapRooms[0], "rooms");
  }
  if (typedModule.mapBooths) {
    BOOTH_DATA[conferenceId] = typedModule.mapBooths;
    updateMapExhibitorBooths(conferenceId, typedModule.mapBooths[0], "booths");
  }
  if (typedModule.mapExhibitors) {
    EXHIBITOR_DATA[conferenceId] = typedModule.mapExhibitors;
    updateMapExhibitorBooths(
      conferenceId,
      typedModule.mapExhibitors[0],
      "exhibitors",
    );
  }
});

// Track the newest supplemental file timestamp token per conference.
export const SESSION_SUPPLEMENTAL_TOKEN: Record<string, string> = {};
export const EXHIBITOR_SUPPLEMENTAL_TOKEN: Record<string, string> = {};

// Override with supplemental session files (e.g. seapac-2026-sesssion-20260227.ts).
// Sorting paths ensures the alphabetically last (= most recent timestamp) wins when
// multiple supplemental files exist for the same conference.
const supplementalSessionModules = import.meta.glob("../data/*-session-*.ts", {
  eager: true,
});
Object.keys(supplementalSessionModules)
  .sort()
  .forEach((path) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    const conferenceIdMatch = filename.match(/^(.+)-session-/);
    if (conferenceIdMatch) {
      const conferenceId = conferenceIdMatch[1];
      const typedModule = supplementalSessionModules[path] as ConferenceModule;
      if (typedModule.mapSessions) {
        SESSION_DATA[conferenceId] = normalizeSessions(typedModule.mapSessions[1]);
        updateMapSessionRooms(conferenceId, typedModule.mapSessions[0], "sessions", true);
        const conf = allConferences.find((c) => c.id === conferenceId);
        if (conf) warnOutOfRangeSessions(conferenceId, SESSION_DATA[conferenceId], conf);
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
      const typedModule = supplementalExhibitorModules[
        path
      ] as ConferenceModule;
      if (typedModule.mapExhibitors) {
        EXHIBITOR_DATA[conferenceId] = typedModule.mapExhibitors;
        updateMapExhibitorBooths(
          conferenceId,
          typedModule.mapExhibitors[0],
          "exhibitors",
          true,
        );
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

// Emit warnings for any map data that still has an empty array after all base
// and supplemental files have been loaded.  Checking here (rather than inside
// the loading loops above) avoids false positives when a base file ships a
// placeholder empty array that a supplemental file later fills in.
Object.entries(SESSION_DATA).forEach(([conferenceId, sessions]) => {
  const url =
    allConferences.find((c) => c.id === conferenceId)?.mapSessionRooms?.[0] ??
    "";
  warnEmptyMapData(conferenceId, "mapSessions", url, sessions);
});
Object.entries(ROOM_DATA).forEach(([conferenceId, [url, rooms]]) => {
  warnEmptyMapData(conferenceId, "mapRooms", url, rooms);
});
Object.entries(BOOTH_DATA).forEach(([conferenceId, [url, booths]]) => {
  warnEmptyMapData(conferenceId, "mapBooths", url, booths);
});
Object.entries(EXHIBITOR_DATA).forEach(([conferenceId, [url, exhibitors]]) => {
  warnEmptyMapData(conferenceId, "mapExhibitors", url, exhibitors);
});
