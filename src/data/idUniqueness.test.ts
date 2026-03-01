import { describe, it, expect } from "vitest";
import {
  Session,
  Prize,
  PrizeWinner,
  Exhibitor,
  Booth,
  MapImage,
  Room,
  UserProfile,
} from "@/types/conference";

// ── conference data files ────────────────────────────────────────────────────
import * as yuma2026 from "./yuma-2026";
import * as hamvention2026 from "./hamvention-2026";
import * as pacificon2026 from "./pacificon-2026";
import * as seapac2026 from "./seapac-2026";
import * as huntsville2026 from "./huntsville-hamfest-2026";
import * as hamcation2026 from "./hamcation-2026";
import * as hamcation2027 from "./hamcation-2027";
import * as quartzfest2027 from "./quartzfest-2027";

// ── supplemental data files ──────────────────────────────────────────────────
import { mapSessions as seapacSessions } from "./seapac-2026-session-20260227";
import { samplePrizes as yumaSupPrizes } from "./yuma-2026-prize-20260227T132422";
import { samplePrizeWinners as yumaSupWinners } from "./yuma-2026-prizewinner-20260227T132422";
import { sampleAttendees as quartzfestSupAttendees } from "./quartzfest-2027-userprofile-20260301";

// ── helper ───────────────────────────────────────────────────────────────────
function findDuplicates(ids: (string | number)[]): (string | number)[] {
  const seen = new Set<string | number>();
  const dupes = new Set<string | number>();
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  return [...dupes];
}

interface ConferenceModule {
  samplePrizes?: Prize[];
  samplePrizeWinners?: PrizeWinner[];
  mapExhibitors?: [string, Exhibitor[]];
  mapBooths?: [string, Booth[]];
  mapRooms?: [string, Room[]];
  mapSessions?: [string, Session[]];
  conferenceMaps?: MapImage[];
  sampleAttendees?: UserProfile[];
}

// All main conference modules with their conference ids
const CONFERENCE_MODULES: [string, ConferenceModule][] = [
  ["yuma-2026", yuma2026],
  ["hamvention-2026", hamvention2026],
  ["pacificon-2026", pacificon2026],
  ["seapac-2026", seapac2026],
  ["huntsville-hamfest-2026", huntsville2026],
  ["hamcation-2026", hamcation2026],
  ["hamcation-2027", hamcation2027],
  ["quartzfest-2027", quartzfest2027],
];

// ── session IDs ───────────────────────────────────────────────────────────────
describe("session id uniqueness", () => {
  CONFERENCE_MODULES.forEach(([confId, mod]) => {
    it(`${confId}: session ids are unique`, () => {
      const sessions = mod.mapSessions?.[1] ?? [];
      const ids = sessions.map((s) => s.id);
      expect(findDuplicates(ids), `Duplicate session ids in ${confId}`).toEqual(
        [],
      );
    });
  });

  it("seapac-2026-session supplemental: session ids are unique", () => {
    const ids = seapacSessions[1].map((s) => s.id);
    expect(findDuplicates(ids)).toEqual([]);
  });
});

// ── prize IDs ────────────────────────────────────────────────────────────────
describe("prize id uniqueness", () => {
  CONFERENCE_MODULES.forEach(([confId, mod]) => {
    it(`${confId}: prize ids are unique`, () => {
      const prizes = mod.samplePrizes ?? [];
      const ids = prizes.map((p) => p.id);
      expect(findDuplicates(ids), `Duplicate prize ids in ${confId}`).toEqual(
        [],
      );
    });
  });

  it("yuma-2026-prize supplemental: prize ids are unique", () => {
    const ids = yumaSupPrizes.map((p) => p.id);
    expect(findDuplicates(ids)).toEqual([]);
  });
});

// ── prizewinner IDs ───────────────────────────────────────────────────────────
describe("prizewinner id uniqueness", () => {
  CONFERENCE_MODULES.forEach(([confId, mod]) => {
    it(`${confId}: prizewinner ids are unique`, () => {
      const winners = mod.samplePrizeWinners ?? [];
      const ids = winners.map((w) => w.id);
      expect(
        findDuplicates(ids),
        `Duplicate prizewinner ids in ${confId}`,
      ).toEqual([]);
    });
  });

  it("yuma-2026-prizewinner supplemental: prizewinner ids are unique", () => {
    const ids = yumaSupWinners.map((w) => w.id);
    expect(findDuplicates(ids)).toEqual([]);
  });
});

