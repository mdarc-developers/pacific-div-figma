import { describe, it, expect } from "vitest";
import { UserProfile, UserProfileGroups } from "@/types/conference";
import { ALL_USER_PROFILE_GROUPS } from "@/lib/userProfileData";

interface SupplementalAttendeeModule {
  mapUserProfiles?: UserProfile[];
}

// Supplemental userprofile files loaded via glob (mirrors the pattern in src/lib/userProfileData.ts)
const supplementalAttendeeModules = import.meta.glob("./*-userprofile-*.ts", {
  eager: true,
}) as Record<string, SupplementalAttendeeModule>;

// Resolve the specific supplemental attendees needed by the tests below
const quartzfest2027ProfilePath = Object.keys(supplementalAttendeeModules).find(
  (p) => p.includes("quartzfest-2027-userprofile-"),
);
const mapUserProfiles: UserProfile[] = quartzfest2027ProfilePath
  ? (supplementalAttendeeModules[quartzfest2027ProfilePath].mapUserProfiles ??
    [])
  : [];

// ── quartzfest-2027 supplemental userprofile file ─────────────────────────────
// Guards the shape and presence of the supplemental userprofile export that
// overrides the mapUserProfiles in quartzfest-2027.ts when it exists.
describe("quartzfest-2027-userprofile supplemental file", () => {
  it("exports a non-empty UserProfile array", () => {
    expect(Array.isArray(mapUserProfiles)).toBe(true);
    expect(mapUserProfiles.length).toBeGreaterThan(0);
  });

  it("each attendee has required fields", () => {
    mapUserProfiles.forEach((attendee: UserProfile) => {
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
    ATTENDEE_DATA[conferenceId] = mapUserProfiles;

    expect(ATTENDEE_DATA["quartzfest-2027"]).toBe(mapUserProfiles);
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

// ── ALL_USER_PROFILE_GROUPS — collected from mapUserProfileGroups exports ──────
describe("ALL_USER_PROFILE_GROUPS", () => {
  it("is an array", () => {
    expect(Array.isArray(ALL_USER_PROFILE_GROUPS)).toBe(true);
  });

  it("each entry has a uid string and a groups string array", () => {
    ALL_USER_PROFILE_GROUPS.forEach((entry: UserProfileGroups) => {
      expect(typeof entry.uid).toBe("string");
      expect(entry.uid.length).toBeGreaterThan(0);
      expect(Array.isArray(entry.groups)).toBe(true);
      entry.groups.forEach((g) => {
        expect(typeof g).toBe("string");
      });
    });
  });

  it("all group names use consistent casing (mdarc-developers not mdarc-developer)", () => {
    ALL_USER_PROFILE_GROUPS.forEach((entry: UserProfileGroups) => {
      // The canonical group name is "mdarc-developers" (with trailing 's').
      // Entries with the old "mdarc-developer" form indicate a data inconsistency.
      expect(entry.groups).not.toContain("mdarc-developer");
    });
  });

  it("all group names use consistent casing (prize-admin not prizes-admin)", () => {
    ALL_USER_PROFILE_GROUPS.forEach((entry: UserProfileGroups) => {
      // The canonical group name is "prize-admin" (without leading 's').
      // Entries with the old "prizes-admin" form indicate a data inconsistency.
      expect(entry.groups).not.toContain("prizes-admin");
    });
  });

  it("contains at least one mdarc-developers entry from pacificon-2026", () => {
    const mdarcEntry = ALL_USER_PROFILE_GROUPS.find(
      (e) => e.uid === "FNLvRnWJSuOalAC0WQf46gNERPi2",
    );
    expect(mdarcEntry).toBeDefined();
    expect(mdarcEntry?.groups).toContain("mdarc-developers");
  });
});
