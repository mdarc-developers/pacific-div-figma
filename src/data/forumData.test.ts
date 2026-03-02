import { describe, it, expect } from "vitest";
import { MapImage, Room, Session, Exhibitor, Booth } from "@/types/conference";

// ── conference data files ────────────────────────────────────────────────────
import * as yuma2026 from "./yuma-2026";
import * as hamvention2026 from "./hamvention-2026";
import * as pacificon2026 from "./pacificon-2026";
import * as seapac2026 from "./seapac-2026";
import * as huntsville2026 from "./huntsville-hamfest-2026";
import * as hamcation2026 from "./hamcation-2026";
import * as hamcation2027 from "./hamcation-2027";
import * as quartzfest2027 from "./quartzfest-2027";
import * as yuma2027 from "./yuma-2027";

// ── supplemental data files ──────────────────────────────────────────────────
import { mapSessions as seapacSupSessions } from "./seapac-2026-session-20260227";
import { mapSessions as quartzfestSupSessions } from "./quartzfest-2027-session-20260218";
import { mapExhibitors as hamcation2026SupExhibitors } from "./hamcation-2026-exhibitor-20260301";

interface ConferenceModule {
  conferenceMaps?: MapImage[];
  mapRooms?: [string, Room[]];
  mapSessions?: [string, Session[]];
  mapExhibitors?: [string, Exhibitor[]];
  mapBooths?: [string, Booth[]];
}

const CONFERENCE_MODULES: [string, ConferenceModule][] = [
  ["yuma-2026", yuma2026],
  ["hamvention-2026", hamvention2026],
  ["pacificon-2026", pacificon2026],
  ["seapac-2026", seapac2026],
  ["huntsville-hamfest-2026", huntsville2026],
  ["hamcation-2026", hamcation2026],
  ["hamcation-2027", hamcation2027],
  ["quartzfest-2027", quartzfest2027],
  ["yuma-2027", yuma2027],
];

// ── conferenceMaps shape ──────────────────────────────────────────────────────
describe("conferenceMaps export", () => {
  CONFERENCE_MODULES.forEach(([confId, mod]) => {
    describe(confId, () => {
      it("exports a non-empty MapImage array", () => {
        expect(mod.conferenceMaps).toBeDefined();
        expect(Array.isArray(mod.conferenceMaps)).toBe(true);
        expect(mod.conferenceMaps!.length).toBeGreaterThan(0);
      });

      it("each entry has required MapImage fields", () => {
        mod.conferenceMaps!.forEach((map: MapImage) => {
          expect(typeof map.id).toBe("string");
          expect(typeof map.name).toBe("string");
          expect(typeof map.url).toBe("string");
          expect(typeof map.order).toBe("number");
        });
      });

      it("entries with origHeightNum also have origWidthNum", () => {
        mod.conferenceMaps!.forEach((map: MapImage) => {
          if (map.origHeightNum !== undefined) {
            expect(
              map.origWidthNum,
              `${confId}: map "${map.id}" has origHeightNum but missing origWidthNum`,
            ).toBeDefined();
            expect(map.origWidthNum).toBeGreaterThan(0);
          }
        });
      });
    });
  });
});

// ── mapRooms shape ────────────────────────────────────────────────────────────
describe("mapRooms export", () => {
  CONFERENCE_MODULES.forEach(([confId, mod]) => {
    if (!mod.mapRooms) return;
    describe(confId, () => {
      it("exports a [url, Room[]] tuple", () => {
        const [url, rooms] = mod.mapRooms!;
        expect(typeof url).toBe("string");
        expect(url.length).toBeGreaterThan(0);
        expect(Array.isArray(rooms)).toBe(true);
      });

      it("each room has name, coords, and color", () => {
        const [, rooms] = mod.mapRooms!;
        rooms.forEach((room: Room) => {
          expect(typeof room.name).toBe("string");
          expect(room.name.length).toBeGreaterThan(0);
          expect(Array.isArray(room.coords)).toBe(true);
          expect(room.coords.length).toBeGreaterThan(0);
          expect(typeof room.color).toBe("string");
        });
      });

      it("mapRooms URL exists in conferenceMaps", () => {
        const [roomUrl] = mod.mapRooms!;
        const matchingMap = mod.conferenceMaps?.find(
          (m: MapImage) => m.url === roomUrl,
        );
        expect(
          matchingMap,
          `${confId}: mapRooms URL "${roomUrl}" must match an entry in conferenceMaps`,
        ).toBeDefined();
      });

      it("the matching conferenceMaps entry has origHeightNum and origWidthNum for Leaflet", () => {
        const [roomUrl] = mod.mapRooms!;
        const matchingMap = mod.conferenceMaps?.find(
          (m: MapImage) => m.url === roomUrl,
        );
        expect(
          matchingMap?.origHeightNum,
          `${confId}: conferenceMaps entry for mapRooms URL missing origHeightNum`,
        ).toBeGreaterThan(0);
        expect(
          matchingMap?.origWidthNum,
          `${confId}: conferenceMaps entry for mapRooms URL missing origWidthNum`,
        ).toBeGreaterThan(0);
      });
    });
  });
});

// ── URL pair: mapSessions[0] must equal mapRooms[0] ──────────────────────────
describe("mapSessions URL matches mapRooms URL", () => {
  CONFERENCE_MODULES.forEach(([confId, mod]) => {
    if (!mod.mapSessions || !mod.mapRooms) return;
    it(`${confId}: mapSessions and mapRooms share the same map URL`, () => {
      expect(mod.mapSessions![0]).toBe(mod.mapRooms![0]);
    });
  });

  it("seapac-2026-session supplemental: mapSessions URL matches seapac-2026 mapRooms URL", () => {
    expect(seapacSupSessions[0]).toBe(seapac2026.mapRooms![0]);
  });

  it("quartzfest-2027-session supplemental: mapSessions URL matches quartzfest-2027 mapRooms URL", () => {
    expect(quartzfestSupSessions[0]).toBe(quartzfest2027.mapRooms![0]);
  });
});

// ── URL pair: mapExhibitors[0] must equal mapBooths[0] ───────────────────────
describe("mapExhibitors URL matches mapBooths URL", () => {
  CONFERENCE_MODULES.forEach(([confId, mod]) => {
    if (!mod.mapExhibitors || !mod.mapBooths) return;
    it(`${confId}: mapExhibitors and mapBooths share the same map URL`, () => {
      expect(mod.mapExhibitors![0]).toBe(mod.mapBooths![0]);
    });
  });

  it("hamcation-2026-exhibitor supplemental: mapExhibitors URL matches hamcation-2026 mapBooths URL", () => {
    expect(hamcation2026SupExhibitors[0]).toBe(hamcation2026.mapBooths![0]);
  });
});
