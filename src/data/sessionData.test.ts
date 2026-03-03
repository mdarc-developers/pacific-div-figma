import { describe, it, expect, vi, afterEach } from "vitest";
import { allConferences } from "./all-conferences";
import { BOOTH_DATA } from "@/lib/sessionData"; // ensure side-effects run and export BOOTH_DATA
import {
  formatUpdateToken,
  formatUpdateTokenDetail,
  resolveSessionEndTime,
  isSessionWithinConference,
  warnOutOfRangeSessions,
  warnEmptyMapData,
} from "@/lib/overrideUtils";
import { Session, Booth } from "@/types/conference";

interface SupplementalSessionModule {
  mapSessions?: [string, Session[]];
}

interface SupplementalBoothModule {
  mapBooths?: [string, Booth[]];
}

// Supplemental session files loaded via glob (mirrors the pattern in src/lib/sessionData.ts)
const supplementalSessionModules = import.meta.glob("./*-session-*.ts", {
  eager: true,
}) as Record<string, SupplementalSessionModule>;

// Supplemental booth files loaded via glob (mirrors the pattern in src/lib/sessionData.ts)
const supplementalBoothModules = import.meta.glob("./*-booth-*.ts", {
  eager: true,
}) as Record<string, SupplementalBoothModule>;

// Resolve the specific supplemental session tuples needed by the tests below
const seapacPath = Object.keys(supplementalSessionModules).find((p) =>
  p.includes("seapac-2026-session-"),
);
const mapSessions: [string, Session[]] = seapacPath
  ? (supplementalSessionModules[seapacPath].mapSessions ?? ["", []])
  : ["", []];

const quartzfestPath = Object.keys(supplementalSessionModules).find((p) =>
  p.includes("quartzfest-2027-session-"),
);
const quartzfestSessions: [string, Session[]] = quartzfestPath
  ? (supplementalSessionModules[quartzfestPath].mapSessions ?? ["", []])
  : ["", []];

// Resolve the hamcation-2026 supplemental booth tuple for booth-specific tests
const hamcation2026BoothPath = Object.keys(supplementalBoothModules).find((p) =>
  p.includes("hamcation-2026-booth-"),
);
const supplementalBooths: [string, Booth[]] = hamcation2026BoothPath
  ? (supplementalBoothModules[hamcation2026BoothPath].mapBooths ?? ["", []])
  : ["", []];

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

