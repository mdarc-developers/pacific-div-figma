import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: {},
  storage: {},
}));

const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockDoc = vi.fn((_db: unknown, col: string, id: string) => ({
  path: `${col}/${id}`,
}));

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    getDoc: (...args: unknown[]) => mockGetDoc(...args),
    setDoc: (...args: unknown[]) => mockSetDoc(...args),
    doc: (...args: unknown[]) => mockDoc(...args),
  };
});

import {
  getUserTheme,
  setUserTheme,
  getUserActiveConferenceId,
  setUserActiveConferenceId,
  getUserBookmarks,
  setUserBookmarks,
  getUserExhibitorBookmarks,
  setUserExhibitorBookmarks,
  getUserNotes,
  setUserNotes,
  getUserExhibitorNotes,
  setUserExhibitorNotes,
  getUserSessionVotes,
  setUserSessionVotes,
  getUserExhibitorVotes,
  setUserExhibitorVotes,
  getUserNotificationSettings,
  setUserNotificationSettings,
  getUserHeaderCollapsed,
  setUserHeaderCollapsed,
  getUserActivitySections,
  setUserActivitySections,
  getUserProfileVisible,
  setUserProfileVisible,
  getUserRaffleTickets,
  setUserRaffleTickets,
} from "@/services/userSettingsService";
import type { NotificationSettings } from "@/services/userSettingsService";
import type { ActivitySections } from "@/app/contexts/ActivitySectionsContext";

// ── Shared helpers ────────────────────────────────────────────────────────────

/** Simulates a Firestore DocumentSnapshot that does not exist. */
const noSnap = () => ({ exists: () => false, data: () => undefined });

/** Simulates a Firestore DocumentSnapshot that exists with the given data. */
const snap = (data: Record<string, unknown>) => ({
  exists: () => true,
  data: () => data,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockSetDoc.mockResolvedValue(undefined);
});

// ── getUserTheme / setUserTheme ───────────────────────────────────────────────

describe("getUserTheme", () => {
  it("returns null when the user document does not exist", async () => {
    mockGetDoc.mockResolvedValue(noSnap());
    expect(await getUserTheme("uid1")).toBeNull();
  });

  it("returns 'light' when stored", async () => {
    mockGetDoc.mockResolvedValue(snap({ theme: "light" }));
    expect(await getUserTheme("uid1")).toBe("light");
  });

  it("returns 'dark' when stored", async () => {
    mockGetDoc.mockResolvedValue(snap({ theme: "dark" }));
    expect(await getUserTheme("uid1")).toBe("dark");
  });

  it("returns 'system' when stored", async () => {
    mockGetDoc.mockResolvedValue(snap({ theme: "system" }));
    expect(await getUserTheme("uid1")).toBe("system");
  });

  it("returns null for an unrecognised theme value", async () => {
    mockGetDoc.mockResolvedValue(snap({ theme: "solarized" }));
    expect(await getUserTheme("uid1")).toBeNull();
  });
});

describe("setUserTheme", () => {
  it("calls setDoc with the correct theme and merge:true", async () => {
    await setUserTheme("uid1", "dark");
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "users/uid1" }),
      { theme: "dark" },
      { merge: true },
    );
  });
});

// ── getUserActiveConferenceId / setUserActiveConferenceId ─────────────────────

describe("getUserActiveConferenceId", () => {
  it("returns null when the user document does not exist", async () => {
    mockGetDoc.mockResolvedValue(noSnap());
    expect(await getUserActiveConferenceId("uid1")).toBeNull();
  });

  it("returns the conference id string when set", async () => {
    mockGetDoc.mockResolvedValue(snap({ activeConferenceId: "pacificon-2026" }));
    expect(await getUserActiveConferenceId("uid1")).toBe("pacificon-2026");
  });

  it("returns null for an empty string", async () => {
    mockGetDoc.mockResolvedValue(snap({ activeConferenceId: "" }));
    expect(await getUserActiveConferenceId("uid1")).toBeNull();
  });

  it("returns null when the field is missing", async () => {
    mockGetDoc.mockResolvedValue(snap({}));
    expect(await getUserActiveConferenceId("uid1")).toBeNull();
  });
});

