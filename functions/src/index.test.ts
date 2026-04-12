import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildRawMessage, buildWelcomeEmailHtml } from "./welcomeEmail";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { CallableRequest } from "firebase-functions/v2/https";

// ── Cloud Function tests — following Firebase unit testing recommendations ────
// https://firebase.google.com/docs/functions/unit-testing
//
// Strategy (offline mode):
//   • firebase-admin is mocked so tests never connect to a real Firebase project.
//   • firebase-functions-test wraps callable functions (resendVerificationEmail,
//     adminLookupUser) and provides the offline-mode environment setup.
//   • Firestore trigger handlers are invoked via fn.run() with minimal mock
//     events, bypassing DocumentSnapshot creation that requires real admin.

// vi.hoisted() ensures these mock instances are initialized before the
// vi.mock() factory runs (vi.mock calls are hoisted to the top of the file).
const {
  mockSet,
  mockDelete,
  mockGet,
  mockFirestore,
  mockGetUserByEmail,
  mockGetUser,
  mockGenerateEmailVerificationLink,
  mockRunTransaction,
} = vi.hoisted(() => {
  const mockSet = vi.fn().mockResolvedValue(undefined);
  const mockDelete = vi.fn().mockResolvedValue(undefined);
  const mockGet = vi.fn().mockResolvedValue({
    exists: false,
    data: () => undefined,
  });

  // Default transaction mock: delegates get/set to the top-level mocks.
  // Individual tests can override with mockRunTransaction.mockImplementationOnce.
  const mockRunTransaction = vi.fn().mockImplementation(
    async (fn: (t: {
      get: typeof mockGet;
      set: typeof mockSet;
    }) => Promise<unknown>) => {
      return fn({ get: mockGet, set: mockSet });
    },
  );

  // Build a chainable Firestore mock supporting both:
  //   admin.firestore().collection(name).doc(id) — used by counter functions
  //   admin.firestore().doc(path)                — used by adminLookupUser
  type MockDocRefResult = {
    set: typeof mockSet;
    delete: typeof mockDelete;
    get: typeof mockGet;
    collection: () => { doc: () => MockDocRefResult };
  };
  const mockDocRef = (): MockDocRefResult => ({
    set: mockSet,
    delete: mockDelete,
    get: mockGet,
    collection: () => ({ doc: () => mockDocRef() }),
  });

  const mockFirestore = Object.assign(
    vi.fn(() => ({
      collection: vi.fn(() => ({ doc: vi.fn(() => mockDocRef()) })),
      doc: vi.fn(() => mockDocRef()),
      runTransaction: mockRunTransaction,
    })),
    {
      FieldValue: {
        increment: vi.fn((n: number) => ({ _increment: n })),
        serverTimestamp: vi.fn(() => "MOCK_SERVER_TIMESTAMP"),
        delete: vi.fn(() => ({ _delete: true })),
      },
    },
  );

  const mockGenerateEmailVerificationLink = vi
    .fn()
    .mockResolvedValue("https://verify.example.com");
  const mockGetUserByEmail = vi.fn();
  const mockGetUser = vi.fn();

  return {
    mockSet,
    mockDelete,
    mockGet,
    mockFirestore,
    mockGetUserByEmail,
    mockGetUser,
    mockGenerateEmailVerificationLink,
    mockRunTransaction,
  };
});

vi.mock("firebase-admin", () => ({
  default: {
    initializeApp: vi.fn(),
    firestore: mockFirestore,
    auth: vi.fn(() => ({
      getUserByEmail: mockGetUserByEmail,
      getUser: mockGetUser,
      generateEmailVerificationLink: mockGenerateEmailVerificationLink,
    })),
    messaging: vi.fn(() => ({
      sendEachForMulticast: vi.fn().mockResolvedValue({ responses: [] }),
    })),
  },
  initializeApp: vi.fn(),
  firestore: mockFirestore,
  auth: vi.fn(() => ({
    getUserByEmail: mockGetUserByEmail,
    getUser: mockGetUser,
    generateEmailVerificationLink: mockGenerateEmailVerificationLink,
  })),
  messaging: vi.fn(() => ({
    sendEachForMulticast: vi.fn().mockResolvedValue({ responses: [] }),
  })),
}));

