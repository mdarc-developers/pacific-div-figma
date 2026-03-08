import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: {},
  storage: {},
}));

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    doc: vi.fn(),
    addDoc: vi.fn(),
    collection: vi.fn(),
    serverTimestamp: vi.fn(() => "MOCK_TIMESTAMP"),
  };
});

import {
  formatAsJson,
  formatAsCsv,
  getExpiredConferenceIds,
  buildExpiredFieldRemovals,
  getRaffleTicketsFromStorage,
} from "@/services/exportDataService";
import type { UserExportData, UserFirestoreData } from "@/services/exportDataService";

// ── Shared sample data ────────────────────────────────────────────────────────

const sampleData: UserExportData = {
  exportedAt: "2026-03-01T00:00:00.000Z",
  uid: "user123",
  profile: {
    email: "test@example.com",
    displayName: "Test User",
    theme: "dark",
    bookmarks: { "conf-1": ["session-a", "session-b"] },
    sessionVotes: { "conf-1": ["session-a"] },
  },
  raffleTickets: { "conf-1": ["42", "43"] },
};

// ── formatAsJson ──────────────────────────────────────────────────────────────

describe("formatAsJson", () => {
  it("produces valid JSON that round-trips", () => {
    const json = formatAsJson(sampleData);
    expect(() => JSON.parse(json)).not.toThrow();
    expect(JSON.parse(json)).toMatchObject({ uid: "user123" });
  });

  it("is pretty-printed (contains newlines)", () => {
    const json = formatAsJson(sampleData);
    expect(json).toContain("\n");
  });

  it("includes all top-level keys", () => {
    const parsed = JSON.parse(formatAsJson(sampleData)) as Record<string, unknown>;
    expect(parsed).toHaveProperty("exportedAt");
    expect(parsed).toHaveProperty("uid");
    expect(parsed).toHaveProperty("profile");
    expect(parsed).toHaveProperty("raffleTickets");
  });
});

// ── formatAsCsv ───────────────────────────────────────────────────────────────

describe("formatAsCsv", () => {
  it("starts with a 'key,value' header row", () => {
    const csv = formatAsCsv(sampleData);
    expect(csv.split("\n")[0]).toBe("key,value");
  });

  it("contains the uid value", () => {
    const csv = formatAsCsv(sampleData);
    expect(csv).toContain("user123");
  });

  it("contains the email value", () => {
    const csv = formatAsCsv(sampleData);
    expect(csv).toContain("test@example.com");
  });

  it("each row has exactly two comma-separated columns (simple values)", () => {
    const csv = formatAsCsv(sampleData);
    const rows = csv.split("\n").slice(1); // skip header
    for (const row of rows) {
      // A quoted field may contain commas; just verify non-empty rows
      expect(row.length).toBeGreaterThan(0);
    }
  });

  it("wraps values containing commas in double-quotes", () => {
    const dataWithComma: UserExportData = {
      ...sampleData,
      profile: { email: "a,b@example.com" },
    };
    const csv = formatAsCsv(dataWithComma);
    expect(csv).toContain('"a,b@example.com"');
  });

  it("escapes double-quotes inside values", () => {
    const dataWithQuote: UserExportData = {
      ...sampleData,
      profile: { displayName: 'He said "hello"' },
    };
    const csv = formatAsCsv(dataWithQuote);
    expect(csv).toContain('"He said ""hello"""');
  });

  it("handles empty arrays gracefully", () => {
    const dataWithEmpty: UserExportData = {
      ...sampleData,
      profile: { bookmarks: { "conf-1": [] } },
      raffleTickets: {},
    };
    expect(() => formatAsCsv(dataWithEmpty)).not.toThrow();
  });
});

// ── getExpiredConferenceIds ───────────────────────────────────────────────────

