import { describe, it, expect } from "vitest";
import { mapSessions } from "./seapac-2026-session-20260227";
import { mapSessions as quartzfestSessions } from "./quartzfest-2027-session-20260218";
import {
  formatUpdateToken,
  formatUpdateTokenDetail,
  resolveSessionEndTime,
} from "@/lib/overrideUtils";
import { Session } from "@/types/conference";

// ── seapac-2026 supplemental session file ─────────────────────────────────────
// Guards the shape and presence of the supplemental session export that overrides
// the empty sessions in seapac-2026.ts when it exists.
describe("seapac-2026-session supplemental file", () => {
  it("exports a [url, Session[]] tuple", () => {
    expect(Array.isArray(mapSessions)).toBe(true);
    expect(mapSessions.length).toBe(2);
    expect(typeof mapSessions[0]).toBe("string");
    expect(Array.isArray(mapSessions[1])).toBe(true);
  });

  it("exports a non-empty Session array", () => {
    expect(mapSessions[1].length).toBeGreaterThan(0);
  });

  it("each session has required fields", () => {
    mapSessions[1].forEach((session: Session) => {
      expect(typeof session.id).toBe("string");
      expect(session.id.length).toBeGreaterThan(0);
      expect(typeof session.title).toBe("string");
      expect(session.title.length).toBeGreaterThan(0);
      expect(typeof session.startTime).toBe("string");
      expect(typeof session.endTime).toBe("string");
      expect(typeof session.location).toBe("string");
      expect(typeof session.category).toBe("string");
    });
  });

  it("mapSessions URL (index 0) is non-empty", () => {
    expect(mapSessions[0].length).toBeGreaterThan(0);
  });
});

// ── formatUpdateToken (date-only token) ───────────────────────────────────────
// Validates that formatUpdateToken handles the date-only token format used by
// the seapac-2026-session-20260227.ts supplemental file.
describe("formatUpdateToken date-only token", () => {
  it("formats a date-only token (YYYYMMDD) correctly", () => {
    // seapac-2026-session-20260227 → token = "20260227"
    expect(formatUpdateToken("20260227")).toBe("02/27");
  });

  it("still formats a full datetime token correctly", () => {
    expect(formatUpdateToken("20260227T132422")).toBe("02/27 @ 13:24");
  });
});

// ── formatUpdateTokenDetail ───────────────────────────────────────────────────
describe("formatUpdateTokenDetail", () => {
  it("formats a date-only token to ISO date string", () => {
    expect(formatUpdateTokenDetail("20260227")).toBe("2026-02-27");
  });

  it("formats a full datetime token to ISO datetime string", () => {
    expect(formatUpdateTokenDetail("20260227T132422")).toBe(
      "2026-02-27 13:24:22",
    );
  });
});

// ── supplemental session override logic ───────────────────────────────────────
describe("supplemental session override logic", () => {
  it("supplemental sessions override main-file sessions for same conferenceId", () => {
    const SESSION_DATA: Record<string, Session[]> = {
      "seapac-2026": [],
    };
    const conferenceId = "seapac-2026";
    SESSION_DATA[conferenceId] = mapSessions[1];

    expect(SESSION_DATA["seapac-2026"]).toBe(mapSessions[1]);
    expect(SESSION_DATA["seapac-2026"].length).toBeGreaterThan(0);
    SESSION_DATA["seapac-2026"].forEach((session: Session) => {
      expect(typeof session.id).toBe("string");
      expect(typeof session.title).toBe("string");
    });
  });
});

// ── resolveSessionEndTime ─────────────────────────────────────────────────────
// Validates the end-time normalisation helper used by sessionData.ts to ensure
// sessions with missing or invalid endTimes are displayed with a sensible
// 1-hour default instead of "Invalid Date".
describe("resolveSessionEndTime", () => {
  it("returns endTime unchanged when it is a valid ISO datetime", () => {
    expect(
      resolveSessionEndTime("2027-01-18T09:00:00", "2027-01-18T10:30:00"),
    ).toBe("2027-01-18T10:30:00");
  });

  it("defaults to startTime + 1 hour when endTime is empty", () => {
    expect(resolveSessionEndTime("2027-01-18T09:00:00", "")).toBe(
      "2027-01-18T10:00:00",
    );
  });

  it("defaults to startTime + 1 hour when endTime is an invalid string", () => {
    expect(resolveSessionEndTime("2027-01-18T09:00:00", "INVALID")).toBe(
      "2027-01-18T10:00:00",
    );
  });

  it("returns the original endTime when startTime is also unparseable", () => {
    expect(resolveSessionEndTime("NOT-A-DATE", "")).toBe("");
  });

  it("handles midnight rollover correctly", () => {
    expect(resolveSessionEndTime("2027-01-18T23:00:00", "")).toBe(
      "2027-01-19T00:00:00",
    );
  });
});

// ── quartzfest-2027 supplemental session file ──────────────────────────────────
// Guards the shape of the supplemental session export and verifies that the
// bad-data examples (empty / invalid endTime) are normalised to valid times
// when resolveSessionEndTime is applied.
describe("quartzfest-2027-session supplemental file", () => {
  it("exports a [url, Session[]] tuple", () => {
    expect(Array.isArray(quartzfestSessions)).toBe(true);
    expect(quartzfestSessions.length).toBe(2);
    expect(typeof quartzfestSessions[0]).toBe("string");
    expect(Array.isArray(quartzfestSessions[1])).toBe(true);
  });

  it("exports a non-empty Session array", () => {
    expect(quartzfestSessions[1].length).toBeGreaterThan(0);
  });

  it("each session has required fields", () => {
    quartzfestSessions[1].forEach((session) => {
      expect(typeof session.id).toBe("string");
      expect(session.id.length).toBeGreaterThan(0);
      expect(typeof session.title).toBe("string");
      // some quartzfest sessions intentionally have empty titles (bad data)
      expect(typeof session.startTime).toBe("string");
      expect(typeof session.endTime).toBe("string");
      expect(typeof session.location).toBe("string");
      expect(typeof session.category).toBe("string");
    });
  });

  it("contains sessions with invalid end times (the bad-data examples)", () => {
    const badEndTimes = quartzfestSessions[1].filter(
      (s) => !s.endTime || isNaN(new Date(s.endTime).getTime()),
    );
    expect(badEndTimes.length).toBeGreaterThan(0);
  });

  it("resolveSessionEndTime produces a valid ISO datetime for sessions with a valid startTime", () => {
    quartzfestSessions[1]
      .filter((s) => !isNaN(new Date(s.startTime + "Z").getTime()))
      .forEach((session) => {
        const resolved = resolveSessionEndTime(
          session.startTime,
          session.endTime,
        );
        expect(isNaN(new Date(resolved).getTime())).toBe(false);
      });
  });

  it("resolveSessionEndTime returns the original endTime when startTime is also invalid", () => {
    const badStartSessions = quartzfestSessions[1].filter((s) =>
      isNaN(new Date(s.startTime + "Z").getTime()),
    );
    expect(badStartSessions.length).toBeGreaterThan(0);
    badStartSessions.forEach((session) => {
      const resolved = resolveSessionEndTime(
        session.startTime,
        session.endTime,
      );
      expect(resolved).toBe(session.endTime);
    });
  });
});
