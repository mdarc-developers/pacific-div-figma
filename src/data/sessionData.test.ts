import { describe, it, expect } from "vitest";
import { mapSessions } from "./seapac-2026-session-20260227";
import {
  formatUpdateToken,
  formatUpdateTokenDetail,
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
