import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mock Firebase app singleton ───────────────────────────────────────────────
vi.mock("@/lib/firebase", () => ({
  default: {},
  auth: {},
  db: {},
  storage: {},
}));

// ── Mutable stubs for firebase/messaging ─────────────────────────────────────
// vi.hoisted() ensures these instances are ready before vi.mock() factories run.
const { mockIsSupported, mockGetMessaging, mockGetToken, mockDeleteToken } =
  vi.hoisted(() => ({
    mockIsSupported: vi.fn(),
    mockGetMessaging: vi.fn(),
    mockGetToken: vi.fn(),
    mockDeleteToken: vi.fn(),
  }));

vi.mock("firebase/messaging", () => ({
  isSupported: (...args: unknown[]) => mockIsSupported(...args),
  getMessaging: (...args: unknown[]) => mockGetMessaging(...args),
  getToken: (...args: unknown[]) => mockGetToken(...args),
  deleteToken: (...args: unknown[]) => mockDeleteToken(...args),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Stubs Notification.requestPermission to resolve with the given status. */
function mockNotificationPermission(status: NotificationPermission): () => void {
  const original = globalThis.Notification;
  Object.defineProperty(globalThis, "Notification", {
    configurable: true,
    writable: true,
    value: { requestPermission: vi.fn().mockResolvedValue(status) },
  });
  return () => {
    Object.defineProperty(globalThis, "Notification", {
      configurable: true,
      writable: true,
      value: original,
    });
  };
}

/**
 * Helper that dynamically imports messaging.ts after stubbing the VAPID env
 * var and resetting the module registry, so that the module-level constant
 * `VAPID_KEY` is re-evaluated with the new value.
 */
async function importWithVapidKey(
  key: string | undefined,
): Promise<typeof import("@/lib/messaging")> {
  vi.resetModules();
  if (key !== undefined) {
    vi.stubEnv("VITE_FIREBASE_VAPID_KEY", key);
  } else {
    vi.unstubAllEnvs();
  }
  return import("@/lib/messaging");
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("requestFcmToken", () => {
  const FAKE_MESSAGING = { fake: "messaging" };
  const FAKE_TOKEN = "fake-fcm-token-abc123";

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMessaging.mockReturnValue(FAKE_MESSAGING);
    mockGetToken.mockResolvedValue(FAKE_TOKEN);
    mockIsSupported.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns null and warns when VAPID key is not configured", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { requestFcmToken } = await importWithVapidKey(undefined);

    const result = await requestFcmToken();

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("VITE_FIREBASE_VAPID_KEY"),
    );
    warnSpy.mockRestore();
  });

  it("returns null and warns when Firebase Messaging is not supported", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockIsSupported.mockResolvedValue(false);
    const { requestFcmToken } = await importWithVapidKey("test-vapid-key");

    const result = await requestFcmToken();

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("not supported"),
    );
    warnSpy.mockRestore();
  });

  it("returns null when the user denies notification permission", async () => {
    const restore = mockNotificationPermission("denied");
    const { requestFcmToken } = await importWithVapidKey("test-vapid-key");

    const result = await requestFcmToken();
    restore();

    expect(result).toBeNull();
    expect(mockGetToken).not.toHaveBeenCalled();
  });

  it("returns null when the user dismisses the notification prompt (default)", async () => {
    const restore = mockNotificationPermission("default");
    const { requestFcmToken } = await importWithVapidKey("test-vapid-key");

    const result = await requestFcmToken();
    restore();

    expect(result).toBeNull();
    expect(mockGetToken).not.toHaveBeenCalled();
  });

  it("returns the FCM token when permission is granted and messaging is supported", async () => {
    const restore = mockNotificationPermission("granted");
    const { requestFcmToken } = await importWithVapidKey("test-vapid-key");

    const result = await requestFcmToken();
    restore();

    expect(result).toBe(FAKE_TOKEN);
    expect(mockGetToken).toHaveBeenCalledWith(
      FAKE_MESSAGING,
      expect.objectContaining({ vapidKey: "test-vapid-key" }),
    );
  });
});

describe("getCurrentFcmToken", () => {
  const FAKE_MESSAGING = { fake: "messaging" };
  const FAKE_TOKEN = "current-fcm-token-xyz";

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSupported.mockResolvedValue(true);
    mockGetMessaging.mockReturnValue(FAKE_MESSAGING);
    mockGetToken.mockResolvedValue(FAKE_TOKEN);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns null when VAPID key is not configured", async () => {
    const { getCurrentFcmToken } = await importWithVapidKey(undefined);
    const result = await getCurrentFcmToken();
    expect(result).toBeNull();
  });

  it("returns null when Firebase Messaging is not supported", async () => {
    mockIsSupported.mockResolvedValue(false);
    const { getCurrentFcmToken } = await importWithVapidKey("test-vapid-key");
    const result = await getCurrentFcmToken();
    expect(result).toBeNull();
  });

  it("returns the current FCM token on success", async () => {
    const { getCurrentFcmToken } = await importWithVapidKey("test-vapid-key");
    const result = await getCurrentFcmToken();
    expect(result).toBe(FAKE_TOKEN);
    expect(mockGetToken).toHaveBeenCalledWith(
      FAKE_MESSAGING,
      expect.objectContaining({ vapidKey: "test-vapid-key" }),
    );
  });

  it("returns null and warns when getToken throws", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockGetToken.mockRejectedValue(new Error("token error"));
    const { getCurrentFcmToken } = await importWithVapidKey("test-vapid-key");

    const result = await getCurrentFcmToken();

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("failed to get current FCM token"),
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });
});

describe("deleteFcmToken", () => {
  const FAKE_MESSAGING = { fake: "messaging" };
  const FAKE_TOKEN = "delete-fcm-token-xyz";

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSupported.mockResolvedValue(true);
    mockGetMessaging.mockReturnValue(FAKE_MESSAGING);
    mockGetToken.mockResolvedValue(FAKE_TOKEN);
    mockDeleteToken.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns null when VAPID key is not configured", async () => {
    const { deleteFcmToken } = await importWithVapidKey(undefined);
    const result = await deleteFcmToken();
    expect(result).toBeNull();
  });

  it("returns null when Firebase Messaging is not supported", async () => {
    mockIsSupported.mockResolvedValue(false);
    const { deleteFcmToken } = await importWithVapidKey("test-vapid-key");
    const result = await deleteFcmToken();
    expect(result).toBeNull();
  });

  it("deletes the token and returns it on success", async () => {
    const { deleteFcmToken } = await importWithVapidKey("test-vapid-key");
    const result = await deleteFcmToken();
    expect(result).toBe(FAKE_TOKEN);
    expect(mockDeleteToken).toHaveBeenCalledWith(FAKE_MESSAGING);
  });

  it("returns null and warns when getToken throws during deletion", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockGetToken.mockRejectedValue(new Error("token fetch error"));
    const { deleteFcmToken } = await importWithVapidKey("test-vapid-key");

    const result = await deleteFcmToken();

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("failed to delete FCM token"),
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });

  it("returns null and warns when deleteToken throws", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockDeleteToken.mockRejectedValue(new Error("delete error"));
    const { deleteFcmToken } = await importWithVapidKey("test-vapid-key");

    const result = await deleteFcmToken();

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("failed to delete FCM token"),
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });
});