describe("setUserActiveConferenceId", () => {
  it("calls setDoc with the correct activeConferenceId and merge:true", async () => {
    await setUserActiveConferenceId("uid1", "pacificon-2026");
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "users/uid1" }),
      { activeConferenceId: "pacificon-2026" },
      { merge: true },
    );
  });
});

// ── getUserBookmarks / setUserBookmarks ───────────────────────────────────────

describe("getUserBookmarks", () => {
  it("returns empty arrays when the user document does not exist", async () => {
    mockGetDoc.mockResolvedValue(noSnap());
    expect(await getUserBookmarks("uid1", "conf-1")).toEqual({
      bookmarks: [],
      prevBookmarks: [],
    });
  });

  it("returns the stored bookmarks and prevBookmarks for the conference", async () => {
    mockGetDoc.mockResolvedValue(
      snap({
        bookmarks: { "conf-1": ["s1", "s2"] },
        prevBookmarks: { "conf-1": ["s0"] },
      }),
    );
    expect(await getUserBookmarks("uid1", "conf-1")).toEqual({
      bookmarks: ["s1", "s2"],
      prevBookmarks: ["s0"],
    });
  });

  it("returns empty arrays when the conference key is absent", async () => {
    mockGetDoc.mockResolvedValue(snap({ bookmarks: {}, prevBookmarks: {} }));
    expect(await getUserBookmarks("uid1", "conf-1")).toEqual({
      bookmarks: [],
      prevBookmarks: [],
    });
  });
});

describe("setUserBookmarks", () => {
  it("calls setDoc with bookmarks and prevBookmarks nested under the conferenceId", async () => {
    await setUserBookmarks("uid1", "conf-1", ["s1"], ["s0"]);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "users/uid1" }),
      {
        bookmarks: { "conf-1": ["s1"] },
        prevBookmarks: { "conf-1": ["s0"] },
      },
      { merge: true },
    );
  });
});

// ── getUserExhibitorBookmarks / setUserExhibitorBookmarks ─────────────────────

describe("getUserExhibitorBookmarks", () => {
  it("returns empty arrays when the user document does not exist", async () => {
    mockGetDoc.mockResolvedValue(noSnap());
    expect(await getUserExhibitorBookmarks("uid1", "conf-1")).toEqual({
      bookmarks: [],
      prevBookmarks: [],
    });
  });

  it("returns the stored exhibitor bookmarks for the conference", async () => {
    mockGetDoc.mockResolvedValue(
      snap({
        exhibitorBookmarks: { "conf-1": ["e1", "e2"] },
        prevExhibitorBookmarks: { "conf-1": ["e0"] },
      }),
    );
    expect(await getUserExhibitorBookmarks("uid1", "conf-1")).toEqual({
      bookmarks: ["e1", "e2"],
      prevBookmarks: ["e0"],
    });
  });
});

describe("setUserExhibitorBookmarks", () => {
  it("calls setDoc with exhibitorBookmarks nested under the conferenceId", async () => {
    await setUserExhibitorBookmarks("uid1", "conf-1", ["e1"], []);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "users/uid1" }),
      {
        exhibitorBookmarks: { "conf-1": ["e1"] },
        prevExhibitorBookmarks: { "conf-1": [] },
      },
      { merge: true },
    );
  });
});

// ── getUserNotes / setUserNotes ───────────────────────────────────────────────

describe("getUserNotes", () => {
  it("returns an empty object when the user document does not exist", async () => {
    mockGetDoc.mockResolvedValue(noSnap());
    expect(await getUserNotes("uid1", "conf-1")).toEqual({});
  });

  it("returns the notes map for the conference", async () => {
    mockGetDoc.mockResolvedValue(
      snap({ notes: { "conf-1": { "session-a": "great talk" } } }),
    );
    expect(await getUserNotes("uid1", "conf-1")).toEqual({
      "session-a": "great talk",
    });
  });

  it("returns an empty object when the conference key is absent", async () => {
    mockGetDoc.mockResolvedValue(snap({ notes: {} }));
    expect(await getUserNotes("uid1", "conf-1")).toEqual({});
  });

  it("returns an empty object when the notes field is an array (malformed)", async () => {
    mockGetDoc.mockResolvedValue(snap({ notes: { "conf-1": ["not-an-object"] } }));
    expect(await getUserNotes("uid1", "conf-1")).toEqual({});
  });
});

