import { describe, it, expect, beforeEach } from "vitest";
import { searchService } from "@/services/searchService";
import type { Session, Exhibitor } from "@/types/conference";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "s1",
    title: "Introduction to Ham Radio",
    description: "An introductory session for new ham radio operators.",
    speaker: ["Alice Smith"],
    location: "Room 101",
    startTime: "2026-10-16T09:00:00",
    endTime: "2026-10-16T10:00:00",
    category: "Technical",
    ...overrides,
  };
}

const sessions: Session[] = [
  makeSession({
    id: "s1",
    title: "Introduction to Ham Radio",
    category: "Technical",
  }),
  makeSession({
    id: "s2",
    title: "Advanced CW Operating",
    category: "Operating",
  }),
  makeSession({
    id: "s3",
    title: "Digital Modes Workshop",
    category: "Technical",
  }),
];

// ── Test suite ────────────────────────────────────────────────────────────────

beforeEach(() => {
  searchService.clearIndex();
});

// ── buildIndex ────────────────────────────────────────────────────────────────

describe("buildIndex", () => {
  it("does not throw when called with sessions", () => {
    expect(() => searchService.buildIndex(sessions)).not.toThrow();
  });

  it("populates the index so getAllSessions returns the provided sessions", () => {
    searchService.buildIndex(sessions);
    expect(searchService.getAllSessions()).toHaveLength(sessions.length);
    expect(searchService.getAllSessions()).toEqual(sessions);
  });

  it("handles an empty array gracefully (no sessions are indexed)", () => {
    searchService.buildIndex([]);
    expect(searchService.getAllSessions()).toEqual([]);
  });
});

// ── getAllSessions ─────────────────────────────────────────────────────────────

describe("getAllSessions", () => {
  it("returns an empty array before buildIndex is called", () => {
    expect(searchService.getAllSessions()).toEqual([]);
  });

  it("returns all sessions after buildIndex", () => {
    searchService.buildIndex(sessions);
    expect(searchService.getAllSessions()).toEqual(sessions);
  });
});

// ── clearIndex ────────────────────────────────────────────────────────────────

describe("clearIndex", () => {
  it("empties the sessions list", () => {
    searchService.buildIndex(sessions);
    searchService.clearIndex();
    expect(searchService.getAllSessions()).toEqual([]);
  });

  it("causes subsequent searches to return empty results", () => {
    searchService.buildIndex(sessions);
    searchService.clearIndex();
    expect(searchService.search("Ham")).toEqual([]);
  });
});

// ── search ────────────────────────────────────────────────────────────────────

describe("search", () => {
  it("returns an empty array when no index has been built", () => {
    expect(searchService.search("Ham")).toEqual([]);
  });

  it("returns an empty array for an empty query string", () => {
    searchService.buildIndex(sessions);
    expect(searchService.search("")).toEqual([]);
  });

  it("returns an empty array for a whitespace-only query", () => {
    searchService.buildIndex(sessions);
    expect(searchService.search("   ")).toEqual([]);
  });

  it("returns results matching the query title", () => {
    searchService.buildIndex(sessions);
    const results = searchService.search("Ham Radio");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].session.id).toBe("s1");
  });

  it("each result has a session and a numeric score", () => {
    searchService.buildIndex(sessions);
    const results = searchService.search("Digital");
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r).toHaveProperty("session");
      expect(typeof r.score).toBe("number");
    }
  });

  it("respects the limit parameter", () => {
    searchService.buildIndex(sessions);
    const results = searchService.search("Ham", undefined, 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });

  it("filters results by category when the filter matches", () => {
    searchService.buildIndex(sessions);
    const results = searchService.search("Radio", { category: "Technical" });
    for (const r of results) {
      expect(r.session.category).toBe("Technical");
    }
  });

  it("excludes results whose category does not match the filter", () => {
    searchService.buildIndex(sessions);
    // "CW Operating" only exists in the "Operating" category
    const results = searchService.search("CW Operating", {
      category: "Technical",
    });
    for (const r of results) {
      expect(r.session.category).toBe("Technical");
    }
  });

  it("filters by bookmarkedOnly when bookmarkedSessions is provided", () => {
    searchService.buildIndex(sessions);
    const results = searchService.search("Ham", {
      bookmarkedOnly: true,
      bookmarkedSessions: ["s2"], // only s2 is bookmarked
    });
    for (const r of results) {
      expect(r.session.id).toBe("s2");
    }
  });

  it("returns all matching results when bookmarkedOnly is false", () => {
    searchService.buildIndex(sessions);
    const results = searchService.search("Ham", { bookmarkedOnly: false });
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns results within startTime bound", () => {
    const timed = [
      makeSession({
        id: "early",
        title: "Early Session",
        startTime: "2026-10-16T07:00:00",
      }),
      makeSession({
        id: "late",
        title: "Late Session",
        startTime: "2026-10-16T15:00:00",
      }),
    ];
    searchService.buildIndex(timed);
    const results = searchService.search("Session", {
      startTime: "2026-10-16T08:00:00",
    });
    // Only the "late" session starts after the filter boundary
    for (const r of results) {
      expect(r.session.startTime >= "2026-10-16T08:00:00").toBe(true);
    }
  });

  it("returns results within endTime bound", () => {
    const timed = [
      makeSession({
        id: "short",
        title: "Short Session",
        endTime: "2026-10-16T09:30:00",
      }),
      makeSession({
        id: "long",
        title: "Long Session",
        endTime: "2026-10-16T17:00:00",
      }),
    ];
    searchService.buildIndex(timed);
    const results = searchService.search("Session", {
      endTime: "2026-10-16T10:00:00",
    });
    // Only the "short" session ends before the filter boundary
    for (const r of results) {
      expect(r.session.endTime <= "2026-10-16T10:00:00").toBe(true);
    }
  });
});

