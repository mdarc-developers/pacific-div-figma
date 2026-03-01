import { describe, it, expect } from "vitest";
import { mapSessions } from "./seapac-2026-session-20260227";
import { mapSessions as quartzfestSessions } from "./quartzfest-2027-session-20260218";
import { allConferences } from "./all-conferences";
import {
  formatUpdateToken,
  formatUpdateTokenDetail,
  resolveSessionEndTime,
  isSessionWithinConference,
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

// ── isSessionWithinConference ─────────────────────────────────────────────────
// Validates the helper that checks whether a session's start/end dates fall
// within the inclusive date range of its conference.
describe("isSessionWithinConference", () => {
  const conf = {
    id: "test-conf",
    name: "Test",
    venue: "",
    startDate: "2027-01-17",
    endDate: "2027-01-23",
    timezone: "America/Phoenix",
    timezoneNumeric: "-0700",
    primaryColor: "#000000",
    secondaryColor: "#000000",
    location: "",
    conferenceWebsite: "",
    venuePhone: "",
    venueGPS: "",
    venueGridSquare: "",
    venueWebsite: "",
    parkingWebsite: "",
    icalUrl: "",
    googlecalUrl: "",
    contactEmail: "",
    logoUrl: "",
  };

  const makeSession = (start: string, end: string): Session => ({
    id: "s1",
    title: "Test",
    description: "",
    speaker: [],
    location: "",
    startTime: start,
    endTime: end,
    category: "Test",
  });

  it("returns true when session is fully within the conference dates", () => {
    expect(
      isSessionWithinConference(
        makeSession("2027-01-18T09:00:00", "2027-01-18T10:00:00"),
        conf,
      ),
    ).toBe(true);
  });

  it("returns true for a session on the first day of the conference", () => {
    expect(
      isSessionWithinConference(
        makeSession("2027-01-17T08:00:00", "2027-01-17T09:00:00"),
        conf,
      ),
    ).toBe(true);
  });

  it("returns true for a session on the last day of the conference", () => {
    expect(
      isSessionWithinConference(
        makeSession("2027-01-23T20:00:00", "2027-01-23T21:00:00"),
        conf,
      ),
    ).toBe(true);
  });

  it("returns false when startTime is before the conference start date", () => {
    expect(
      isSessionWithinConference(
        makeSession("2027-01-16T09:00:00", "2027-01-17T10:00:00"),
        conf,
      ),
    ).toBe(false);
  });

  it("returns false when endTime is after the conference end date", () => {
    expect(
      isSessionWithinConference(
        makeSession("2027-01-23T20:00:00", "2027-01-24T00:00:00"),
        conf,
      ),
    ).toBe(false);
  });

  it("returns false when the session is entirely in a different year", () => {
    expect(
      isSessionWithinConference(
        makeSession("2026-01-18T09:00:00", "2026-01-18T10:00:00"),
        conf,
      ),
    ).toBe(false);
  });

  it("uses startTime date as proxy for endTime when endTime is empty", () => {
    // start is within range, so should return true
    expect(
      isSessionWithinConference(makeSession("2027-01-20T09:00:00", ""), conf),
    ).toBe(true);
  });

  it("uses startTime date as proxy for endTime when endTime is invalid", () => {
    expect(
      isSessionWithinConference(
        makeSession("2027-01-20T09:00:00", "INVALID"),
        conf,
      ),
    ).toBe(true);
  });
});

// ── conference date-range checks for real session data ────────────────────────
// These tests document that both the seapac-2026 and quartzfest-2027
// supplemental files contain sessions whose dates do NOT match their
// respective conference date ranges.  This is known bad data and these tests
// serve as a regression guard — a CI failure here signals that the session
// dates have been corrected (or new mismatches introduced).
describe("conference date-range checks for real session data", () => {
  it("seapac-2026 conference is defined in allConferences", () => {
    const seapac = allConferences.find((c) => c.id === "seapac-2026");
    expect(seapac).toBeDefined();
  });

  it("seapac-2026 sessions contain dates outside the conference date range", () => {
    const seapac = allConferences.find((c) => c.id === "seapac-2026")!;
    const outsideRange = mapSessions[1].filter(
      (s) => !isSessionWithinConference(s, seapac),
    );
    expect(outsideRange.length).toBeGreaterThan(0);
  });

  it("quartzfest-2027 conference is defined in allConferences", () => {
    const qf = allConferences.find((c) => c.id === "quartzfest-2027");
    expect(qf).toBeDefined();
  });

  it("quartzfest-2027 sessions contain dates outside the conference date range", () => {
    const qf = allConferences.find((c) => c.id === "quartzfest-2027")!;
    const outsideRange = quartzfestSessions[1].filter(
      (s) => !isSessionWithinConference(s, qf),
    );
    expect(outsideRange.length).toBeGreaterThan(0);
  });
});