describe("setUserNotes", () => {
  it("calls setDoc with notes nested under the conferenceId", async () => {
    await setUserNotes("uid1", "conf-1", { "session-a": "my note" });
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "users/uid1" }),
      { notes: { "conf-1": { "session-a": "my note" } } },
      { merge: true },
    );
  });
});

// ── getUserExhibitorNotes / setUserExhibitorNotes ─────────────────────────────

describe("getUserExhibitorNotes", () => {
  it("returns an empty object when the user document does not exist", async () => {
    mockGetDoc.mockResolvedValue(noSnap());
    expect(await getUserExhibitorNotes("uid1", "conf-1")).toEqual({});
  });

  it("returns the exhibitor notes map for the conference", async () => {
    mockGetDoc.mockResolvedValue(
      snap({ exhibitorNotes: { "conf-1": { "exhibitor-a": "nice booth" } } }),
    );
    expect(await getUserExhibitorNotes("uid1", "conf-1")).toEqual({
      "exhibitor-a": "nice booth",
    });
  });
});

describe("setUserExhibitorNotes", () => {
  it("calls setDoc with exhibitorNotes nested under the conferenceId", async () => {
    await setUserExhibitorNotes("uid1", "conf-1", { "exhibitor-a": "nice booth" });
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "users/uid1" }),
      { exhibitorNotes: { "conf-1": { "exhibitor-a": "nice booth" } } },
      { merge: true },
    );
  });
});

// ── getUserSessionVotes / setUserSessionVotes ─────────────────────────────────

describe("getUserSessionVotes", () => {
  it("returns an empty array when the user document does not exist", async () => {
    mockGetDoc.mockResolvedValue(noSnap());
    expect(await getUserSessionVotes("uid1", "conf-1")).toEqual([]);
  });

  it("returns the session votes for the conference", async () => {
    mockGetDoc.mockResolvedValue(
      snap({ sessionVotes: { "conf-1": ["s1", "s2"] } }),
    );
    expect(await getUserSessionVotes("uid1", "conf-1")).toEqual(["s1", "s2"]);
  });

  it("returns an empty array when the conference key is absent", async () => {
    mockGetDoc.mockResolvedValue(snap({ sessionVotes: {} }));
    expect(await getUserSessionVotes("uid1", "conf-1")).toEqual([]);
  });
});

describe("setUserSessionVotes", () => {
  it("calls setDoc with sessionVotes nested under the conferenceId", async () => {
    await setUserSessionVotes("uid1", "conf-1", ["s1", "s2"]);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "users/uid1" }),
      { sessionVotes: { "conf-1": ["s1", "s2"] } },
      { merge: true },
    );
  });
});

// ── getUserExhibitorVotes / setUserExhibitorVotes ─────────────────────────────

describe("getUserExhibitorVotes", () => {
  it("returns an empty array when the user document does not exist", async () => {
    mockGetDoc.mockResolvedValue(noSnap());
    expect(await getUserExhibitorVotes("uid1", "conf-1")).toEqual([]);
  });

  it("returns the exhibitor votes for the conference", async () => {
    mockGetDoc.mockResolvedValue(
      snap({ exhibitorVotes: { "conf-1": ["e1"] } }),
    );
    expect(await getUserExhibitorVotes("uid1", "conf-1")).toEqual(["e1"]);
  });
});

describe("setUserExhibitorVotes", () => {
  it("calls setDoc with exhibitorVotes nested under the conferenceId", async () => {
    await setUserExhibitorVotes("uid1", "conf-1", ["e1"]);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "users/uid1" }),
      { exhibitorVotes: { "conf-1": ["e1"] } },
      { merge: true },
    );
  });
});

// ── getUserNotificationSettings / setUserNotificationSettings ────────────────

