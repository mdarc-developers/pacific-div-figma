import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNotificationSettings } from "@/app/hooks/useNotificationSettings";

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

// ── Mock AuthContext — no logged-in user (localStorage-only behaviour) ────────
vi.mock("@/app/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

// ── Mock Firestore service ────────────────────────────────────────────────────
const mockGetUserNotificationSettings = vi.fn().mockResolvedValue(null);
const mockSetUserNotificationSettings = vi.fn().mockResolvedValue(undefined);
const mockAddUserFcmToken = vi.fn().mockResolvedValue(undefined);
const mockRemoveUserFcmToken = vi.fn().mockResolvedValue(undefined);

vi.mock("@/services/userSettingsService", () => ({
  getUserNotificationSettings: (...args: unknown[]) =>
    mockGetUserNotificationSettings(...args),
  setUserNotificationSettings: (...args: unknown[]) =>
    mockSetUserNotificationSettings(...args),
  addUserFcmToken: (...args: unknown[]) => mockAddUserFcmToken(...args),
  removeUserFcmToken: (...args: unknown[]) => mockRemoveUserFcmToken(...args),
}));

// ── Mock FCM messaging ────────────────────────────────────────────────────────
const mockRequestFcmToken = vi.fn().mockResolvedValue(null);
const mockDeleteFcmToken = vi.fn().mockResolvedValue(null);

vi.mock("@/lib/messaging", () => ({
  requestFcmToken: () => mockRequestFcmToken(),
  deleteFcmToken: () => mockDeleteFcmToken(),
}));

const CLOUD_KEY = "cloud_alerts_enabled";
const SMS_KEY = "sms_notifications_enabled";

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  mockGetUserNotificationSettings.mockResolvedValue(null);
  mockSetUserNotificationSettings.mockResolvedValue(undefined);
  mockRequestFcmToken.mockResolvedValue(null);
  mockDeleteFcmToken.mockResolvedValue(null);
});
afterEach(() => localStorage.clear());

describe("useNotificationSettings — cloudAlertsEnabled persistence", () => {
  it("initialises cloudAlertsEnabled to false when localStorage is empty", () => {
    const { result } = renderHook(() => useNotificationSettings());
    expect(result.current.cloudAlertsEnabled).toBe(false);
  });

  it("initialises cloudAlertsEnabled from localStorage on mount", () => {
    localStorage.setItem(CLOUD_KEY, "true");
    const { result } = renderHook(() => useNotificationSettings());
    expect(result.current.cloudAlertsEnabled).toBe(true);
  });

  it("setCloudAlertsEnabled(true) saves true to localStorage even when FCM token is unavailable", async () => {
    mockRequestFcmToken.mockResolvedValue(null); // FCM unavailable

    const { result } = renderHook(() => useNotificationSettings());

    await act(async () => {
      result.current.setCloudAlertsEnabled(true);
    });

    expect(result.current.cloudAlertsEnabled).toBe(true);
    expect(JSON.parse(localStorage.getItem(CLOUD_KEY)!)).toBe(true);
  });

  it("setCloudAlertsEnabled(true) keeps value true after FCM token request resolves with null", async () => {
    mockRequestFcmToken.mockResolvedValue(null);

    const { result } = renderHook(() => useNotificationSettings());

    await act(async () => {
      result.current.setCloudAlertsEnabled(true);
    });

    // Value must remain true — no revert should occur
    expect(result.current.cloudAlertsEnabled).toBe(true);
    expect(JSON.parse(localStorage.getItem(CLOUD_KEY)!)).toBe(true);
  });

  it("setCloudAlertsEnabled(false) saves false to localStorage immediately", async () => {
    localStorage.setItem(CLOUD_KEY, "true");
    const { result } = renderHook(() => useNotificationSettings());

    await act(async () => {
      result.current.setCloudAlertsEnabled(false);
    });

    expect(result.current.cloudAlertsEnabled).toBe(false);
    expect(JSON.parse(localStorage.getItem(CLOUD_KEY)!)).toBe(false);
  });

  it("remounting the hook loads the persisted true value from localStorage", async () => {
    mockRequestFcmToken.mockResolvedValue(null);

    const { result: first } = renderHook(() => useNotificationSettings());
    await act(async () => {
      first.current.setCloudAlertsEnabled(true);
    });
    expect(localStorage.getItem(CLOUD_KEY)).toBe("true");

    // Simulate navigation away and back (new hook instance)
    const { result: second } = renderHook(() => useNotificationSettings());
    expect(second.current.cloudAlertsEnabled).toBe(true);
  });
});

describe("useNotificationSettings — other settings persist via localStorage", () => {
  it("setSmsEnabled persists to localStorage", async () => {
    const { result } = renderHook(() => useNotificationSettings());
    await act(async () => {
      result.current.setSmsEnabled(true);
    });
    expect(result.current.smsEnabled).toBe(true);
    expect(JSON.parse(localStorage.getItem(SMS_KEY)!)).toBe(true);
  });

  it("setEmailEnabled persists to localStorage", async () => {
    const { result } = renderHook(() => useNotificationSettings());
    await act(async () => {
      result.current.setEmailEnabled(false);
    });
    expect(result.current.emailEnabled).toBe(false);
    expect(
      JSON.parse(localStorage.getItem("email_notifications_enabled")!),
    ).toBe(false);
  });
});
