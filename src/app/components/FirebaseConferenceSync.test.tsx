import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, waitFor, act } from "@testing-library/react";

// ── Hoisted mock functions (must be declared before vi.mock factory hoisting) ─
const mockGetUserActiveConferenceId = vi.hoisted(() => vi.fn());
const mockSetUserActiveConferenceId = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined),
);

// ── Mock Firebase so AuthContext initialises without credentials ──────────────
vi.mock("@/lib/firebase", () => ({
  auth: {
    onAuthStateChanged: vi.fn((_a: unknown, cb: (u: null) => void) => {
      cb(null);
      return () => {};
    }),
  },
  db: {},
  storage: {},
}));

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...actual,
    onAuthStateChanged: vi.fn((_a: unknown, cb: (u: null) => void) => {
      cb(null);
      return () => {};
    }),
  };
});

// ── Mocks for Firestore conference sync services ──────────────────────────────
vi.mock("@/services/userSettingsService", () => ({
  getUserActiveConferenceId: mockGetUserActiveConferenceId,
  setUserActiveConferenceId: mockSetUserActiveConferenceId,
  // Other services used by sibling sync components
  getUserRaffleTickets: vi.fn().mockResolvedValue([]),
  setUserRaffleTickets: vi.fn().mockResolvedValue(undefined),
}));

// Static imports must come after vi.mock() calls (Vitest hoists mocks)
import {
  ConferenceProvider,
  useConference,
  CONFERENCE_STORAGE_KEY,
} from "@/app/contexts/ConferenceContext";
import { FirebaseConferenceSync } from "@/app/components/FirebaseConferenceSync";
import { allConferences } from "@/data/all-conferences";

// ── Shared test conference IDs ────────────────────────────────────────────────
const CONF_LOCAL_ID = "pacificon-2026"; // stored in localStorage by the user
const CONF_FIRESTORE_ID = "seapac-2026"; // different value saved in Firestore

// ── Helper: a minimal AuthContext mock ───────────────────────────────────────
type FakeUser = { uid: string };
let fakeUser: FakeUser | null = null;

vi.mock("@/app/contexts/AuthContext", () => ({
  useAuth: () => ({ user: fakeUser }),
}));

// ── Wrapper that mounts ConferenceProvider + FirebaseConferenceSync ───────────
function Wrapper({ children }: { children?: React.ReactNode }) {
  return (
    <ConferenceProvider>
      <FirebaseConferenceSync />
      {children}
    </ConferenceProvider>
  );
}

// ── Helper component to capture active conference ─────────────────────────────
let capturedConferenceId = "";
function ConferenceCapture() {
  const { activeConference } = useConference();
  capturedConferenceId = activeConference.id;
  return null;
}

describe("FirebaseConferenceSync", () => {
  beforeEach(() => {
    localStorage.clear();
    fakeUser = null;
    capturedConferenceId = "";
    mockGetUserActiveConferenceId.mockReset();
    mockSetUserActiveConferenceId.mockReset();
    mockSetUserActiveConferenceId.mockResolvedValue(undefined);
  });

  it("uses localStorage value on page reload instead of overriding with Firestore", async () => {
    // Pre-seed localStorage (simulating a returning user who already picked a conference)
    localStorage.setItem(CONFERENCE_STORAGE_KEY, CONF_LOCAL_ID);

    // Firestore has a different conference stored for this user
    mockGetUserActiveConferenceId.mockResolvedValue(CONF_FIRESTORE_ID);

    fakeUser = { uid: "user-123" };

    render(
      <Wrapper>
        <ConferenceCapture />
      </Wrapper>,
    );

    // Wait long enough for async effects to settle
    await waitFor(() => {
      expect(capturedConferenceId).toBe(CONF_LOCAL_ID);
    });

    // Firestore read should NOT have been called — localStorage took priority
    expect(mockGetUserActiveConferenceId).not.toHaveBeenCalled();

    // Local preference should be pushed to Firestore to keep devices in sync
    await waitFor(() => {
      expect(mockSetUserActiveConferenceId).toHaveBeenCalledWith(
        "user-123",
        CONF_LOCAL_ID,
      );
    });
  });

  it("falls back to Firestore when localStorage has no stored conference (fresh device or cleared storage)", async () => {
    // localStorage has no conference key — simulates a fresh device / cleared storage
    // (Do not seed localStorage)

    mockGetUserActiveConferenceId.mockResolvedValue(CONF_FIRESTORE_ID);

    fakeUser = { uid: "user-456" };

    render(
      <Wrapper>
        <ConferenceCapture />
      </Wrapper>,
    );

    // Firestore value should be applied
    await waitFor(() => {
      expect(capturedConferenceId).toBe(CONF_FIRESTORE_ID);
    });

    expect(mockGetUserActiveConferenceId).toHaveBeenCalledWith("user-456");
    // Should NOT write back the value we just read from Firestore
    expect(mockSetUserActiveConferenceId).not.toHaveBeenCalled();
  });

  it("saves conference change to Firestore after initial load", async () => {
    localStorage.setItem(CONFERENCE_STORAGE_KEY, CONF_LOCAL_ID);
    mockGetUserActiveConferenceId.mockResolvedValue(CONF_LOCAL_ID);

    fakeUser = { uid: "user-789" };

    let setConference!: (c: (typeof allConferences)[0]) => void;
    function ConferenceChanger() {
      const { setActiveConference } = useConference();
      setConference = setActiveConference;
      return null;
    }

    render(
      <Wrapper>
        <ConferenceCapture />
        <ConferenceChanger />
      </Wrapper>,
    );

    // Let initial sync settle
    await waitFor(() => {
      expect(capturedConferenceId).toBe(CONF_LOCAL_ID);
    });

    mockSetUserActiveConferenceId.mockClear();

    // Simulate user picking a different conference
    const newConf = allConferences.find((c) => c.id === CONF_FIRESTORE_ID)!;
    act(() => {
      setConference(newConf);
    });

    await waitFor(() => {
      expect(capturedConferenceId).toBe(CONF_FIRESTORE_ID);
    });

    // The change should have been persisted to Firestore
    await waitFor(() => {
      expect(mockSetUserActiveConferenceId).toHaveBeenCalledWith(
        "user-789",
        CONF_FIRESTORE_ID,
      );
    });
  });

  it("does not call Firestore services when user is not logged in", async () => {
    localStorage.setItem(CONFERENCE_STORAGE_KEY, CONF_LOCAL_ID);
    fakeUser = null; // not logged in

    render(
      <Wrapper>
        <ConferenceCapture />
      </Wrapper>,
    );

    // Conference comes from localStorage via ConferenceContext
    await waitFor(() => {
      expect(capturedConferenceId).toBe(CONF_LOCAL_ID);
    });

    expect(mockGetUserActiveConferenceId).not.toHaveBeenCalled();
    expect(mockSetUserActiveConferenceId).not.toHaveBeenCalled();
  });
});