// ── Exhibitor helpers ─────────────────────────────────────────────────────────

function makeExhibitor(overrides: Partial<Exhibitor> = {}): Exhibitor {
  return {
    id: "e1",
    name: "ARRL",
    description: "American Radio Relay League",
    boothName: "Booth 101",
    location: [101],
    type: "Non-Profit",
    ...overrides,
  };
}

const exhibitors: Exhibitor[] = [
  makeExhibitor({ id: "e1", name: "ARRL", type: "Non-Profit" }),
  makeExhibitor({
    id: "e2",
    name: "Yaesu Radios",
    type: "Vendor",
    description: "HF and VHF radio equipment",
  }),
  makeExhibitor({
    id: "e3",
    name: "Elecraft",
    type: "Vendor",
    description: "High performance transceivers",
  }),
];

// ── buildExhibitorIndex ───────────────────────────────────────────────────────

describe("buildExhibitorIndex", () => {
  it("does not throw when called with exhibitors", () => {
    expect(() => searchService.buildExhibitorIndex(exhibitors)).not.toThrow();
  });

  it("populates the index so getAllExhibitors returns the provided exhibitors", () => {
    searchService.buildExhibitorIndex(exhibitors);
    expect(searchService.getAllExhibitors()).toHaveLength(exhibitors.length);
    expect(searchService.getAllExhibitors()).toEqual(exhibitors);
  });

  it("handles an empty array gracefully (no exhibitors are indexed)", () => {
    searchService.buildExhibitorIndex([]);
    expect(searchService.getAllExhibitors()).toEqual([]);
  });
});

// ── searchExhibitors ──────────────────────────────────────────────────────────

describe("searchExhibitors", () => {
  it("returns an empty array when no index has been built", () => {
    expect(searchService.searchExhibitors("ARRL")).toEqual([]);
  });

  it("returns an empty array for an empty query string", () => {
    searchService.buildExhibitorIndex(exhibitors);
    expect(searchService.searchExhibitors("")).toEqual([]);
  });

  it("returns results matching the exhibitor name", () => {
    searchService.buildExhibitorIndex(exhibitors);
    const results = searchService.searchExhibitors("ARRL");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].exhibitor.id).toBe("e1");
  });

  it("returns results matching the exhibitor description", () => {
    searchService.buildExhibitorIndex(exhibitors);
    const results = searchService.searchExhibitors("transceiver");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].exhibitor.id).toBe("e3");
  });

  it("each result has an exhibitor and a numeric score", () => {
    searchService.buildExhibitorIndex(exhibitors);
    const results = searchService.searchExhibitors("Radio");
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r).toHaveProperty("exhibitor");
      expect(typeof r.score).toBe("number");
    }
  });

  it("respects the limit parameter", () => {
    searchService.buildExhibitorIndex(exhibitors);
    const results = searchService.searchExhibitors("Radio", 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });
});

// ── clearIndex clears exhibitor index too ─────────────────────────────────────

describe("clearIndex (exhibitor)", () => {
  it("empties the exhibitors list", () => {
    searchService.buildExhibitorIndex(exhibitors);
    searchService.clearIndex();
    expect(searchService.getAllExhibitors()).toEqual([]);
  });

  it("causes subsequent exhibitor searches to return empty results", () => {
    searchService.buildExhibitorIndex(exhibitors);
    searchService.clearIndex();
    expect(searchService.searchExhibitors("ARRL")).toEqual([]);
  });
});
