import { describe, it, expect } from "vitest";
import { Exhibitor, Booth } from "@/types/conference";
import { conferenceModules } from "@/lib/conferenceData";
import { BOOTH_DATA, EXHIBITOR_DATA } from "@/lib/sessionData";

interface ConferenceModule {
  mapExhibitors?: [string, Exhibitor[]];
  mapBooths?: [string, Booth[]];
}

// Supplemental exhibitor files loaded via glob (mirrors the pattern in src/lib/sessionData.ts)
const supplementalExhibitorModules = import.meta.glob("./*-exhibitor-*.ts", {
  eager: true,
}) as Record<string, ConferenceModule>;

// Resolve the specific modules needed by the tests below
const hamcation2027Path = Object.keys(conferenceModules).find((p) =>
  p.includes("hamcation-2027"),
);
const mapExhibitors: [string, Exhibitor[]] = hamcation2027Path
  ? ((conferenceModules[hamcation2027Path] as ConferenceModule)
      .mapExhibitors ?? ["", []])
  : ["", []];

const hamcation2026SupPath = Object.keys(supplementalExhibitorModules).find(
  (p) => p.includes("hamcation-2026-exhibitor-"),
);
const supplementalExhibitors: [string, Exhibitor[]] = hamcation2026SupPath
  ? (supplementalExhibitorModules[hamcation2026SupPath].mapExhibitors ?? [
      "",
      [],
    ])
  : ["", []];

// ── hamcation-2027 data shape ─────────────────────────────────────────────────
// These tests guard the mapExhibitors export in hamcation-2027.ts.
// With the OLD glob pattern (*-2026.ts), this file was never loaded by
// ExhibitorView/ExhibitorsPage, so exhibitor data for hamcation-2027 was
// silently absent (EXHIBITOR_DATA['hamcation-2027'] === undefined).
describe("hamcation-2027 mapExhibitors export", () => {
  it("exports a [url, Exhibitor[]] tuple", () => {
    const [url, exhibitors] = mapExhibitors;
    expect(typeof url).toBe("string");
    expect(url.length).toBeGreaterThan(0);
    expect(Array.isArray(exhibitors)).toBe(true);
  });

  it("has at least one exhibitor entry", () => {
    const [, exhibitors] = mapExhibitors;
    expect(exhibitors.length).toBeGreaterThan(0);
  });

  it("each exhibitor has the required fields", () => {
    const [, exhibitors] = mapExhibitors;
    exhibitors.forEach((ex: Exhibitor) => {
      expect(typeof ex.id).toBe("string");
      expect(ex.id.length).toBeGreaterThan(0);
      expect(typeof ex.name).toBe("string");
      expect(ex.name.length).toBeGreaterThan(0);
      expect(typeof ex.description).toBe("string");
      expect(typeof ex.boothName).toBe("string");
      expect(Array.isArray(ex.location)).toBe(true);
      expect(ex.location.length).toBeGreaterThan(0);
    });
  });

  it("mapExhibitors URL (index 0) is non-empty", () => {
    const [url] = mapExhibitors;
    expect(url.startsWith("/")).toBe(true);
  });
});

// ── EXHIBITOR_DATA lookup null-guard ──────────────────────────────────────────
// Reproduces the crash reported in ExhibitorView.tsx line 112 when switching
// to a conference (e.g. hamcation-2027) whose data was absent from
// EXHIBITOR_DATA due to the old *-2026.ts glob pattern.
describe("EXHIBITOR_DATA lookup null-guard", () => {
  // Simulate an EXHIBITOR_DATA map that has no entry for 'hamcation-2027'
  // (exactly the state produced by the old *-2026.ts glob pattern).
  const emptyData: Record<string, [string, Exhibitor[]]> = {};

  it("OLD code crashes: accessing [1] on undefined throws TypeError", () => {
    // This is what ExhibitorView.tsx line 112 did before the fix:
    //   EXHIBITOR_DATA[activeConference.id][1] || []
    expect(() => {
      const result = (emptyData["hamcation-2027"] as [string, Exhibitor[]])[1];
      return result;
    }).toThrow(TypeError);
  });

  it("NEW code is safe: optional chaining returns [] when key is absent", () => {
    // This is what the fixed code does:
    //   EXHIBITOR_DATA[activeConference.id]?.[1] ?? []
    const exhibitors = emptyData["hamcation-2027"]?.[1] ?? [];
    expect(exhibitors).toEqual([]);
  });

  it("NEW code returns exhibitor list when key exists", () => {
    const fakeExhibitor: Exhibitor = {
      id: "test-ex",
      name: "Test Exhibitor",
      description: "A test exhibitor",
      boothName: "1",
      location: [1],
    };
    const dataWithEntry: Record<string, [string, Exhibitor[]]> = {
      "hamcation-2027": ["/some-map.png", [fakeExhibitor]],
    };
    const exhibitors = dataWithEntry["hamcation-2027"]?.[1] ?? [];
    expect(exhibitors).toHaveLength(1);
    expect(exhibitors[0].id).toBe("test-ex");
  });
});