describe("getUserNotificationSettings", () => {
  it("returns null when the user document does not exist", async () => {
    mockGetDoc.mockResolvedValue(noSnap());
    expect(await getUserNotificationSettings("uid1")).toBeNull();
  });

  it("returns the stored notification settings", async () => {
    mockGetDoc.mockResolvedValue(
      snap({ smsNotifications: true, phoneNumber: "+15095551234", minutesBefore: 15, emailNotifications: false, cloudNotifications: false }),
    );
    expect(await getUserNotificationSettings("uid1")).toEqual({
      smsEnabled: true,
      phoneNumber: "+15095551234",
      minutesBefore: 15,
      emailEnabled: false,
      cloudAlertsEnabled: false,
    });
  });

  it("defaults smsEnabled to false when the field is missing", async () => {
    mockGetDoc.mockResolvedValue(snap({ phoneNumber: "+15095551234", minutesBefore: 5 }));
    const result = await getUserNotificationSettings("uid1");
    expect(result!.smsEnabled).toBe(false);
  });

  it("defaults phoneNumber to empty string when the field is missing", async () => {
    mockGetDoc.mockResolvedValue(snap({ smsNotifications: false, minutesBefore: 5 }));
    const result = await getUserNotificationSettings("uid1");
    expect(result!.phoneNumber).toBe("");
  });

  it("defaults minutesBefore to 10 when the field is missing", async () => {
    mockGetDoc.mockResolvedValue(snap({ smsNotifications: false, phoneNumber: "" }));
    const result = await getUserNotificationSettings("uid1");
    expect(result!.minutesBefore).toBe(10);
  });

  it("defaults emailEnabled to true when the field is missing", async () => {
    mockGetDoc.mockResolvedValue(snap({ smsNotifications: false, phoneNumber: "", minutesBefore: 10 }));
    const result = await getUserNotificationSettings("uid1");
    expect(result!.emailEnabled).toBe(true);
  });

  it("defaults cloudAlertsEnabled to false when the field is missing", async () => {
    mockGetDoc.mockResolvedValue(snap({ smsNotifications: false, phoneNumber: "", minutesBefore: 10 }));
    const result = await getUserNotificationSettings("uid1");
    expect(result!.cloudAlertsEnabled).toBe(false);
  });

  it("reads cloudAlertsEnabled from cloudNotifications field", async () => {
    mockGetDoc.mockResolvedValue(snap({ cloudNotifications: true }));
    const result = await getUserNotificationSettings("uid1");
    expect(result!.cloudAlertsEnabled).toBe(true);
  });
});

describe("setUserNotificationSettings", () => {
  it("calls setDoc with the correct notification fields", async () => {
    const settings: NotificationSettings = {
      smsEnabled: true,
      phoneNumber: "+15095551234",
      minutesBefore: 20,
      emailEnabled: false,
      cloudAlertsEnabled: true,
    };
    await setUserNotificationSettings("uid1", settings);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "users/uid1" }),
      {
        smsNotifications: true,
        phoneNumber: "+15095551234",
        minutesBefore: 20,
        emailNotifications: false,
        cloudNotifications: true,
      },
      { merge: true },
    );
  });
});

// ── getUserHeaderCollapsed / setUserHeaderCollapsed ───────────────────────────

describe("getUserHeaderCollapsed", () => {
  it("returns null when the user document does not exist", async () => {
    mockGetDoc.mockResolvedValue(noSnap());
    expect(await getUserHeaderCollapsed("uid1")).toBeNull();
  });

  it("returns true when the headerCollapsed field is true", async () => {
    mockGetDoc.mockResolvedValue(snap({ headerCollapsed: true }));
    expect(await getUserHeaderCollapsed("uid1")).toBe(true);
  });

  it("returns false when the headerCollapsed field is false", async () => {
    mockGetDoc.mockResolvedValue(snap({ headerCollapsed: false }));
    expect(await getUserHeaderCollapsed("uid1")).toBe(false);
  });

  it("returns null when the field is missing", async () => {
    mockGetDoc.mockResolvedValue(snap({}));
    expect(await getUserHeaderCollapsed("uid1")).toBeNull();
  });
});

describe("setUserHeaderCollapsed", () => {
  it("calls setDoc with headerCollapsed and merge:true", async () => {
    await setUserHeaderCollapsed("uid1", true);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "users/uid1" }),
      { headerCollapsed: true },
      { merge: true },
    );
  });
});

// ── getUserActivitySections / setUserActivitySections ────────────────────────

const fullSections: ActivitySections = {
  bookmarkedSessions: true,
  bookmarkedExhibitors: false,
  votedSessions: true,
  votedExhibitors: false,
  myNotes: true,
  raffleTickets: true,
  myExhibitorNotes: false,
};