// ── exhibitor IDs ────────────────────────────────────────────────────────────
describe("exhibitor id uniqueness", () => {
  CONFERENCE_MODULES.forEach(([confId, mod]) => {
    it(`${confId}: exhibitor ids are unique`, () => {
      const exhibitors = mod.mapExhibitors?.[1] ?? [];
      const ids = exhibitors.map((e) => e.id);
      expect(
        findDuplicates(ids),
        `Duplicate exhibitor ids in ${confId}`,
      ).toEqual([]);
    });
  });
});

// ── booth IDs ────────────────────────────────────────────────────────────────
describe("booth id uniqueness", () => {
  CONFERENCE_MODULES.forEach(([confId, mod]) => {
    it(`${confId}: booth ids are unique`, () => {
      const booths = mod.mapBooths?.[1] ?? [];
      const ids = booths.map((b) => b.id);
      expect(findDuplicates(ids), `Duplicate booth ids in ${confId}`).toEqual(
        [],
      );
    });
  });
});

// ── room names ───────────────────────────────────────────────────────────────
describe("room name uniqueness", () => {
  CONFERENCE_MODULES.forEach(([confId, mod]) => {
    it(`${confId}: room names are unique`, () => {
      const rooms = mod.mapRooms?.[1] ?? [];
      const names = rooms.map((r) => r.name);
      expect(
        findDuplicates(names),
        `Duplicate room names in ${confId}`,
      ).toEqual([]);
    });
  });
});

// ── mapimage IDs ──────────────────────────────────────────────────────────────
describe("mapimage id uniqueness", () => {
  CONFERENCE_MODULES.forEach(([confId, mod]) => {
    it(`${confId}: mapimage ids are unique`, () => {
      const maps = mod.conferenceMaps ?? [];
      const ids = maps.map((m) => m.id);
      expect(
        findDuplicates(ids),
        `Duplicate mapimage ids in ${confId}`,
      ).toEqual([]);
    });
  });
});

// ── userprofile UIDs ──────────────────────────────────────────────────────────
describe("userprofile uid uniqueness", () => {
  CONFERENCE_MODULES.forEach(([confId, mod]) => {
    it(`${confId}: userprofile uids are unique`, () => {
      const attendees = mod.sampleAttendees ?? [];
      const uids = attendees.map((u) => u.uid);
      expect(
        findDuplicates(uids),
        `Duplicate userprofile uids in ${confId}`,
      ).toEqual([]);
    });
  });

  it("quartzfest-2027-userprofile supplemental: userprofile uids are unique", () => {
    const uids = quartzfestSupAttendees.map((a) => a.uid);
    expect(findDuplicates(uids)).toEqual([]);
  });
});

// ── locationZone migration: Exhibitor → Booth ─────────────────────────────────
// locationZone was removed from Exhibitor and is now required on Booth.
// These tests verify that old data has been fully migrated.
describe("locationZone migration (Exhibitor → Booth)", () => {
  CONFERENCE_MODULES.forEach(([confId, mod]) => {
    it(`${confId}: no exhibitor has locationZone (field belongs on Booth)`, () => {
      const exhibitors = mod.mapExhibitors?.[1] ?? [];
      exhibitors.forEach((ex) => {
        expect(
          "locationZone" in ex,
          `${confId}: exhibitor '${ex.id}' still has locationZone — move it to the corresponding Booth`,
        ).toBe(false);
      });
    });
  });

  CONFERENCE_MODULES.forEach(([confId, mod]) => {
    it(`${confId}: every booth has locationZone`, () => {
      const booths = mod.mapBooths?.[1] ?? [];
      booths.forEach((b) => {
        expect(
          typeof b.locationZone,
          `${confId}: booth ${b.id} is missing locationZone`,
        ).toBe("string");
      });
    });
  });
});
