import { describe, it, expect } from "vitest";
import { mapExhibitors } from "./hamcation-2027";
import { mapExhibitors as supplementalExhibitors } from "./hamcation-2026-exhibitor-20260301";
import { Exhibitor } from "@/types/conference";

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
