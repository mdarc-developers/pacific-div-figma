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
import { conferenceModules } from "@/lib/conferenceData";

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
  mapUserProfiles?: UserProfile[];
}

// Derive the conference list from the glob-based registry in src/lib/conferenceData.ts
const CONFERENCE_MODULES: [string, ConferenceModule][] = Object.entries(
  conferenceModules,
).map(([path, module]) => {
  const confId = path.split("/").pop()?.replace(".ts", "") ?? "";
  return [confId, module as ConferenceModule];
});

// Supplemental data files loaded via glob (mirrors the patterns used in src/lib/)
const supplementalSessionModules = import.meta.glob("./*-session-*.ts", {
  eager: true,
}) as Record<string, ConferenceModule>;

const supplementalPrizeModules = import.meta.glob("./*-prize-*.ts", {
  eager: true,
}) as Record<string, ConferenceModule>;

const supplementalPrizeWinnerModules = import.meta.glob(
  "./*-prizewinner-*.ts",
  { eager: true },
) as Record<string, ConferenceModule>;

const supplementalAttendeeModules = import.meta.glob("./*-userprofile-*.ts", {
  eager: true,
}) as Record<string, ConferenceModule>;

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

  Object.entries(supplementalSessionModules).forEach(([path, module]) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    if (!module.mapSessions) return;
    it(`${filename} supplemental: session ids are unique`, () => {
      const ids = module.mapSessions![1].map((s: Session) => s.id);
      expect(findDuplicates(ids)).toEqual([]);
    });
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

  Object.entries(supplementalPrizeModules).forEach(([path, module]) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    if (!module.samplePrizes) return;
    it(`${filename} supplemental: prize ids are unique`, () => {
      const ids = module.samplePrizes!.map((p: Prize) => p.id);
      expect(findDuplicates(ids)).toEqual([]);
    });
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

  Object.entries(supplementalPrizeWinnerModules).forEach(([path, module]) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    if (!module.samplePrizeWinners) return;
    it(`${filename} supplemental: prizewinner ids are unique`, () => {
      const ids = module.samplePrizeWinners!.map((w: PrizeWinner) => w.id);
      expect(findDuplicates(ids)).toEqual([]);
    });
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
      const attendees = mod.mapUserProfiles ?? [];
      const uids = attendees.map((u) => u.uid);
      expect(
        findDuplicates(uids),
        `Duplicate userprofile uids in ${confId}`,
      ).toEqual([]);
    });
  });

  Object.entries(supplementalAttendeeModules).forEach(([path, module]) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    if (!module.mapUserProfiles) return;
    it(`${filename} supplemental: userprofile uids are unique`, () => {
      const uids = module.mapUserProfiles!.map((a: UserProfile) => a.uid);
      expect(findDuplicates(uids)).toEqual([]);
    });
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