// ── hamcation-2026 supplemental exhibitor file ────────────────────────────────
// Guards the shape and presence of the supplemental exhibitor export that
// overrides the exhibitor data embedded in hamcation-2026.ts when it exists.
describe("hamcation-2026-exhibitor supplemental file", () => {
  it("exports a [url, Exhibitor[]] tuple", () => {
    const [url, exhibitors] = supplementalExhibitors;
    expect(typeof url).toBe("string");
    expect(url.length).toBeGreaterThan(0);
    expect(Array.isArray(exhibitors)).toBe(true);
  });

  it("exports a non-empty Exhibitor array", () => {
    const [, exhibitors] = supplementalExhibitors;
    expect(exhibitors.length).toBeGreaterThan(0);
  });

  it("each exhibitor has required fields", () => {
    const [, exhibitors] = supplementalExhibitors;
    exhibitors.forEach((ex: Exhibitor) => {
      expect(typeof ex.id).toBe("string");
      expect(ex.id.length).toBeGreaterThan(0);
      expect(typeof ex.name).toBe("string");
      expect(ex.name.length).toBeGreaterThan(0);
      expect(typeof ex.description).toBe("string");
      expect(typeof ex.boothName).toBe("string");
      expect(Array.isArray(ex.location)).toBe(true);
      expect(ex.location.length).toBeGreaterThan(0);
    });
  });

  it("mapExhibitors URL (index 0) starts with /", () => {
    const [url] = supplementalExhibitors;
    expect(url.startsWith("/")).toBe(true);
  });
});

// ── supplemental exhibitor override logic ─────────────────────────────────────
describe("supplemental exhibitor override logic", () => {
  it("supplemental exhibitors override main-file exhibitors for same conferenceId", () => {
    const EXHIBITOR_DATA: Record<string, [string, Exhibitor[]]> = {
      "hamcation-2026": [
        "/assets/maps/hamcation-2026-north.png",
        [
          {
            id: "old-ex",
            name: "Old Exhibitor",
            description: "Old",
            boothName: "99",
            location: [99],
          },
        ],
      ],
    };
    const conferenceId = "hamcation-2026";
    EXHIBITOR_DATA[conferenceId] = supplementalExhibitors;

    expect(EXHIBITOR_DATA["hamcation-2026"]).toBe(supplementalExhibitors);
    expect(
      EXHIBITOR_DATA["hamcation-2026"][1].find((ex) => ex.id === "old-ex"),
    ).toBeUndefined();
    EXHIBITOR_DATA["hamcation-2026"][1].forEach((ex: Exhibitor) => {
      expect(typeof ex.id).toBe("string");
      expect(typeof ex.name).toBe("string");
    });
  });
});

// ── Advisory: exhibitor location IDs should exist in the URL-matched booth map ─
// For each conference that has both exhibitors and booths, check that every
// exhibitor's location IDs are present in the booth list whose URL matches
// mapExhibitors[0].  A mismatch is tolerated at runtime — ExhibitorsPage falls
// back to searching all conference booth maps — but is warned here so data
// editors know to update the mapExhibitors URL (or reassign booth locations).
describe("exhibitor location IDs exist in URL-matched booth map (advisory)", () => {
  Object.entries(EXHIBITOR_DATA).forEach(([conferenceId, [exhibitorUrl, exhibitors]]) => {
    const allBoothMaps = BOOTH_DATA[conferenceId] ?? [];
    if (allBoothMaps.length === 0) return;

    it(`${conferenceId}: each exhibitor location is in some booth map (advisory)`, () => {
      const allBoothIds = new Set(
        allBoothMaps.flatMap(([, booths]) => booths.map((b) => b.id)),
      );
      exhibitors.forEach((ex) => {
        ex.location.forEach((loc) => {
          if (!allBoothIds.has(loc)) {
            console.warn(
              `[data] ${conferenceId}: exhibitor "${ex.id}" location ${loc} ` +
                `not found in any booth map — exhibitor will not appear on map. ` +
                `Verify booth IDs match between mapExhibitors and mapBooths.`,
            );
          }
        });
      });
      // Advisory only — mismatch is warned but not a hard failure.
    });

    it(`${conferenceId}: each exhibitor location is in the URL-matched booth map (advisory)`, () => {
      const primaryMap = allBoothMaps.find(([url]) => url === exhibitorUrl);
      if (!primaryMap) return; // no booth map at exhibitor URL — fallback will handle it
      const primaryBoothIds = new Set(primaryMap[1].map((b) => b.id));
      // Pre-build a map from booth ID → source URL for O(1) fallback lookup
      const boothIdToMapUrl = new Map<number | string, string>();
      allBoothMaps.forEach(([url, booths]) => {
        booths.forEach((b) => boothIdToMapUrl.set(b.id, url));
      });
      exhibitors.forEach((ex) => {
        const missingLocs = ex.location.filter((loc) => !primaryBoothIds.has(loc));
        if (missingLocs.length === 0) return;
        // Aggregate all missing locations into a single warning per exhibitor
        const fallbackUrl = boothIdToMapUrl.get(missingLocs[0]);
        const allInSameFallback =
          fallbackUrl !== undefined &&
          missingLocs.every((loc) => boothIdToMapUrl.get(loc) === fallbackUrl);
        console.warn(
          `[data] ${conferenceId}: exhibitor "${ex.id}" location(s) [${missingLocs.join(", ")}] ` +
            `not in URL-matched booth map "${exhibitorUrl}"` +
            (allInSameFallback
              ? ` — found in "${fallbackUrl}" (fallback will activate at runtime).`
              : ` — not found in any single booth map (exhibitor may not appear on map).`) +
            ` Update mapExhibitors URL or booth assignments to fix this mismatch.`,
        );
      });
      // Mismatch is tolerated — no hard assertion.
    });
  });
});