describe("getUserActivitySections", () => {
  it("returns null when the user document does not exist", async () => {
    mockGetDoc.mockResolvedValue(noSnap());
    expect(await getUserActivitySections("uid1")).toBeNull();
  });

  it("returns the stored activity sections", async () => {
    mockGetDoc.mockResolvedValue(snap({ activitySections: fullSections }));
    expect(await getUserActivitySections("uid1")).toEqual(fullSections);
  });

  it("defaults boolean fields to true when missing", async () => {
    mockGetDoc.mockResolvedValue(snap({ activitySections: {} }));
    const result = await getUserActivitySections("uid1");
    expect(result).toEqual({
      bookmarkedSessions: true,
      bookmarkedExhibitors: true,
      votedSessions: true,
      votedExhibitors: true,
      myNotes: true,
      raffleTickets: true,
      myExhibitorNotes: true,
    });
  });

  it("returns null when activitySections is an array (malformed)", async () => {
    mockGetDoc.mockResolvedValue(snap({ activitySections: ["bad"] }));
    expect(await getUserActivitySections("uid1")).toBeNull();
  });

  it("returns null when activitySections is null", async () => {
    mockGetDoc.mockResolvedValue(snap({ activitySections: null }));
    expect(await getUserActivitySections("uid1")).toBeNull();
  });
});

describe("setUserActivitySections", () => {
  it("calls setDoc with activitySections and merge:true", async () => {
    await setUserActivitySections("uid1", fullSections);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "users/uid1" }),
      { activitySections: fullSections },
      { merge: true },
    );
  });
});

// ── getUserProfileVisible / setUserProfileVisible ─────────────────────────────

describe("getUserProfileVisible", () => {
  it("returns null when the user document does not exist", async () => {
    mockGetDoc.mockResolvedValue(noSnap());
    expect(await getUserProfileVisible("uid1")).toBeNull();
  });

  it("returns true when the profileVisible field is true", async () => {
    mockGetDoc.mockResolvedValue(snap({ profileVisible: true }));
    expect(await getUserProfileVisible("uid1")).toBe(true);
  });

  it("returns false when the profileVisible field is false", async () => {
    mockGetDoc.mockResolvedValue(snap({ profileVisible: false }));
    expect(await getUserProfileVisible("uid1")).toBe(false);
  });

  it("returns null when the field is missing", async () => {
    mockGetDoc.mockResolvedValue(snap({}));
    expect(await getUserProfileVisible("uid1")).toBeNull();
  });
});

describe("setUserProfileVisible", () => {
  it("calls setDoc with profileVisible and merge:true", async () => {
    await setUserProfileVisible("uid1", true);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "users/uid1" }),
      { profileVisible: true },
      { merge: true },
    );
  });
});

// ── getUserRaffleTickets / setUserRaffleTickets ────────────────────────────────

describe("getUserRaffleTickets", () => {
  it("returns an empty array when the user document does not exist", async () => {
    mockGetDoc.mockResolvedValue(noSnap());
    expect(await getUserRaffleTickets("uid1", "conf-2026")).toEqual([]);
  });

  it("returns an empty array when raffleTickets field is missing", async () => {
    mockGetDoc.mockResolvedValue(snap({}));
    expect(await getUserRaffleTickets("uid1", "conf-2026")).toEqual([]);
  });

  it("returns the tickets array for the given conferenceId", async () => {
    mockGetDoc.mockResolvedValue(
      snap({ raffleTickets: { "conf-2026": ["1001", "1002"] } }),
    );
    expect(await getUserRaffleTickets("uid1", "conf-2026")).toEqual([
      "1001",
      "1002",
    ]);
  });

  it("returns an empty array when conferenceId is not present in the map", async () => {
    mockGetDoc.mockResolvedValue(
      snap({ raffleTickets: { "other-conf": ["9999"] } }),
    );
    expect(await getUserRaffleTickets("uid1", "conf-2026")).toEqual([]);
  });
});

describe("setUserRaffleTickets", () => {
  it("calls setDoc with raffleTickets keyed by conferenceId and merge:true", async () => {
    await setUserRaffleTickets("uid1", "conf-2026", ["1001", "1002"]);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "users/uid1" }),
      { raffleTickets: { "conf-2026": ["1001", "1002"] } },
      { merge: true },
    );
  });

  it("calls setDoc with an empty array when tickets is empty", async () => {
    await setUserRaffleTickets("uid1", "conf-2026", []);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "users/uid1" }),
      { raffleTickets: { "conf-2026": [] } },
      { merge: true },
    );
  });
});
