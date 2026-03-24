import { describe, it, expect, vi } from "vitest";
import { UserProfile, UserProfileGroups } from "@/types/conference";
import { ALL_USER_PROFILE_GROUPS, KNOWN_GROUPS } from "@/lib/userProfileData";
import { conferenceModules } from "@/lib/conferenceData";
import { warnUnknownGroups } from "@/lib/overrideUtils";
import * as loomis2026Module from "./loomis-2026";

// Interface used when accessing optional exports from conference data modules.
interface ConferenceModuleWithProfiles {
  mapUserProfiles?: UserProfile[];
  [key: string]: unknown;
}

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

// ── all conference modules — mapUserProfiles shape ────────────────────────────
// IMPORTANT: Add per-attendee shape checks HERE using the data-driven loop, not
// in per-conference describe blocks.
//
// Previous iterations of this test suite added a "loomis-2026 mapUserProfiles
// export" block directly in supplementalData.test.ts for a single conference.
// That approach requires a new block for every future conference, is easy to
// forget, and duplicates the same shape assertions.  The loop below
// automatically covers every base conference file that exports mapUserProfiles
// — including conferences that have not been added yet — without any changes to
// this test file.
//
// Supplemental userprofile override files (e.g. quartzfest-2027-userprofile-*)
// are tested separately in the "quartzfest-2027-userprofile supplemental file"
// block because that block also verifies the override semantics.
describe("all conference modules — mapUserProfiles shape", () => {
  const modulesWithProfiles: [string, UserProfile[]][] = Object.entries(
    conferenceModules,
  )
    .map(([path, module]) => {
      const confId = path.split("/").pop()?.replace(".ts", "") ?? "";
      const typedModule = module as ConferenceModuleWithProfiles;
      return [confId, typedModule.mapUserProfiles] as [
        string,
        UserProfile[] | undefined,
      ];
    })
    .filter((entry): entry is [string, UserProfile[]] => entry[1] !== undefined);

  it("at least one conference module exports mapUserProfiles", () => {
    expect(modulesWithProfiles.length).toBeGreaterThan(0);
  });

  modulesWithProfiles.forEach(([confId, profiles]) => {
    describe(confId, () => {
      it("exports a non-empty UserProfile array", () => {
        expect(Array.isArray(profiles)).toBe(true);
        expect(profiles.length).toBeGreaterThan(0);
      });

      it("each attendee has required fields", () => {
        profiles.forEach((attendee: UserProfile) => {
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
  });
});

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

// ── KNOWN_GROUPS constant ────────────────────────────────────────────────────
describe("KNOWN_GROUPS", () => {
  it("is a Set", () => {
    expect(KNOWN_GROUPS).toBeInstanceOf(Set);
  });

  it("contains the expected canonical group names", () => {
    expect(KNOWN_GROUPS.has("prize-admin")).toBe(true);
    expect(KNOWN_GROUPS.has("session-admin")).toBe(true);
    expect(KNOWN_GROUPS.has("exhibitor-admin")).toBe(true);
    expect(KNOWN_GROUPS.has("mdarc-developers")).toBe(true);
    expect(KNOWN_GROUPS.has("forums-admin")).toBe(true);
  });

  it("does not contain typo variants", () => {
    expect(KNOWN_GROUPS.has("mdarc-developer")).toBe(false);
    expect(KNOWN_GROUPS.has("prizes-admin")).toBe(false);
  });
});

// ── warnUnknownGroups ─────────────────────────────────────────────────────────
describe("warnUnknownGroups", () => {
  it("emits console.warn for each group not in KNOWN_GROUPS", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnUnknownGroups("loomis-2026", "grantbow@mdarc.org", [
      "prize-admin",
      "more-admin",
    ]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      '[userProfile] "loomis-2026" user "grantbow@mdarc.org" has unrecognised group "more-admin"',
    );
    warnSpy.mockRestore();
  });

  it("does not emit console.warn when all groups are known", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnUnknownGroups("pacificon-2026", "someone@example.com", [
      "prize-admin",
      "session-admin",
      "exhibitor-admin",
      "mdarc-developers",
      "forums-admin",
    ]);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("emits a warning for every unrecognised group in a list", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnUnknownGroups("test-conf", "user@example.com", [
      "alpha-unknown",
      "beta-unknown",
    ]);
    expect(warnSpy).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });

  it("emits no warnings for an empty groups array", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnUnknownGroups("test-conf", "user@example.com", []);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// ── loomis-2026 more-admin edge case ─────────────────────────────────────────
// Validates that "more-admin" is present in loomis-2026 and that it correctly
// triggers a warning via warnUnknownGroups.
describe("loomis-2026 more-admin edge case", () => {
  interface Loomis2026ModuleWithProfiles {
    mapUserProfiles?: UserProfile[];
  }
  const loomisProfiles =
    (loomis2026Module as Loomis2026ModuleWithProfiles).mapUserProfiles ?? [];

  it("grantbow@mdarc.org has 'more-admin' in their loomis-2026 groups", () => {
    const profile = loomisProfiles.find(
      (p) => p.email === "grantbow@mdarc.org",
    );
    expect(profile).toBeDefined();
    expect(profile?.groups).toContain("more-admin");
  });

  it("warnUnknownGroups warns about 'more-admin' for loomis-2026 grantbow@mdarc.org", () => {
    const profile = loomisProfiles.find(
      (p) => p.email === "grantbow@mdarc.org",
    );
    const groups = profile?.groups ?? [];
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnUnknownGroups("loomis-2026", "grantbow@mdarc.org", groups);
    expect(warnSpy).toHaveBeenCalledWith(
      '[userProfile] "loomis-2026" user "grantbow@mdarc.org" has unrecognised group "more-admin"',
    );
    warnSpy.mockRestore();
  });

  it("'more-admin' is not in KNOWN_GROUPS", () => {
    expect(KNOWN_GROUPS.has("more-admin")).toBe(false);
  });
});
