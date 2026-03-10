import { describe, it, expect } from "vitest";
import {
  getExpiredConferenceIds,
  buildExpiredFieldRemovals,
} from "./dataRetention";

const NINETY_ONE_DAYS_MS = 91 * 24 * 60 * 60 * 1000;
const EIGHTY_NINE_DAYS_MS = 89 * 24 * 60 * 60 * 1000;
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

// ── getExpiredConferenceIds ───────────────────────────────────────────────────

describe("getExpiredConferenceIds", () => {
  it("returns empty array when no conferences are provided", () => {
    expect(getExpiredConferenceIds({}, Date.now())).toEqual([]);
  });

  it("returns an expired conferenceId", () => {
    const now = Date.now();
    const endDates = {
      "conf-old": new Date(now - NINETY_ONE_DAYS_MS).toISOString(),
    };
    expect(getExpiredConferenceIds(endDates, now)).toContain("conf-old");
  });

  it("does not return a conference within the retention window", () => {
    const now = Date.now();
    const endDates = {
      "conf-recent": new Date(now - EIGHTY_NINE_DAYS_MS).toISOString(),
    };
    expect(getExpiredConferenceIds(endDates, now)).not.toContain("conf-recent");
  });

  it("returns only expired ids when the map is mixed", () => {
    const now = Date.now();
    const endDates = {
      "conf-expired": new Date(now - NINETY_ONE_DAYS_MS).toISOString(),
      "conf-active": new Date(now - EIGHTY_NINE_DAYS_MS).toISOString(),
    };
    const result = getExpiredConferenceIds(endDates, now);
    expect(result).toContain("conf-expired");
    expect(result).not.toContain("conf-active");
    expect(result).toHaveLength(1);
  });

  it("does not expire a conference at exactly 90 days", () => {
    const now = Date.now();
    const endDates = {
      "conf-boundary": new Date(now - NINETY_DAYS_MS).toISOString(),
    };
    expect(getExpiredConferenceIds(endDates, now)).toEqual([]);
  });

  it("handles multiple expired conferences", () => {
    const now = Date.now();
    const endDates = {
      "conf-a": new Date(now - NINETY_ONE_DAYS_MS).toISOString(),
      "conf-b": new Date(now - 200 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const result = getExpiredConferenceIds(endDates, now);
    expect(result).toContain("conf-a");
    expect(result).toContain("conf-b");
    expect(result).toHaveLength(2);
  });
});

// ── buildExpiredFieldRemovals ─────────────────────────────────────────────────

describe("buildExpiredFieldRemovals", () => {
  it("returns empty object when expiredConferenceIds is empty", () => {
    const userData = { bookmarks: { "conf-1": ["a"] } };
    expect(buildExpiredFieldRemovals(userData, [])).toEqual({});
  });

  it("marks expired conference keys for deletion in bookmarks", () => {
    const userData = {
      bookmarks: { "conf-old": ["a"], "conf-new": ["b"] },
    };
    const removals = buildExpiredFieldRemovals(userData, ["conf-old"]);
    expect(removals).toHaveProperty("bookmarks.conf-old");
    expect(removals).not.toHaveProperty("bookmarks.conf-new");
  });

  it("marks expired keys across all conference-keyed fields", () => {
    const userData = {
      bookmarks: { "conf-old": ["a"] },
      sessionVotes: { "conf-old": ["s1"] },
      notes: { "conf-old": { s1: "note" } },
      exhibitorNotes: { "conf-old": { e1: "note" } },
    };
    const removals = buildExpiredFieldRemovals(userData, ["conf-old"]);
    expect(removals).toHaveProperty("bookmarks.conf-old");
    expect(removals).toHaveProperty("sessionVotes.conf-old");
    expect(removals).toHaveProperty("notes.conf-old");
    expect(removals).toHaveProperty("exhibitorNotes.conf-old");
  });

  it("does not mark fields absent from the user document", () => {
    const userData = {};
    expect(buildExpiredFieldRemovals(userData, ["conf-old"])).toEqual({});
  });

  it("handles multiple expired conferences", () => {
    const userData = {
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

  it("skips fields that are not objects (defensive)", () => {
    const userData = {
      bookmarks: "malformed" as unknown as Record<string, string[]>,
    };
    expect(() =>
      buildExpiredFieldRemovals(userData as Record<string, unknown>, [
        "conf-old",
      ]),
    ).not.toThrow();
  });
});
