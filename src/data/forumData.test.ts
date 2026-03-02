import { describe, it, expect } from "vitest";
import { MapImage, Room, Session, Exhibitor, Booth } from "@/types/conference";
import { conferenceModules } from "@/lib/conferenceData";

interface ConferenceModule {
  conferenceMaps?: MapImage[];
  mapRooms?: [string, Room[]];
  mapSessions?: [string, Session[]];
  mapExhibitors?: [string, Exhibitor[]];
  mapBooths?: [string, Booth[]];
}

// Derive the conference list from the glob-based registry in src/lib/conferenceData.ts
const CONFERENCE_MODULES: [string, ConferenceModule][] = Object.entries(
  conferenceModules,
).map(([path, module]) => {
  const confId = path.split("/").pop()?.replace(".ts", "") ?? "";
  return [confId, module as ConferenceModule];
});

// Supplemental session files: URL must match the base conference's mapRooms URL.
// Uses the same glob pattern as sessionData.ts.
const supplementalSessionModules = import.meta.glob("./*-session-*.ts", {
  eager: true,
}) as Record<string, ConferenceModule>;

// Supplemental exhibitor files: URL must match the base conference's mapBooths URL.
// Uses the same glob pattern as sessionData.ts.
const supplementalExhibitorModules = import.meta.glob("./*-exhibitor-*.ts", {
  eager: true,
}) as Record<string, ConferenceModule>;

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

  // Supplemental session files must also use the same URL as the base conference's mapRooms.
  Object.entries(supplementalSessionModules).forEach(([path, module]) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    // The regex matches both "session" and "sesssion" (triple-s typo in first file).
    const match = filename.match(/^(.+)-sess.*ion-/);
    if (!match || !module.mapSessions) return;
    const confId = match[1];
    const baseEntry = CONFERENCE_MODULES.find(([id]) => id === confId);
    if (!baseEntry?.[1]?.mapRooms) return;
    it(`${filename}: mapSessions URL matches ${confId} mapRooms URL`, () => {
      expect(module.mapSessions![0]).toBe(baseEntry[1].mapRooms![0]);
    });
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

  // Supplemental exhibitor files must also use the same URL as the base conference's mapBooths.
  Object.entries(supplementalExhibitorModules).forEach(([path, module]) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    const match = filename.match(/^(.+)-exhibitor-/);
    if (!match || !module.mapExhibitors) return;
    const confId = match[1];
    const baseEntry = CONFERENCE_MODULES.find(([id]) => id === confId);
    if (!baseEntry?.[1]?.mapBooths) return;
    it(`${filename}: mapExhibitors URL matches ${confId} mapBooths URL`, () => {
      expect(module.mapExhibitors![0]).toBe(baseEntry[1].mapBooths![0]);
    });
  });
});