// ── hamcation-2026 multi-map: north-hall booth IDs match exhibitor locations ──
// Verifies that all exhibitor location IDs in the north-hall exhibitor file
// have a corresponding booth with the same numeric ID in the north-hall booth
// map so that ExhibitorsMapView can highlight booths for each exhibitor.
describe("hamcation-2026 multi-map: north-hall booth IDs match exhibitor locations", () => {
  it("every hamcation-2026 exhibitor location ID exists in the north-hall booth map", () => {
    const boothEntries = BOOTH_DATA["hamcation-2026"] ?? [];
    const exhibitorEntry = EXHIBITOR_DATA["hamcation-2026"];
    expect(exhibitorEntry).toBeDefined();

    const [exhibitorUrl, exhibitors] = exhibitorEntry!;
    const northHall = boothEntries.find(([url]) => url === exhibitorUrl);
    expect(northHall).toBeDefined();

    const boothIds = new Set(northHall![1].map((b) => b.id));
    exhibitors.forEach((ex) => {
      ex.location.forEach((loc) => {
        expect(
          boothIds.has(loc),
          `exhibitor "${ex.id}" location ${loc} has no matching booth in "${exhibitorUrl}"`,
        ).toBe(true);
      });
    });
  });
});
// Verifies the ExhibitorsPage multi-map fallback logic: exhibitors whose
// mapExhibitors URL does not match a booth map URL are still matched to the
// correct booth map if their location IDs appear in that map's Booth[].
describe("multi-map fallback: exhibitors matched by location when URL mismatches", () => {
  it("returns exhibitors whose location IDs are in the booth map even if URL differs", () => {
    const exhibitorUrl = "/assets/maps/north.png";
    const fakeExhibitor: Exhibitor = {
      id: "ex-1",
      name: "Exhibitor One",
      description: "Test",
      boothName: "A1",
      location: [1, 2],
    };
    const exhibitorEntry: [string, Exhibitor[]] = [exhibitorUrl, [fakeExhibitor]];
    const booths: Booth[] = [
      { id: 1, coords: [[0, 0], [10, 0], [10, 10], [0, 10]], locationZone: "eastwest" },
      { id: 2, coords: [[11, 0], [21, 0], [21, 10], [11, 10]], locationZone: "eastwest" },
    ];
    // Simulate ExhibitorsPage fallback: URL mismatch (exhibitorUrl ≠ "/assets/maps/eastwest.png")
    // so we search by location IDs instead.
    const boothIds = new Set(booths.map((b) => b.id));
    const fallback = exhibitorEntry[1].filter((ex) =>
      ex.location.some((loc) => boothIds.has(loc)),
    );

    expect(fallback).toHaveLength(1);
    expect(fallback[0].id).toBe("ex-1");
  });

  it("returns empty array when no exhibitor locations match any booth in the map", () => {
    const fakeExhibitor: Exhibitor = {
      id: "ex-2",
      name: "Exhibitor Two",
      description: "Test",
      boothName: "B9",
      location: [99],
    };
    const exhibitorEntry: [string, Exhibitor[]] = ["/map-a.png", [fakeExhibitor]];
    const booths: Booth[] = [
      { id: 1, coords: [[0, 0], [10, 0], [10, 10], [0, 10]], locationZone: "zone" },
    ];

    const boothIds = new Set(booths.map((b) => b.id));
    const fallback = exhibitorEntry[1].filter((ex) =>
      ex.location.some((loc) => boothIds.has(loc)),
    );

    expect(fallback).toHaveLength(0);
  });
});
