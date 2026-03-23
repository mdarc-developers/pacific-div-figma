import { Session, MapImage, Room, Booth, Exhibitor } from "@/types/conference";
import {
  resolveSessionEndTime,
  warnOutOfRangeSessions,
} from "@/lib/overrideUtils";
import { allConferences } from "@/data/all-conferences";

// Import all conference data files at once using Vite's glob import
export const conferenceModules = import.meta.glob("../data/*-20[0-9][0-9].ts", {
  eager: true,
});

export interface ConferenceModule {
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
export function updateMapSessionRooms(
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
export function updateMapExhibitorBooths(
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

// Normalize session end times so sessions with missing or invalid endTimes
// are displayed with a sensible 1-hour default instead of "Invalid Date".
export function normalizeSessions(sessions: Session[]): Session[] {
  return sessions.map((s) => ({
    ...s,
    endTime: resolveSessionEndTime(s.startTime, s.endTime),
  }));
}

export const SESSION_DATA: Record<string, Session[]> = {};
export const MAP_DATA: Record<string, MapImage[]> = {};
// ROOM_DATA holds an array of [mapUrl, rooms] tuples per conference so that
// multiple room files (e.g. a base file + a supplemental file with a different
// map URL) can all be rendered side-by-side on their respective map images.
export const ROOM_DATA: Record<string, [string, Room[]][]> = {};
// BOOTH_DATA holds an array of [mapUrl, booths] tuples per conference so that
// multiple booth files (e.g. a base file + a supplemental file with a different
// map URL) can all be rendered side-by-side on their respective map images.
export const BOOTH_DATA: Record<string, [string, Booth[]][]> = {};
// EXHIBITOR_DATA holds an array of [mapUrl, exhibitors] tuples per conference so
// that multiple exhibitor map files can all be rendered side-by-side.
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
