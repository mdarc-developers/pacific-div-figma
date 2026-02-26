import { describe, it, expect } from "vitest";
import { conferenceMaps, mapRooms } from "./pacificon-2026";
import { MapImage, Room } from "@/types/conference";
//import { Booth, Session, Exhibitor, MapImage, Room } from '@/types/conference';

//interface MapsModule {
//  conferenceMaps?: MapImage[];
//  [key: string]: unknown;
//}
//
//interface RoomModule {
//  mapRooms?: [string, Room[]];
//  [key: string]: unknown;
//}
//
//interface SessionModule {
//  mapSessions?: [string, Session[]];
//  [key: string]: unknown;
//}
//
//interface BoothModule {
//  mapBooths?: [string, Booth[]];
//  [key: string]: unknown;
//}
//
//interface ExhibitorModule {
//  mapExhibitors?: Exhibitor[];
//  [key: string]: unknown;
//}
//
//const conferenceModules = import.meta.glob('../../data/*-2026.ts', { eager: true });
//Object.entries(conferenceModules).forEach(([path, module]) => {
//  // Extract the conference ID from the file path
//  // e.g., "../../data/pacificon-2026.ts" -> "pacificon-2026"
//  const conferenceId = path.split('/').pop()?.replace('.ts', '') || '';
//});

describe("pacificon-2026 conferenceMaps export", () => {
  it("exports a non-empty MapImage array", () => {
    expect(Array.isArray(conferenceMaps)).toBe(true);
    expect(conferenceMaps.length).toBeGreaterThan(0);
  });

  it("each entry has required MapImage fields", () => {
    conferenceMaps.forEach((map: MapImage) => {
      expect(typeof map.id).toBe("string");
      expect(typeof map.name).toBe("string");
      expect(typeof map.url).toBe("string");
      expect(typeof map.order).toBe("number");
    });
  });

  it("entries with origHeightNum also have origWidthNum", () => {
    conferenceMaps.forEach((map: MapImage) => {
      if (map.origHeightNum !== undefined) {
        expect(map.origWidthNum).toBeDefined();
        expect(map.origWidthNum).toBeGreaterThan(0);
      }
    });
  });
});

describe("pacificon-2026 mapRooms export", () => {
  it("exports a [url, Room[]] tuple", () => {
    const [url, rooms] = mapRooms;
    expect(typeof url).toBe("string");
    expect(url.length).toBeGreaterThan(0);
    expect(Array.isArray(rooms)).toBe(true);
  });

  it("each room has name, coords, and color", () => {
    const [, rooms] = mapRooms;
    rooms.forEach((room: Room) => {
      expect(typeof room.name).toBe("string");
      expect(room.name.length).toBeGreaterThan(0);
      expect(Array.isArray(room.coords)).toBe(true);
      expect(room.coords.length).toBeGreaterThan(0);
      expect(typeof room.color).toBe("string");
    });
  });

  it("mapRooms URL exists in conferenceMaps", () => {
    const [forumUrl] = mapRooms;
    const matchingMap = conferenceMaps.find(
      (m: MapImage) => m.url === forumUrl,
    );
    expect(
      matchingMap,
      `mapRooms URL "${forumUrl}" must match an entry in conferenceMaps`,
    ).toBeDefined();
  });

  it("the matching conferenceMaps entry has origHeightNum and origWidthNum for Leaflet", () => {
    const [forumUrl] = mapRooms;
    const matchingMap = conferenceMaps.find(
      (m: MapImage) => m.url === forumUrl,
    );
    expect(matchingMap?.origHeightNum).toBeGreaterThan(0);
    expect(matchingMap?.origWidthNum).toBeGreaterThan(0);
  });
});
