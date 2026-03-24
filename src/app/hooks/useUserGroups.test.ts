import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { UserProfileGroups, UserProfile } from "@/types/conference";

// ── Mock AuthContext ──────────────────────────────────────────────────────────
const mockUser = vi.hoisted(() => ({
  current: null as { uid: string; email: string | null } | null,
}));

vi.mock("@/app/contexts/AuthContext", () => ({
  useAuth: () => ({ user: mockUser.current }),
}));

// ── Mock userProfileData ──────────────────────────────────────────────────────
const mockAllUserProfileGroups = vi.hoisted<UserProfileGroups[]>(() => []);
const mockAllUserProfiles = vi.hoisted<UserProfile[]>(() => []);

vi.mock("@/lib/userProfileData", () => ({
  get ALL_USER_PROFILE_GROUPS() {
    return mockAllUserProfileGroups;
  },
  get ALL_USER_PROFILES() {
    return mockAllUserProfiles;
  },
}));

// Static import after mocks are declared (vi.mock is hoisted by Vitest)
import { useUserGroups } from "@/app/hooks/useUserGroups";

describe("useUserGroups", () => {
  it("returns an empty array when user is null", () => {
    mockUser.current = null;
    const { result } = renderHook(() => useUserGroups());
    expect(result.current).toEqual([]);
  });

  it("returns groups found via uid in ALL_USER_PROFILE_GROUPS", () => {
    mockUser.current = { uid: "uid-1", email: null };
    mockAllUserProfileGroups.splice(0);
    mockAllUserProfileGroups.push({
      uid: "uid-1",
      groups: ["prize-admin", "mdarc-developers"],
    });

    const { result } = renderHook(() => useUserGroups());
    expect(result.current).toEqual(["prize-admin", "mdarc-developers"]);
  });

  it("returns groups found via email in ALL_USER_PROFILES", () => {
    mockUser.current = { uid: "uid-unknown", email: "alice@example.com" };
    mockAllUserProfileGroups.splice(0);
    mockAllUserProfiles.splice(0);
    mockAllUserProfiles.push({
      uid: "uid-profile",
      email: "alice@example.com",
      darkMode: false,
      bookmarkedSessions: [],
      notificationsEnabled: false,
      smsNotifications: false,
      groups: ["volunteers"],
    });

    const { result } = renderHook(() => useUserGroups());
    expect(result.current).toEqual(["volunteers"]);
  });

  it("deduplicates groups that appear in both data sources", () => {
    mockUser.current = { uid: "uid-2", email: "bob@example.com" };
    mockAllUserProfileGroups.splice(0);
    mockAllUserProfileGroups.push({ uid: "uid-2", groups: ["prize-admin"] });
    mockAllUserProfiles.splice(0);
    mockAllUserProfiles.push({
      uid: "uid-profile-2",
      email: "bob@example.com",
      darkMode: false,
      bookmarkedSessions: [],
      notificationsEnabled: false,
      smsNotifications: false,
      groups: ["prize-admin", "mdarc-developers"],
    });

    const { result } = renderHook(() => useUserGroups());
    expect(result.current).toEqual(["prize-admin", "mdarc-developers"]);
  });

  it("collects groups from ALL profiles matching the user's email (multi-conference)", () => {
    // Simulates grantbow@mdarc.org having profiles in multiple conference files:
    // hamcation-2027 (prize-admin, mdarc-developers) and loomis-2026
    // (prize-admin, forums-admin, exhibitor-admin, more-admin).
    // The hook must collect groups from every matching profile, not just the first.
    mockUser.current = { uid: "uid-nobody", email: "grantbow@mdarc.org" };
    mockAllUserProfileGroups.splice(0);
    mockAllUserProfiles.splice(0);
    mockAllUserProfiles.push(
      {
        uid: "uid-ham",
        email: "grantbow@mdarc.org",
        darkMode: false,
        bookmarkedSessions: [],
        notificationsEnabled: true,
        smsNotifications: true,
        groups: ["prize-admin", "mdarc-developers"],
      },
      {
        uid: "uid-loomis",
        email: "grantbow@mdarc.org",
        darkMode: false,
        bookmarkedSessions: [],
        notificationsEnabled: true,
        smsNotifications: true,
        groups: ["prize-admin", "forums-admin", "exhibitor-admin", "more-admin"],
      },
    );

    const { result } = renderHook(() => useUserGroups());
    expect(result.current).toContain("more-admin");
    expect(result.current).toContain("prize-admin");
    expect(result.current).toContain("mdarc-developers");
    expect(result.current).toContain("forums-admin");
    expect(result.current).toContain("exhibitor-admin");
    // Deduplication: prize-admin appears in both profiles but only once in result
    expect(result.current.filter((g) => g === "prize-admin").length).toBe(1);
  });

  it("returns empty array when user has no email and no uid match", () => {
    mockUser.current = { uid: "uid-nobody", email: null };
    mockAllUserProfileGroups.splice(0);
    mockAllUserProfiles.splice(0);

    const { result } = renderHook(() => useUserGroups());
    expect(result.current).toEqual([]);
  });

  it("handles missing email gracefully when uid matches", () => {
    mockUser.current = { uid: "uid-3", email: null };
    mockAllUserProfileGroups.splice(0);
    mockAllUserProfileGroups.push({ uid: "uid-3", groups: ["test-group"] });
    mockAllUserProfiles.splice(0);

    const { result } = renderHook(() => useUserGroups());
    expect(result.current).toEqual(["test-group"]);
  });
});
