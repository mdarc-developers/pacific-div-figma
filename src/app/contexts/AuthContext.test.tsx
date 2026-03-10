import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor, act } from "@testing-library/react";

// ── Mock Firebase modules ────────────────────────────────────────────────────
vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
  storage: {},
}));

// Mutable stubs — individual tests can override these via mockReturnValue /
// mockResolvedValue before rendering.
const mockOnAuthStateChanged = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockSignInWithRedirect = vi.fn();
const mockGetRedirectResult = vi.fn();

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...actual,
    onAuthStateChanged: mockOnAuthStateChanged,
    signInWithPopup: mockSignInWithPopup,
    signInWithRedirect: mockSignInWithRedirect,
    getRedirectResult: mockGetRedirectResult,
    GoogleAuthProvider: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    deleteUser: vi.fn(),
  };
});

const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    getDoc: mockGetDoc,
    setDoc: mockSetDoc,
    deleteDoc: vi.fn().mockResolvedValue(undefined),
    doc: vi.fn((_db: unknown, col: string, id: string) => ({
      path: `${col}/${id}`,
    })),
    serverTimestamp: vi.fn(() => "MOCK_TIMESTAMP"),
  };
});

vi.mock("@/services/exportDataService", () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

// Simulates a Firebase user object.
function makeUser(uid = "uid-123") {
  return {
    uid,
    email: "user@example.com",
    displayName: "Test User",
  } as unknown as import("firebase/auth").User;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("AuthContext — redirect result handling on init", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: onAuthStateChanged fires immediately with null (not logged in).
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      (cb as (u: null) => void)(null);
      return () => {};
    });
  });

  it("calls getRedirectResult on mount and creates user doc for first-time redirect sign-in", async () => {
    const user = makeUser();
    // Simulate a completed redirect — getRedirectResult resolves with a user.
    mockGetRedirectResult.mockResolvedValue({ user });
    // User doc does not exist yet.
    mockGetDoc.mockResolvedValue({ exists: () => false });
    mockSetDoc.mockResolvedValue(undefined);

    const { AuthProvider } = await import("./AuthContext");
    render(<AuthProvider><div /></AuthProvider>);

    await waitFor(() => {
      expect(mockGetRedirectResult).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: "users/uid-123" }),
        expect.objectContaining({
          email: "user@example.com",
          displayName: "Test User",
        }),
      );
    });
  });

  it("does not call setDoc when the user doc already exists after redirect", async () => {
    const user = makeUser();
    mockGetRedirectResult.mockResolvedValue({ user });
    // User doc already exists.
    mockGetDoc.mockResolvedValue({ exists: () => true });
    mockSetDoc.mockResolvedValue(undefined);

    const { AuthProvider } = await import("./AuthContext");
    render(<AuthProvider><div /></AuthProvider>);

    await waitFor(() => {
      expect(mockGetRedirectResult).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(mockGetDoc).toHaveBeenCalled();
    });
    // setDoc should NOT be called since the doc already exists.
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it("does not crash the app when getRedirectResult rejects", async () => {
    mockGetRedirectResult.mockRejectedValue(
      Object.assign(new Error("auth/invalid-credential"), {
        code: "auth/invalid-credential",
      }),
    );

    const { AuthProvider } = await import("./AuthContext");
    // Should render without throwing.
    expect(() =>
      render(<AuthProvider><div data-testid="child" /></AuthProvider>),
    ).not.toThrow();

    // Give the rejected promise time to settle.
    await act(async () => {
      await waitFor(() => expect(mockGetRedirectResult).toHaveBeenCalledTimes(1));
    });
  });

  it("is a no-op when getRedirectResult resolves with null (no pending redirect)", async () => {
    mockGetRedirectResult.mockResolvedValue(null);

    const { AuthProvider } = await import("./AuthContext");
    render(<AuthProvider><div /></AuthProvider>);

    await waitFor(() => {
      expect(mockGetRedirectResult).toHaveBeenCalledTimes(1);
    });
    expect(mockSetDoc).not.toHaveBeenCalled();
  });
});

describe("AuthContext — signInWithGoogle popup → redirect fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      (cb as (u: null) => void)(null);
      return () => {};
    });
    mockGetRedirectResult.mockResolvedValue(null);
  });

  it("calls signInWithPopup and creates user doc on success", async () => {
    const user = makeUser();
    mockSignInWithPopup.mockResolvedValue({ user });
    mockGetDoc.mockResolvedValue({ exists: () => false });
    mockSetDoc.mockResolvedValue(undefined);

    const { AuthProvider, useAuth } = await import("./AuthContext");

    let signInFn!: () => Promise<void>;
    function Capture() {
      signInFn = useAuth().signInWithGoogle;
      return null;
    }

    render(
      <AuthProvider>
        <Capture />
      </AuthProvider>,
    );

    await act(async () => {
      await signInFn();
    });

    expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);
    expect(mockSignInWithRedirect).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: "users/uid-123" }),
        expect.objectContaining({ email: "user@example.com" }),
      );
    });
  });

  it("falls back to signInWithRedirect when popup is blocked (auth/popup-blocked)", async () => {
    const popupBlockedError = Object.assign(new Error("Popup blocked"), {
      code: "auth/popup-blocked",
    });
    mockSignInWithPopup.mockRejectedValue(popupBlockedError);
    mockSignInWithRedirect.mockResolvedValue(undefined);

    const { AuthProvider, useAuth } = await import("./AuthContext");

    let signInFn!: () => Promise<void>;
    function Capture() {
      signInFn = useAuth().signInWithGoogle;
      return null;
    }

    render(
      <AuthProvider>
        <Capture />
      </AuthProvider>,
    );

    await act(async () => {
      await signInFn();
    });

    expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);
    expect(mockSignInWithRedirect).toHaveBeenCalledTimes(1);
  });

  it("falls back to signInWithRedirect when popup fails to open (auth/popup-failed-to-open)", async () => {
    const popupFailedError = Object.assign(new Error("Popup failed"), {
      code: "auth/popup-failed-to-open",
    });
    mockSignInWithPopup.mockRejectedValue(popupFailedError);
    mockSignInWithRedirect.mockResolvedValue(undefined);

    const { AuthProvider, useAuth } = await import("./AuthContext");

    let signInFn!: () => Promise<void>;
    function Capture() {
      signInFn = useAuth().signInWithGoogle;
      return null;
    }

    render(
      <AuthProvider>
        <Capture />
      </AuthProvider>,
    );

    await act(async () => {
      await signInFn();
    });

    expect(mockSignInWithRedirect).toHaveBeenCalledTimes(1);
  });

  it("rethrows non-popup-blocked errors from signInWithPopup", async () => {
    const networkError = Object.assign(new Error("Network failure"), {
      code: "auth/network-request-failed",
    });
    mockSignInWithPopup.mockRejectedValue(networkError);

    const { AuthProvider, useAuth } = await import("./AuthContext");

    let signInFn!: () => Promise<void>;
    function Capture() {
      signInFn = useAuth().signInWithGoogle;
      return null;
    }

    render(
      <AuthProvider>
        <Capture />
      </AuthProvider>,
    );

    await expect(
      act(async () => {
        await signInFn();
      }),
    ).rejects.toThrow("Network failure");

    expect(mockSignInWithRedirect).not.toHaveBeenCalled();
  });
});