// Prevent real Gmail / Twilio calls from escaping the test process.
vi.mock("googleapis", () => ({
  google: {
    gmail: vi.fn(() => ({
      users: { messages: { send: vi.fn().mockResolvedValue({}) } },
    })),
  },
}));
vi.mock("google-auth-library", () => ({
  JWT: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("twilio", () => ({
  default: vi.fn(() => ({
    messages: { create: vi.fn().mockResolvedValue({}) },
  })),
}));

describe("buildRawMessage", () => {
  it("returns a base64url encoded string", () => {
    const raw = buildRawMessage(
      "from@example.com",
      "to@example.com",
      "Test Subject",
      "<p>Hello</p>",
    );
    // base64url characters: A-Z a-z 0-9 - _  (no +, /, or trailing =)
    expect(raw).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it("decoded output contains From, To, Subject headers", () => {
    const raw = buildRawMessage(
      "from@example.com",
      "to@example.com",
      "Hello Subject",
      "<p>body</p>",
    );
    const decoded = Buffer.from(
      raw.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf-8");
    expect(decoded).toContain("From: from@example.com");
    expect(decoded).toContain("To: to@example.com");
    expect(decoded).toContain("Subject: Hello Subject");
    expect(decoded).toContain("<p>body</p>");
  });

  it("uses CRLF line endings as required by RFC 2822", () => {
    const raw = buildRawMessage(
      "from@example.com",
      "to@example.com",
      "Test Subject",
      "<p>body</p>",
    );
    const decoded = Buffer.from(
      raw.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf-8");
    // RFC 2822 requires CRLF (\r\n) line endings between headers and between
    // the header block and the body. The Gmail API sends this as a raw RFC 2822
    // message, so non-compliant line endings can cause delivery failures.
    expect(decoded).toContain("Subject: Test Subject\r\n\r\n<p>body</p>");
  });
});

describe("buildWelcomeEmailHtml", () => {
  it("includes the user display name when provided", () => {
    const html = buildWelcomeEmailHtml("Alice K6ABC", "alice@example.com");
    expect(html).toContain("Alice K6ABC");
  });

  it("falls back to email when displayName is undefined", () => {
    const html = buildWelcomeEmailHtml(undefined, "bob@example.com");
    expect(html).toContain("bob@example.com");
  });

  it("contains a link to the conference app", () => {
    const html = buildWelcomeEmailHtml("Charlie", "charlie@example.com");
    expect(html).toContain("pacific-div.web.app");
  });
});

// ── Cloud Function trigger and callable tests ─────────────────────────────────
// firebase-functions-test is used in offline mode (no credentials required).
// See: https://firebase.google.com/docs/functions/unit-testing

import functionsTest from "firebase-functions-test";
import {
  incrementSignupCounter,
  incrementAttendeeCounter,
  decrementAttendeeCounter,
  syncPublicProfile,
  resendVerificationEmail,
  adminLookupUser,
  adminResendVerificationEmail,
  castVote,
  sendFeedbackEmail,
} from "./index";

// Initialize offline mode — sets fake FIREBASE_CONFIG env var so firebase-admin
// does not attempt to reach a real project.
const tester = functionsTest();

// Reset all mock call history before each test to keep assertions isolated.
beforeEach(() => {
  vi.clearAllMocks();
  mockGet.mockResolvedValue({ exists: false, data: () => undefined });
});

// ── incrementSignupCounter ────────────────────────────────────────────────────

describe("incrementSignupCounter (onDocumentCreated users/{uid})", () => {
  it("increments stats/signupCounter when a new user document is created", async () => {
    await incrementSignupCounter.run({
      params: { uid: "user-abc" },
      data: {},
    } as Parameters<typeof incrementSignupCounter.run>[0]);

    expect(mockSet).toHaveBeenCalledOnce();
    const [updatePayload, options] = mockSet.mock.calls[0];
    expect(updatePayload).toMatchObject({ count: { _increment: 1 } });
    expect(options).toEqual({ merge: true });
  });

  it("does not throw when the Firestore write fails", async () => {
    mockSet.mockRejectedValueOnce(new Error("Firestore unavailable"));

    await expect(
      incrementSignupCounter.run({
        params: { uid: "user-xyz" },
        data: {},
      } as Parameters<typeof incrementSignupCounter.run>[0]),
    ).resolves.not.toThrow();
  });
});

// ── incrementAttendeeCounter ──────────────────────────────────────────────────

describe("incrementAttendeeCounter (onDocumentCreated conferences/{conferenceId}/attendees/{uid})", () => {
  it("increments attendeeCounter on the conference document", async () => {
    await incrementAttendeeCounter.run({
      params: { conferenceId: "conf-2026", uid: "user-abc" },
      data: {},
    } as Parameters<typeof incrementAttendeeCounter.run>[0]);

    expect(mockSet).toHaveBeenCalledOnce();
    const [updatePayload, options] = mockSet.mock.calls[0];
    expect(updatePayload).toMatchObject({
      attendeeCounter: { _increment: 1 },
    });
    expect(options).toEqual({ merge: true });
  });

  it("does not throw when the Firestore write fails", async () => {
    mockSet.mockRejectedValueOnce(new Error("Firestore unavailable"));

    await expect(
      incrementAttendeeCounter.run({
        params: { conferenceId: "conf-2026", uid: "user-xyz" },
        data: {},
      } as Parameters<typeof incrementAttendeeCounter.run>[0]),
    ).resolves.not.toThrow();
  });
});

// ── decrementAttendeeCounter ──────────────────────────────────────────────────

describe("decrementAttendeeCounter (onDocumentDeleted conferences/{conferenceId}/attendees/{uid})", () => {
  it("decrements attendeeCounter on the conference document", async () => {
    await decrementAttendeeCounter.run({
      params: { conferenceId: "conf-2026", uid: "user-abc" },
      data: {},
    } as Parameters<typeof decrementAttendeeCounter.run>[0]);

    expect(mockSet).toHaveBeenCalledOnce();
    const [updatePayload, options] = mockSet.mock.calls[0];
    expect(updatePayload).toMatchObject({
      attendeeCounter: { _increment: -1 },
    });
    expect(options).toEqual({ merge: true });
  });

  it("does not throw when the Firestore write fails", async () => {
    mockSet.mockRejectedValueOnce(new Error("Firestore unavailable"));

    await expect(
      decrementAttendeeCounter.run({
        params: { conferenceId: "conf-2026", uid: "user-xyz" },
        data: {},
      } as Parameters<typeof decrementAttendeeCounter.run>[0]),
    ).resolves.not.toThrow();
  });
});

// ── syncPublicProfile ─────────────────────────────────────────────────────────

/** Minimal mock of a Firestore DocumentSnapshot. */
function makeAfterSnap(data: Record<string, unknown> | null): {
  exists: boolean;
  data: () => Record<string, unknown> | undefined;
} {
  return {
    exists: data !== null,
    data: () => data ?? undefined,
  };
}

describe("syncPublicProfile (onDocumentWritten users/{uid})", () => {
  it("deletes public profile when the user document is deleted", async () => {
    const change = {
      before: makeAfterSnap({ displayName: "Old Name" }),
      after: makeAfterSnap(null), // document deleted
    };

    await syncPublicProfile.run({
      params: { uid: "user-abc" },
      data: change,
    } as Parameters<typeof syncPublicProfile.run>[0]);

    expect(mockDelete).toHaveBeenCalledOnce();
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("deletes public profile when profileVisible is false", async () => {
    const change = {
      before: makeAfterSnap(null),
      after: makeAfterSnap({ profileVisible: false, displayName: "Alice" }),
    };

    await syncPublicProfile.run({
      params: { uid: "user-abc" },
      data: change,
    } as Parameters<typeof syncPublicProfile.run>[0]);

    expect(mockDelete).toHaveBeenCalledOnce();
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("writes public profile when profileVisible is true", async () => {
    const change = {
      before: makeAfterSnap(null),
      after: makeAfterSnap({
        profileVisible: true,
        displayName: "Alice K6ABC",
        callsign: "K6ABC",
        displayProfile: "bio text",
        email: "alice@example.com", // must NOT be in public profile
        groups: ["admin"], // must NOT be in public profile
      }),
    };

    await syncPublicProfile.run({
      params: { uid: "user-abc" },
      data: change,
    } as Parameters<typeof syncPublicProfile.run>[0]);

    expect(mockSet).toHaveBeenCalledOnce();
    const [publicData] = mockSet.mock.calls[0];
    expect(publicData).toMatchObject({
      uid: "user-abc",
      displayName: "Alice K6ABC",
      callsign: "K6ABC",
      displayProfile: "bio text",
    });
    expect(publicData).not.toHaveProperty("email");
    expect(publicData).not.toHaveProperty("groups");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("omits optional fields that are absent from the user document", async () => {
    const change = {
      before: makeAfterSnap(null),
      after: makeAfterSnap({ profileVisible: true }),
    };

    await syncPublicProfile.run({
      params: { uid: "user-abc" },
      data: change,
    } as Parameters<typeof syncPublicProfile.run>[0]);

    expect(mockSet).toHaveBeenCalledOnce();
    const [publicData] = mockSet.mock.calls[0];
    expect(publicData).toEqual({ uid: "user-abc" });
  });
});

// ── resendVerificationEmail (onCall) ──────────────────────────────────────────

describe("resendVerificationEmail (onCall)", () => {
  const wrapped = tester.wrap(resendVerificationEmail);

  it("throws unauthenticated when the caller is not signed in", async () => {
    await expect(wrapped({ auth: undefined, data: {} } as unknown as CallableRequest<unknown>)).rejects.toMatchObject({
      code: "unauthenticated",
    });
  });

  it("throws failed-precondition when the caller's email is already verified", async () => {
    await expect(
      wrapped({
        auth: {
          uid: "user-abc",
          token: { email: "alice@example.com", email_verified: true } as unknown as DecodedIdToken,
        },
        data: {},
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "failed-precondition" });
  });
});

// ── adminLookupUser (onCall) ──────────────────────────────────────────────────

describe("adminLookupUser (onCall)", () => {
  const wrapped = tester.wrap(adminLookupUser);

  it("throws unauthenticated when the caller is not signed in", async () => {
    await expect(
      wrapped({ auth: undefined, data: { targetEmail: "target@example.com" } } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "unauthenticated" });
  });

  it("throws failed-precondition when the caller's email is not verified", async () => {
    await expect(
      wrapped({
        auth: { uid: "non-admin-uid", token: { email_verified: false } as unknown as DecodedIdToken },
        data: { targetEmail: "target@example.com" },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "failed-precondition" });
  });

  it("throws permission-denied when the caller is not in the user-admin group", async () => {
    // groups/user-admin document exists but caller uid is not a member.
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ members: {} }),
    });

    await expect(
      wrapped({
        auth: { uid: "non-admin-uid", token: { email_verified: true } as unknown as DecodedIdToken },
        data: { targetEmail: "target@example.com" },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "permission-denied" });
  });

  it("throws permission-denied when the user-admin group document does not exist", async () => {
    // Group doc doesn't exist.
    mockGet.mockResolvedValueOnce({ exists: false, data: () => undefined });

    await expect(
      wrapped({
        auth: { uid: "non-admin-uid", token: { email_verified: true } as unknown as DecodedIdToken },
        data: { targetEmail: "target@example.com" },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "permission-denied" });
  });

  it("throws invalid-argument when targetEmail is missing", async () => {
    // Caller is a valid admin member.
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ members: { "admin-uid": true } }),
    });

    await expect(
      wrapped({
        auth: { uid: "admin-uid", token: { email_verified: true } as unknown as DecodedIdToken },
        data: {},
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "invalid-argument" });
  });

  it("returns user info for a valid admin caller", async () => {
    // Admin group membership check passes.
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ members: { "admin-uid": true } }),
    });
    mockGetUserByEmail.mockResolvedValueOnce({
      uid: "target-uid",
      email: "target@example.com",
      displayName: "Target User",
      emailVerified: true,
      metadata: { creationTime: "2024-01-01T00:00:00.000Z" },
    });

    const result = await wrapped({
      auth: { uid: "admin-uid", token: { email_verified: true } as unknown as DecodedIdToken },
      data: { targetEmail: "target@example.com" },
    } as unknown as CallableRequest<unknown>);

    expect(result).toMatchObject({
      uid: "target-uid",
      email: "target@example.com",
      displayName: "Target User",
      emailVerified: true,
    });
  });
});

// ── adminResendVerificationEmail (onCall) ─────────────────────────────────────

describe("adminResendVerificationEmail (onCall)", () => {
  const wrapped = tester.wrap(adminResendVerificationEmail);

  it("throws unauthenticated when the caller is not signed in", async () => {
    await expect(
      wrapped({ auth: undefined, data: { targetUid: "target-uid" } } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "unauthenticated" });
  });

  it("throws failed-precondition when the caller's email is not verified", async () => {
    await expect(
      wrapped({
        auth: { uid: "non-admin-uid", token: { email_verified: false } as unknown as DecodedIdToken },
        data: { targetUid: "target-uid" },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "failed-precondition" });
  });

  it("throws permission-denied when the caller is not in the user-admin group", async () => {
    // groups/user-admin document exists but caller uid is not a member.
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ members: {} }),
    });

    await expect(
      wrapped({
        auth: { uid: "non-admin-uid", token: { email_verified: true } as unknown as DecodedIdToken },
        data: { targetUid: "target-uid" },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "permission-denied" });
  });

  it("throws invalid-argument when targetUid is missing", async () => {
    // Caller is a valid admin member.
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ members: { "admin-uid": true } }),
    });

    await expect(
      wrapped({
        auth: { uid: "admin-uid", token: { email_verified: true } as unknown as DecodedIdToken },
        data: {},
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "invalid-argument" });
  });
});

// ── sendFeedbackEmail (onCall) ────────────────────────────────────────────────

describe("sendFeedbackEmail (onCall)", () => {
  const wrapped = tester.wrap(sendFeedbackEmail);

  it("throws unauthenticated when the caller is not signed in", async () => {
    await expect(
      wrapped({
        auth: undefined,
        data: { pageUrl: "https://pacific-div.web.app/", message: "Test", ccSender: false },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "unauthenticated" });
  });

  it("throws failed-precondition when the caller's email is not verified", async () => {
    await expect(
      wrapped({
        auth: { uid: "user-abc", token: { email_verified: false } as unknown as DecodedIdToken },
        data: { pageUrl: "https://pacific-div.web.app/", message: "Test", ccSender: false },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "failed-precondition" });
  });

  it("throws invalid-argument when pageUrl is missing", async () => {
    await expect(
      wrapped({
        auth: { uid: "user-abc", token: { email_verified: true } as unknown as DecodedIdToken },
        data: { message: "Test", ccSender: false },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "invalid-argument" });
  });

  it("passes auth and profile guards and reaches business logic (internal due to missing test secrets)", async () => {
    // Gmail secrets are not available in the test environment, so the function
    // proceeds past auth/profile guards and throws "internal" (email service not
    // configured). This confirms auth and profile validation are passed.
    await expect(
      wrapped({
        auth: { uid: "user-abc", token: { email_verified: true } as unknown as DecodedIdToken },
        data: {
          pageUrl: "https://pacific-div.web.app/schedule",
          message: "Great app!",
          ccSender: false,
        },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "internal" });
  });
});

// ── castVote (onCall) ─────────────────────────────────────────────────────────

describe("castVote (onCall)", () => {
  const wrapped = tester.wrap(castVote);

  it("throws unauthenticated when the caller is not signed in", async () => {
    await expect(
      wrapped({
        auth: undefined,
        data: {
          conferenceId: "conf-1",
          voteType: "session",
          itemId: "session-a",
          action: "add",
        },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "unauthenticated" });
  });

  it("throws invalid-argument when conferenceId is empty", async () => {
    await expect(
      wrapped({
        auth: { uid: "user-1", token: {} as unknown as DecodedIdToken },
        data: {
          conferenceId: "",
          voteType: "session",
          itemId: "session-a",
          action: "add",
        },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "invalid-argument" });
  });

  it("throws invalid-argument when voteType is not 'session' or 'exhibitor'", async () => {
    await expect(
      wrapped({
        auth: { uid: "user-1", token: {} as unknown as DecodedIdToken },
        data: {
          conferenceId: "conf-1",
          voteType: "invalid",
          itemId: "session-a",
          action: "add",
        },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "invalid-argument" });
  });

  it("throws invalid-argument when action is not 'add' or 'remove'", async () => {
    await expect(
      wrapped({
        auth: { uid: "user-1", token: {} as unknown as DecodedIdToken },
        data: {
          conferenceId: "conf-1",
          voteType: "session",
          itemId: "session-a",
          action: "toggle",
        },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "invalid-argument" });
  });

  it("throws not-found when the user document does not exist", async () => {
    mockRunTransaction.mockImplementationOnce(
      async (fn: (t: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> }) => Promise<unknown>) => {
        return fn({
          get: vi.fn().mockResolvedValue({ exists: false, data: () => undefined }),
          set: vi.fn(),
        });
      },
    );

    await expect(
      wrapped({
        auth: { uid: "user-1", token: {} as unknown as DecodedIdToken },
        data: {
          conferenceId: "conf-1",
          voteType: "session",
          itemId: "session-a",
          action: "add",
        },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "not-found" });
  });

  it("throws failed-precondition when the user's email is not verified", async () => {
    mockRunTransaction.mockImplementationOnce(
      async (fn: (t: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> }) => Promise<unknown>) => {
        return fn({
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({ sessionVotes: {} }),
          }),
          set: vi.fn(),
        });
      },
    );

    await expect(
      wrapped({
        auth: { uid: "user-1", token: { email_verified: false } as unknown as DecodedIdToken },
        data: {
          conferenceId: "conf-1",
          voteType: "session",
          itemId: "session-a",
          action: "add",
        },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "failed-precondition" });
  });

  it("throws already-exists when the user has already voted for the item", async () => {
    mockRunTransaction.mockImplementationOnce(
      async (fn: (t: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> }) => Promise<unknown>) => {
        return fn({
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({ sessionVotes: { "conf-1": ["session-a"] } }),
          }),
          set: vi.fn(),
        });
      },
    );

    await expect(
      wrapped({
        auth: { uid: "user-1", token: { email_verified: true } as unknown as DecodedIdToken },
        data: {
          conferenceId: "conf-1",
          voteType: "session",
          itemId: "session-a",
          action: "add",
        },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "already-exists" });
  });

  it("throws resource-exhausted when the vote limit is already reached", async () => {
    mockRunTransaction.mockImplementationOnce(
      async (fn: (t: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> }) => Promise<unknown>) => {
        return fn({
          get: vi.fn().mockResolvedValue({
            exists: true,
            // "session-b" is already voted (MAX_VOTES = 1 reached)
            data: () => ({ sessionVotes: { "conf-1": ["session-b"] } }),
          }),
          set: vi.fn(),
        });
      },
    );

    await expect(
      wrapped({
        auth: { uid: "user-1", token: { email_verified: true } as unknown as DecodedIdToken },
        data: {
          conferenceId: "conf-1",
          voteType: "session",
          itemId: "session-a", // different item
          action: "add",
        },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "resource-exhausted" });
  });

  it("successfully adds a session vote and returns the updated votes array", async () => {
    const txSet = vi.fn();
    mockRunTransaction.mockImplementationOnce(
      async (fn: (t: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> }) => Promise<unknown>) => {
        return fn({
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({ sessionVotes: { "conf-1": [] } }),
          }),
          set: txSet,
        });
      },
    );

    const result = await wrapped({
      auth: { uid: "user-1", token: { email_verified: true } as unknown as DecodedIdToken },
      data: {
        conferenceId: "conf-1",
        voteType: "session",
        itemId: "session-a",
        action: "add",
      },
    } as unknown as CallableRequest<unknown>);

    expect(result).toMatchObject({ votes: ["session-a"] });
    // Two set calls: user doc update + voteCounts update
    expect(txSet).toHaveBeenCalledTimes(2);
    // First call: user doc votes
    expect(txSet.mock.calls[0][1]).toMatchObject({
      sessionVotes: { "conf-1": ["session-a"] },
    });
    // Second call: aggregate count increment
    expect(txSet.mock.calls[1][1]).toMatchObject({
      sessions: { "session-a": { _increment: 1 } },
    });
  });

  it("successfully adds an exhibitor vote", async () => {
    const txSet = vi.fn();
    mockRunTransaction.mockImplementationOnce(
      async (fn: (t: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> }) => Promise<unknown>) => {
        return fn({
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({ exhibitorVotes: { "conf-1": [] } }),
          }),
          set: txSet,
        });
      },
    );

    const result = await wrapped({
      auth: { uid: "user-1", token: { email_verified: true } as unknown as DecodedIdToken },
      data: {
        conferenceId: "conf-1",
        voteType: "exhibitor",
        itemId: "exhibitor-x",
        action: "add",
      },
    } as unknown as CallableRequest<unknown>);

    expect(result).toMatchObject({ votes: ["exhibitor-x"] });
    expect(txSet.mock.calls[1][1]).toMatchObject({
      exhibitors: { "exhibitor-x": { _increment: 1 } },
    });
  });

  it("successfully removes a vote", async () => {
    const txSet = vi.fn();
    mockRunTransaction.mockImplementationOnce(
      async (fn: (t: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> }) => Promise<unknown>) => {
        return fn({
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({ sessionVotes: { "conf-1": ["session-a"] } }),
          }),
          set: txSet,
        });
      },
    );

    const result = await wrapped({
      auth: { uid: "user-1", token: { email_verified: true } as unknown as DecodedIdToken },
      data: {
        conferenceId: "conf-1",
        voteType: "session",
        itemId: "session-a",
        action: "remove",
      },
    } as unknown as CallableRequest<unknown>);

    expect(result).toMatchObject({ votes: [] });
    expect(txSet.mock.calls[0][1]).toMatchObject({
      sessionVotes: { "conf-1": [] },
    });
    expect(txSet.mock.calls[1][1]).toMatchObject({
      sessions: { "session-a": { _increment: -1 } },
    });
  });

  it("throws not-found when removing a vote that does not exist", async () => {
    mockRunTransaction.mockImplementationOnce(
      async (fn: (t: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> }) => Promise<unknown>) => {
        return fn({
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({ sessionVotes: { "conf-1": [] } }),
          }),
          set: vi.fn(),
        });
      },
    );

    await expect(
      wrapped({
        auth: { uid: "user-1", token: { email_verified: true } as unknown as DecodedIdToken },
        data: {
          conferenceId: "conf-1",
          voteType: "session",
          itemId: "session-a",
          action: "remove",
        },
      } as unknown as CallableRequest<unknown>),
    ).rejects.toMatchObject({ code: "not-found" });
  });
});
