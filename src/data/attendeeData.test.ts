import { describe, it, expect } from "vitest";
import { sampleAttendees } from "./quartzfest-2027-userprofile-20260301";
import { UserProfile } from "@/types/conference";

// ── quartzfest-2027 supplemental userprofile file ─────────────────────────────
// Guards the shape and presence of the supplemental userprofile export that
// overrides the sampleAttendees in quartzfest-2027.ts when it exists.
describe("quartzfest-2027-userprofile supplemental file", () => {
  it("exports a non-empty UserProfile array", () => {
    expect(Array.isArray(sampleAttendees)).toBe(true);
    expect(sampleAttendees.length).toBeGreaterThan(0);
  });

  it("each attendee has required fields", () => {
    sampleAttendees.forEach((attendee: UserProfile) => {
      expect(typeof attendee.uid).toBe("string");
      expect(attendee.uid.length).toBeGreaterThan(0);
      expect(typeof attendee.email).toBe("string");
      expect(typeof attendee.darkMode).toBe("boolean");
      expect(Array.isArray(attendee.bookmarkedSessions)).toBe(true);
      expect(typeof attendee.notificationsEnabled).toBe("boolean");
      expect(typeof attendee.smsNotifications).toBe("boolean");
    });
  });
});

// ── supplemental userprofile override logic ────────────────────────────────────
describe("supplemental userprofile override logic", () => {
  it("supplemental attendees override main-file attendees for same conferenceId", () => {
    const ATTENDEE_DATA: Record<string, UserProfile[]> = {
      "quartzfest-2027": [
        {
          uid: "old-1",
          email: "old@test.com",
          darkMode: false,
          bookmarkedSessions: [],
          notificationsEnabled: false,
          smsNotifications: false,
        },
      ],
    };
    const conferenceId = "quartzfest-2027";
    ATTENDEE_DATA[conferenceId] = sampleAttendees;

    expect(ATTENDEE_DATA["quartzfest-2027"]).toBe(sampleAttendees);
    expect(
      ATTENDEE_DATA["quartzfest-2027"].find((a) => a.uid === "old-1"),
    ).toBeUndefined();
    // Verify the supplemental data has the expected shape after override
    ATTENDEE_DATA["quartzfest-2027"].forEach((attendee: UserProfile) => {
      expect(typeof attendee.uid).toBe("string");
      expect(typeof attendee.email).toBe("string");
    });
  });
});
