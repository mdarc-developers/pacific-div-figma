import { Session, MapImage, Room, Booth, Exhibitor } from "@/types/conference";
import { conferenceModules } from "@/lib/conferenceData";
import {
  resolveSessionEndTime,
  warnOutOfRangeSessions,
  warnEmptyMapData,
} from "@/lib/overrideUtils";
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
  if (!conf.mapSessionRooms) {
    conf.mapSessionRooms = [];
  }
  let entry = conf.mapSessionRooms.find((t) => t[0] === url);
  if (!entry) {
    entry = [url, false, false];
    conf.mapSessionRooms.push(entry);
  }
  if (type === "sessions") {
    if (entry[1] && !isSupplemental) {
      throw new Error(
        `mapSessions already loaded for conference "${conferenceId}" URL "${url}"`,
      );
    }
    entry[1] = true;
  } else {
    if (entry[2] && !isSupplemental) {
      throw new Error(
        `mapRooms already loaded for conference "${conferenceId}" URL "${url}"`,
      );
    }
    entry[2] = true;
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
  if (!conf.mapExhibitorBooths) {
    conf.mapExhibitorBooths = [];
  }
  let entry = conf.mapExhibitorBooths.find((t) => t[0] === url);
  if (!entry) {
    entry = [url, false, false];
    conf.mapExhibitorBooths.push(entry);
  }
  if (type === "exhibitors") {
    if (entry[1] && !isSupplemental) {
      throw new Error(
        `mapExhibitors already loaded for conference "${conferenceId}" URL "${url}"`,
      );
    }
    entry[1] = true;
  } else {
    if (entry[2] && !isSupplemental) {
      throw new Error(
        `mapBooths already loaded for conference "${conferenceId}" URL "${url}"`,
      );
    }
    entry[2] = true;
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
// ROOM_DATA holds an array of [mapUrl, rooms] tuples per conference so that
// multiple room files (e.g. a base file + a supplemental file with a different
// map URL) can all be rendered side-by-side on their respective map images.
export const ROOM_DATA: Record<string, [string, Room[]][]> = {};
// BOOTH_DATA holds an array of [mapUrl, booths] tuples per conference so that
// multiple booth files (e.g. a base file + a supplemental file with a different
// map URL) can all be rendered side-by-side on their respective map images.
export const BOOTH_DATA: Record<string, [string, Booth[]][]> = {};
export const EXHIBITOR_DATA: Record<string, [string, Exhibitor[]]> = {};
Object.entries(conferenceModules).forEach(([path, module]) => {
  const conferenceId = path.split("/").pop()?.replace(".ts", "") || "";
  const typedModule = module as ConferenceModule;
  if (typedModule.mapSessions) {
    SESSION_DATA[conferenceId] = normalizeSessions(typedModule.mapSessions[1]);
    updateMapSessionRooms(conferenceId, typedModule.mapSessions[0], "sessions");
    const conf = allConferences.find((c) => c.id === conferenceId);
    if (conf)
      warnOutOfRangeSessions(conferenceId, SESSION_DATA[conferenceId], conf);
  }
  if (typedModule.conferenceMaps) {
    MAP_DATA[conferenceId] = typedModule.conferenceMaps;
  }
  if (typedModule.mapRooms) {
    if (!ROOM_DATA[conferenceId]) ROOM_DATA[conferenceId] = [];
    ROOM_DATA[conferenceId].push(typedModule.mapRooms);
    updateMapSessionRooms(conferenceId, typedModule.mapRooms[0], "rooms");
  }
  if (typedModule.mapBooths) {
    if (!BOOTH_DATA[conferenceId]) BOOTH_DATA[conferenceId] = [];
    BOOTH_DATA[conferenceId].push(typedModule.mapBooths);
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
export const BOOTH_SUPPLEMENTAL_TOKEN: Record<string, string> = {};
export const ROOM_SUPPLEMENTAL_TOKEN: Record<string, string> = {};

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
        SESSION_DATA[conferenceId] = normalizeSessions(
          typedModule.mapSessions[1],
        );
        updateMapSessionRooms(
          conferenceId,
          typedModule.mapSessions[0],
          "sessions",
          true,
        );
        const conf = allConferences.find((c) => c.id === conferenceId);
        if (conf)
          warnOutOfRangeSessions(
            conferenceId,
            SESSION_DATA[conferenceId],
            conf,
          );
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

// Load supplemental booth files (e.g. hamcation-2026-booth-20260302.ts).
// These may use a different map URL than the base conference file — each is
// appended to BOOTH_DATA as a new [url, booths] tuple so that all booth maps
// are rendered side-by-side.  Sorting ensures the most-recent timestamp wins
// when multiple supplemental files target the same conference + URL.
const supplementalBoothModules = import.meta.glob(
  "../data/*-booth-*.ts",
  { eager: true }
);
Object.keys(supplementalBoothModules)
  .sort()
  .forEach((path) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    const match = filename.match(/^(.+)-booth-/);
    if (match) {
      const conferenceId = match[1];
      const typedModule = supplementalBoothModules[path] as ConferenceModule;
      if (typedModule.mapBooths) {
        if (!BOOTH_DATA[conferenceId]) BOOTH_DATA[conferenceId] = [];
        BOOTH_DATA[conferenceId].push(typedModule.mapBooths);
        updateMapExhibitorBooths(
          conferenceId,
          typedModule.mapBooths[0],
          "booths",
          true,
        );
        const token = filename.split("-").pop() ?? "";
        if (token && token > (BOOTH_SUPPLEMENTAL_TOKEN[conferenceId] ?? "")) {
          BOOTH_SUPPLEMENTAL_TOKEN[conferenceId] = token;
        }
      }
    }
  });

// Load supplemental room files (e.g. pacificon-2026-room-20260302.ts).
// These may use a different map URL than the base conference file — each is
// appended to ROOM_DATA as a new [url, rooms] tuple so that all room maps
// are rendered side-by-side.  Sorting ensures the most-recent timestamp wins
// when multiple supplemental files target the same conference + URL.
const supplementalRoomModules = import.meta.glob(
  "../data/*-room-*.ts",
  { eager: true }
);
Object.keys(supplementalRoomModules)
  .sort()
  .forEach((path) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    const match = filename.match(/^(.+)-room-/);
    if (match) {
      const conferenceId = match[1];
      const typedModule = supplementalRoomModules[path] as ConferenceModule;
      if (typedModule.mapRooms) {
        if (!ROOM_DATA[conferenceId]) ROOM_DATA[conferenceId] = [];
        ROOM_DATA[conferenceId].push(typedModule.mapRooms);
        updateMapSessionRooms(
          conferenceId,
          typedModule.mapRooms[0],
          "rooms",
          true,
        );
        const token = filename.split("-").pop() ?? "";
        if (token && token > (ROOM_SUPPLEMENTAL_TOKEN[conferenceId] ?? "")) {
          ROOM_SUPPLEMENTAL_TOKEN[conferenceId] = token;
        }
      }
    }
  });

// Emit warnings for any map data that still has an empty array after all base
// and supplemental files have been loaded.  Checking here (rather than inside
// the loading loops above) avoids false positives when a base file ships a
// placeholder empty array that a supplemental file later fills in.
Object.entries(SESSION_DATA).forEach(([conferenceId, sessions]) => {
  const conf = allConferences.find((c) => c.id === conferenceId);
  const url = conf?.mapSessionRooms?.find((t) => t[1])?.[0] ?? "";
  warnEmptyMapData(conferenceId, "mapSessions", url, sessions);
});
Object.entries(ROOM_DATA).forEach(([conferenceId, entries]) => {
  entries.forEach(([url, rooms]) => {
    warnEmptyMapData(conferenceId, "mapRooms", url, rooms);
  });
});
Object.entries(BOOTH_DATA).forEach(([conferenceId, entries]) => {
  entries.forEach(([url, booths]) => {
    warnEmptyMapData(conferenceId, "mapBooths", url, booths);
  });
});
Object.entries(EXHIBITOR_DATA).forEach(([conferenceId, [url, exhibitors]]) => {
  warnEmptyMapData(conferenceId, "mapExhibitors", url, exhibitors);
});
