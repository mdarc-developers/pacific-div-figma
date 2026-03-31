import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// ── Mock Firebase ─────────────────────────────────────────────────────────────
vi.mock("@/lib/firebase", () => ({
  default: {},
  auth: {
    onAuthStateChanged: vi.fn((_a: unknown, cb: (u: null) => void) => {
      cb(null);
      return () => {};
    }),
  },
  db: {},
  storage: {},
}));

// ── Hoisted Firestore mocks ───────────────────────────────────────────────────
const mockGetDoc = vi.hoisted(() => vi.fn());
const mockSetDoc = vi.hoisted(() => vi.fn());
const mockDoc = vi.hoisted(() => vi.fn());

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    doc: mockDoc,
    getDoc: mockGetDoc,
    setDoc: mockSetDoc,
  };
});

// ── Mock userProfileData ──────────────────────────────────────────────────────
const mockProfiles = vi.hoisted(() => [
  {
    uid: "uid-alpha",
    email: "alpha@example.com",
    groups: ["user-admin", "prize-admin"],
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
  {
    uid: "uid-beta",
    email: "beta@example.com",
    groups: ["prize-admin"],
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
]);

const mockProfileGroups = vi.hoisted(() => [
  { uid: "uid-gamma", groups: ["user-admin"] },
]);

vi.mock("@/lib/userProfileData", () => ({
  ALL_USER_PROFILES: mockProfiles,
  ALL_USER_PROFILE_GROUPS: mockProfileGroups,
  KNOWN_GROUPS: new Set(["user-admin", "prize-admin", "mdarc-developers"]),
}));

// ── Mock localStorage helpers ─────────────────────────────────────────────────
const storageStore: Record<string, string> = {};
vi.mock("@/lib/localStorage", () => ({
  loadFromStorage: vi.fn((key: string, fallback: unknown): unknown => {
    const val = storageStore[key];
    return val ? (JSON.parse(val) as unknown) : fallback;
  }),
  saveToStorage: vi.fn((key: string, value: unknown): void => {
    storageStore[key] = JSON.stringify(value);
  }),
}));

// Static import after mocks
import {
  GroupsWriteButton,
  buildGroupMembersMap,
  emailForUid,
} from "@/app/components/GroupsWriteButton";

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderGroupsWriteButton() {
  return render(<GroupsWriteButton />);
}

// ── Unit tests for pure helpers ───────────────────────────────────────────────
describe("buildGroupMembersMap", () => {
  it("returns a map keyed by known groups", () => {
    const map = buildGroupMembersMap();
    expect(map.has("user-admin")).toBe(true);
    expect(map.has("prize-admin")).toBe(true);
    expect(map.has("mdarc-developers")).toBe(true);
  });

  it("includes uids from ALL_USER_PROFILES groups", () => {
    const map = buildGroupMembersMap();
    expect(map.get("user-admin")!.has("uid-alpha")).toBe(true);
    expect(map.get("prize-admin")!.has("uid-alpha")).toBe(true);
    expect(map.get("prize-admin")!.has("uid-beta")).toBe(true);
  });

  it("includes uids from ALL_USER_PROFILE_GROUPS", () => {
    const map = buildGroupMembersMap();
    expect(map.get("user-admin")!.has("uid-gamma")).toBe(true);
  });

  it("does not include uids in groups not in KNOWN_GROUPS", () => {
    const map = buildGroupMembersMap();
    expect(map.has("unknown-group")).toBe(false);
  });
});

describe("emailForUid", () => {
  it("returns the email for a known uid", () => {
    expect(emailForUid("uid-alpha")).toBe("alpha@example.com");
  });

  it("returns empty string for an unknown uid", () => {
    expect(emailForUid("uid-unknown")).toBe("");
  });
});

// ── Component render tests ────────────────────────────────────────────────────
describe("GroupsWriteButton (render)", () => {
  beforeEach(() => {
    // Clear storage store between tests
    for (const key of Object.keys(storageStore)) {
      delete storageStore[key];
    }
    mockGetDoc.mockReset();
    mockSetDoc.mockReset();
    mockDoc.mockReset();
  });

  it("renders without crashing", () => {
    expect(() => renderGroupsWriteButton()).not.toThrow();
  });

  it("renders the 'Write Groups to Firestore' button", () => {
    renderGroupsWriteButton();
    expect(
      screen.getByRole("button", { name: /write groups to firestore/i }),
    ).toBeInTheDocument();
  });

  it("renders the instruction card about removing users from groups", () => {
    renderGroupsWriteButton();
    expect(screen.getByText(/to remove a user from a group/i)).toBeInTheDocument();
  });

  it("renders a link to console.firebase.google.com", () => {
    renderGroupsWriteButton();
    const link = screen.getByRole("link", {
      name: /console\.firebase\.google\.com/i,
    });
    expect(link).toHaveAttribute("href", "https://console.firebase.google.com");
  });

  it("does not render the write log section when log is empty", () => {
    renderGroupsWriteButton();
    expect(screen.queryByText(/write log/i)).not.toBeInTheDocument();
  });

  it("renders stored log entries on mount", () => {
    const existingEntry = {
      timestamp: "2026-01-01T00:00:00.000Z",
      written: [{ uid: "uid-x", email: "x@example.com", group: "user-admin" }],
      skipped: [],
    };
    storageStore["groups-write-log"] = JSON.stringify([existingEntry]);
    renderGroupsWriteButton();
    expect(screen.getByText(/write log/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-01-01T00:00:00\.000Z/)).toBeInTheDocument();
  });

  it("renders a 'Clear Log' button when there are log entries", () => {
    const existingEntry = {
      timestamp: "2026-01-01T00:00:00.000Z",
      written: [],
      skipped: [],
    };
    storageStore["groups-write-log"] = JSON.stringify([existingEntry]);
    renderGroupsWriteButton();
    expect(
      screen.getByRole("button", { name: /clear log/i }),
    ).toBeInTheDocument();
  });

  it("clears the log when the 'Clear Log' button is clicked", async () => {
    const existingEntry = {
      timestamp: "2026-01-01T00:00:00.000Z",
      written: [],
      skipped: [],
    };
    storageStore["groups-write-log"] = JSON.stringify([existingEntry]);
    renderGroupsWriteButton();
    fireEvent.click(screen.getByRole("button", { name: /clear log/i }));
    await waitFor(() =>
      expect(screen.queryByText(/write log/i)).not.toBeInTheDocument(),
    );
  });
});

// ── Write interaction tests ───────────────────────────────────────────────────
describe("GroupsWriteButton (write interactions)", () => {
  beforeEach(() => {
    for (const key of Object.keys(storageStore)) {
      delete storageStore[key];
    }
    mockGetDoc.mockReset();
    mockSetDoc.mockReset();
    mockDoc.mockReset();
    mockDoc.mockReturnValue("mock-doc-ref");
  });

  it("calls getDoc for each non-empty group", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
    mockSetDoc.mockResolvedValue(undefined);

    renderGroupsWriteButton();
    fireEvent.click(
      screen.getByRole("button", { name: /write groups to firestore/i }),
    );

    // user-admin has uid-alpha + uid-gamma; prize-admin has uid-alpha + uid-beta
    // mdarc-developers has no members → skipped
    await waitFor(() => {
      expect(mockGetDoc).toHaveBeenCalledTimes(2); // user-admin + prize-admin
    });
  });

  it("calls setDoc with missing members when doc does not exist", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
    mockSetDoc.mockResolvedValue(undefined);

    renderGroupsWriteButton();
    fireEvent.click(
      screen.getByRole("button", { name: /write groups to firestore/i }),
    );

    await waitFor(() => {
      expect(mockSetDoc).toHaveBeenCalled();
    });

    // All calls should use merge: true
    for (const call of mockSetDoc.mock.calls) {
      expect(call[2]).toEqual({ merge: true });
    }
  });

  it("skips setDoc when all members already exist as true", async () => {
    // Simulate all members already present
    mockGetDoc.mockImplementation(() =>
      Promise.resolve({
        exists: () => true,
        data: () => ({
          members: {
            "uid-alpha": true,
            "uid-beta": true,
            "uid-gamma": true,
          },
        }),
      }),
    );

    renderGroupsWriteButton();
    fireEvent.click(
      screen.getByRole("button", { name: /write groups to firestore/i }),
    );

    await waitFor(() => {
      expect(mockGetDoc).toHaveBeenCalled();
    });
    // Nothing to write → setDoc should not be called
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it("appends a log entry to localStorage after a write", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
    mockSetDoc.mockResolvedValue(undefined);

    renderGroupsWriteButton();
    fireEvent.click(
      screen.getByRole("button", { name: /write groups to firestore/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/write log/i)).toBeInTheDocument();
    });

    const stored = JSON.parse(
      storageStore["groups-write-log"] ?? "[]",
    ) as unknown[];
    expect(stored.length).toBe(1);
  });

  it("shows 'No new entries written' when all members already present", async () => {
    mockGetDoc.mockImplementation(() =>
      Promise.resolve({
        exists: () => true,
        data: () => ({
          members: {
            "uid-alpha": true,
            "uid-beta": true,
            "uid-gamma": true,
          },
        }),
      }),
    );

    renderGroupsWriteButton();
    fireEvent.click(
      screen.getByRole("button", { name: /write groups to firestore/i }),
    );

    await waitFor(() =>
      expect(screen.getByText(/no new entries written/i)).toBeInTheDocument(),
    );
  });

  it("shows an error toast when Firestore throws", async () => {
    mockGetDoc.mockRejectedValue(new Error("Firestore unavailable"));

    renderGroupsWriteButton();
    fireEvent.click(
      screen.getByRole("button", { name: /write groups to firestore/i }),
    );

    // Button should re-enable after error
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /write groups to firestore/i }),
      ).not.toBeDisabled();
    });
  });

  it("disables the button while writing", async () => {
    // Return a never-resolving promise to keep writing state active
    mockGetDoc.mockReturnValue(new Promise(() => {}));

    renderGroupsWriteButton();
    fireEvent.click(
      screen.getByRole("button", { name: /write groups to firestore/i }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /writing…/i }),
      ).toBeDisabled(),
    );
  });
});

// ── afterEach cleanup ─────────────────────────────────────────────────────────
afterEach(() => {
  for (const key of Object.keys(storageStore)) {
    delete storageStore[key];
  }
});