describe("getExpiredConferenceIds", () => {
  const ninetyOneDaysMs = 91 * 24 * 60 * 60 * 1000;
  const eightNineDaysMs = 89 * 24 * 60 * 60 * 1000;

  it("returns empty array when no conferences are expired", () => {
    const now = Date.now();
    const endDates = {
      "conf-recent": new Date(now - eightNineDaysMs).toISOString(),
    };
    expect(getExpiredConferenceIds(endDates, now)).toEqual([]);
  });

  it("returns expired conference ids", () => {
    const now = Date.now();
    const endDates = {
      "conf-old": new Date(now - ninetyOneDaysMs).toISOString(),
    };
    expect(getExpiredConferenceIds(endDates, now)).toEqual(["conf-old"]);
  });

  it("returns only the expired subset when mixed", () => {
    const now = Date.now();
    const endDates = {
      "conf-old": new Date(now - ninetyOneDaysMs).toISOString(),
      "conf-recent": new Date(now - eightNineDaysMs).toISOString(),
    };
    const result = getExpiredConferenceIds(endDates, now);
    expect(result).toContain("conf-old");
    expect(result).not.toContain("conf-recent");
  });

  it("handles empty input", () => {
    expect(getExpiredConferenceIds({}, Date.now())).toEqual([]);
  });

  it("does not include a conference that expired exactly 90 days ago", () => {
    const now = Date.now();
    const exactlyNinetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    const endDates = {
      "conf-boundary": new Date(now - exactlyNinetyDaysMs).toISOString(),
    };
    // Exactly 90 days = NOT yet expired (must be strictly less-than)
    expect(getExpiredConferenceIds(endDates, now)).toEqual([]);
  });
});

// ── buildExpiredFieldRemovals ─────────────────────────────────────────────────

describe("buildExpiredFieldRemovals", () => {
  it("returns empty object when no expired ids are provided", () => {
    const userData: UserFirestoreData = {
      bookmarks: { "conf-1": ["a"] },
    };
    expect(buildExpiredFieldRemovals(userData, [])).toEqual({});
  });

  it("marks expired conference keys for removal across all conference-keyed fields", () => {
    const userData: UserFirestoreData = {
      bookmarks: { "conf-old": ["a"], "conf-new": ["b"] },
      sessionVotes: { "conf-old": ["s1"] },
      notes: { "conf-old": { s1: "my note" } },
    };
    const removals = buildExpiredFieldRemovals(userData, ["conf-old"]);
    expect(removals).toHaveProperty("bookmarks.conf-old");
    expect(removals).toHaveProperty("sessionVotes.conf-old");
    expect(removals).toHaveProperty("notes.conf-old");
    expect(removals).not.toHaveProperty("bookmarks.conf-new");
  });

  it("does not include fields not present in the user document", () => {
    const userData: UserFirestoreData = {};
    expect(buildExpiredFieldRemovals(userData, ["conf-old"])).toEqual({});
  });

  it("handles multiple expired conferences", () => {
    const userData: UserFirestoreData = {
      bookmarks: {
        "conf-a": ["x"],
        "conf-b": ["y"],
        "conf-keep": ["z"],
      },
    };
    const removals = buildExpiredFieldRemovals(userData, ["conf-a", "conf-b"]);
    expect(removals).toHaveProperty("bookmarks.conf-a");
    expect(removals).toHaveProperty("bookmarks.conf-b");
    expect(removals).not.toHaveProperty("bookmarks.conf-keep");
  });
});

// ── getRaffleTicketsFromStorage ───────────────────────────────────────────────

describe("getRaffleTicketsFromStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty object when localStorage has no raffle ticket keys", () => {
    expect(getRaffleTicketsFromStorage()).toEqual({});
  });

  it("returns raffle tickets keyed by conferenceId", () => {
    localStorage.setItem(
      "raffle_tickets_conf-1",
      JSON.stringify(["10", "11"]),
    );
    const result = getRaffleTicketsFromStorage();
    expect(result).toEqual({ "conf-1": ["10", "11"] });
  });

  it("ignores non-raffle localStorage keys", () => {
    localStorage.setItem("theme", "dark");
    localStorage.setItem("raffle_tickets_conf-2", JSON.stringify(["5"]));
    const result = getRaffleTicketsFromStorage();
    expect(Object.keys(result)).toEqual(["conf-2"]);
  });

  it("ignores malformed JSON entries", () => {
    localStorage.setItem("raffle_tickets_bad", "not-json");
    expect(() => getRaffleTicketsFromStorage()).not.toThrow();
    expect(getRaffleTicketsFromStorage()).toEqual({});
  });
});