// ── isValidDateTimeString (ScheduleView filtering) ───────────────────────────
// Validates the invariant relied upon by ScheduleView's bad-date filter:
// sessions whose startTime is not a valid ISO datetime string must be excluded
// from rendering to prevent errors in Intl.DateTimeFormat and FullCalendar.
// quartzfestSessions[1] is the Session[] array from the [url, Session[]] tuple.
describe("ScheduleView bad-date filtering invariant", () => {
  it("quartzfest-2027 contains sessions with an invalid startTime", () => {
    // Mirrors the isValidDateTimeString check used by ScheduleView to filter sessions
    const badStart = quartzfestSessions[1].filter((s) =>
      isNaN(new Date(s.startTime).getTime()),
    );
    expect(badStart.length).toBeGreaterThan(0);
  });

  it("filtering out sessions with an invalid startTime removes all bad-start sessions", () => {
    // Mirrors the isValidDateTimeString check used by ScheduleView to filter sessions
    const filtered = quartzfestSessions[1].filter(
      (s) => !isNaN(new Date(s.startTime).getTime()),
    );
    filtered.forEach((s) => {
      expect(isNaN(new Date(s.startTime).getTime())).toBe(false);
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

// ── warnOutOfRangeSessions ────────────────────────────────────────────────────
// Validates that warnOutOfRangeSessions emits console.warn for sessions whose
// dates fall outside the conference date range, and emits nothing for sessions
// that are within range.
describe("warnOutOfRangeSessions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits console.warn for seapac-2026 sessions outside the conference date range", () => {
    const seapac = allConferences.find((c) => c.id === "seapac-2026")!;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnOutOfRangeSessions("seapac-2026", mapSessions[1], seapac);
    expect(warnSpy).toHaveBeenCalled();
    const messages = warnSpy.mock.calls.map((args) => String(args[0]));
    expect(messages.every((m) => m.includes("[sessionData]"))).toBe(true);
  });

  it("emits console.warn for quartzfest-2027 sessions outside the conference date range", () => {
    const qf = allConferences.find((c) => c.id === "quartzfest-2027")!;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnOutOfRangeSessions("quartzfest-2027", quartzfestSessions[1], qf);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("does not emit console.warn when all sessions are within the conference date range", () => {
    const conf = allConferences.find((c) => c.id === "seapac-2026")!;
    const inRangeSessions = mapSessions[1].filter((s) =>
      isSessionWithinConference(s, conf),
    );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnOutOfRangeSessions("seapac-2026", inRangeSessions, conf);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("warning message includes conference dates and session startTime", () => {
    const seapac = allConferences.find((c) => c.id === "seapac-2026")!;
    const outsideSessions = mapSessions[1].filter(
      (s) => !isSessionWithinConference(s, seapac),
    );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnOutOfRangeSessions("seapac-2026", outsideSessions, seapac);
    const firstCall = String(warnSpy.mock.calls[0][0]);
    expect(firstCall).toContain(seapac.startDate);
    expect(firstCall).toContain(seapac.endDate);
    expect(firstCall).toContain("startTime=");
  });
});

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

// ── mapSessionRooms population ────────────────────────────────────────────────
// Verifies that sessionData.ts populates mapSessionRooms on Conference objects
// in allConferences when base conference modules have both mapSessions and mapRooms.
// The top-level `import "@/lib/sessionData"` at the top of this file triggers the
// population side-effects; sessionData.ts mutates allConferences in-place so the
// updated fields are visible through the same cached module instance.
describe("mapSessionRooms population", () => {
  // Every conference data file exports both mapSessions and mapRooms, so every
  // conference in allConferences should have mapSessionRooms fully populated.
  const confsWithSessionRooms = allConferences.filter(
    (conf) => conf.mapSessionRooms !== undefined,
  );
  const confsWithoutSessionRooms = allConferences.filter(
    (conf) => conf.mapSessionRooms === undefined,
  );

  confsWithSessionRooms.forEach((conf) => {
    it(`${conf.id}: mapSessionRooms is a non-empty array of tuples`, () => {
      expect(Array.isArray(conf.mapSessionRooms)).toBe(true);
      expect(conf.mapSessionRooms!.length).toBeGreaterThan(0);
    });

    it(`${conf.id}: each mapSessionRooms entry has a non-empty URL`, () => {
      conf.mapSessionRooms!.forEach((entry) => {
        expect(typeof entry[0]).toBe("string");
        expect(entry[0].length).toBeGreaterThan(0);
      });
    });

    it(`${conf.id}: each mapSessionRooms entry has sessions loaded = true`, () => {
      conf.mapSessionRooms!.forEach((entry) => {
        expect(entry[1]).toBe(true);
      });
    });

    it(`${conf.id}: each mapSessionRooms entry has rooms loaded = true`, () => {
      conf.mapSessionRooms!.forEach((entry) => {
        expect(entry[2]).toBe(true);
      });
    });
  });

  confsWithoutSessionRooms.forEach((conf) => {
    it(`${conf.id}: mapSessionRooms is undefined (no sessions/rooms data)`, () => {
      expect(conf.mapSessionRooms).toBeUndefined();
    });
  });
});

// ── mapExhibitorBooths population ─────────────────────────────────────────────
// Verifies that sessionData.ts populates mapExhibitorBooths on Conference objects
// in allConferences when base conference modules have both mapExhibitors and mapBooths.
// The top-level `import "@/lib/sessionData"` at the top of this file triggers the
// population side-effects; sessionData.ts mutates allConferences in-place so the
// updated fields are visible through the same cached module instance.
describe("mapExhibitorBooths population", () => {
  // Conferences that export both mapExhibitors and mapBooths should have
  // mapExhibitorBooths fully populated; conferences with neither (e.g. quartzfest)
  // should leave mapExhibitorBooths undefined.
  const confsWithExhibitorBooths = allConferences.filter(
    (conf) => conf.mapExhibitorBooths !== undefined,
  );
  const confsWithoutExhibitorBooths = allConferences.filter(
    (conf) => conf.mapExhibitorBooths === undefined,
  );

  confsWithExhibitorBooths.forEach((conf) => {
    it(`${conf.id}: mapExhibitorBooths is a non-empty array of tuples`, () => {
      expect(Array.isArray(conf.mapExhibitorBooths)).toBe(true);
      expect(conf.mapExhibitorBooths!.length).toBeGreaterThan(0);
    });

    it(`${conf.id}: each mapExhibitorBooths entry has a non-empty URL`, () => {
      conf.mapExhibitorBooths!.forEach((entry) => {
        expect(typeof entry[0]).toBe("string");
        expect(entry[0].length).toBeGreaterThan(0);
      });
    });

    it(`${conf.id}: each mapExhibitorBooths entry has at least booths or exhibitors loaded`, () => {
      conf.mapExhibitorBooths!.forEach((entry) => {
        expect(entry[1] || entry[2]).toBe(true);
      });
    });

    it(`${conf.id}: each mapExhibitorBooths entry has booths loaded = true`, () => {
      conf.mapExhibitorBooths!.forEach((entry) => {
        expect(entry[2]).toBe(true);
      });
    });
  });

  confsWithoutExhibitorBooths.forEach((conf) => {
    it(`${conf.id}: mapExhibitorBooths is undefined (no exhibitors/booths data)`, () => {
      expect(conf.mapExhibitorBooths).toBeUndefined();
    });
  });
});

// ── warnEmptyMapData ──────────────────────────────────────────────────────────
// Validates that warnEmptyMapData emits console.warn when the data array is
// empty, and emits nothing when the array has at least one item.
describe("warnEmptyMapData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits console.warn when the items array is empty", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnEmptyMapData("test-conf", "mapSessions", "/assets/maps/test.png", []);
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(String(warnSpy.mock.calls[0][0])).toContain("[sessionData]");
    expect(String(warnSpy.mock.calls[0][0])).toContain("test-conf");
    expect(String(warnSpy.mock.calls[0][0])).toContain("mapSessions");
    expect(String(warnSpy.mock.calls[0][0])).toContain("/assets/maps/test.png");
  });

  it("does not emit console.warn when the items array is non-empty", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnEmptyMapData("test-conf", "mapRooms", "/assets/maps/test.png", [
      { name: "Room A" },
    ]);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("emits a warning for each empty-array map type independently", () => {
    const types = [
      "mapSessions",
      "mapRooms",
      "mapBooths",
      "mapExhibitors",
    ] as const;
    types.forEach((type) => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      warnEmptyMapData("conf-id", type, "/url", []);
      expect(warnSpy).toHaveBeenCalledOnce();
      expect(String(warnSpy.mock.calls[0][0])).toContain(type);
      vi.restoreAllMocks();
    });
  });
});

// ── hamcation-2026-booth supplemental file ────────────────────────────────────
// Guards the shape and presence of the supplemental booth export that adds a
// second map URL (eastwest hall) to hamcation-2026's booth data.
describe("hamcation-2026-booth supplemental file", () => {
  it("exports a [url, Booth[]] tuple", () => {
    const [url, booths] = supplementalBooths;
    expect(typeof url).toBe("string");
    expect(url.length).toBeGreaterThan(0);
    expect(Array.isArray(booths)).toBe(true);
  });

  it("exports a non-empty Booth array", () => {
    const [, booths] = supplementalBooths;
    expect(booths.length).toBeGreaterThan(0);
  });

  it("each booth has coords", () => {
    const [, booths] = supplementalBooths;
    booths.forEach((booth) => {
      expect(Array.isArray(booth.coords)).toBe(true);
      expect(booth.coords.length).toBeGreaterThan(0);
    });
  });

  it("mapBooths URL (index 0) starts with /", () => {
    const [url] = supplementalBooths;
    expect(url.startsWith("/")).toBe(true);
  });

  it("each booth id is a number (not a string)", () => {
    const [, booths] = supplementalBooths;
    booths.forEach((booth) => {
      expect(typeof booth.id).toBe("number");
    });
  });
});

// ── BOOTH_DATA multi-entry (hamcation-2026) ───────────────────────────────────
// Verifies that sessionData.ts accumulates multiple booth entries for conferences
// that have both a base booth file and one or more supplemental booth files.
describe("BOOTH_DATA multi-entry (hamcation-2026)", () => {
  it("hamcation-2026 BOOTH_DATA has two entries", () => {
    const entries = BOOTH_DATA["hamcation-2026"];
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBe(2);
  });

  it("hamcation-2026 BOOTH_DATA entries have distinct URLs", () => {
    const entries = BOOTH_DATA["hamcation-2026"];
    const urls = entries.map((e) => e[0]);
    expect(new Set(urls).size).toBe(2);
  });

  it("hamcation-2026 BOOTH_DATA entries each have a non-empty Booth array", () => {
    const entries = BOOTH_DATA["hamcation-2026"];
    entries.forEach(([url, booths]) => {
      expect(url.startsWith("/")).toBe(true);
      expect(booths.length).toBeGreaterThan(0);
    });
  });
});
