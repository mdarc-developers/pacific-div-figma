import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: {},
  storage: {},
}));

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    getDocs: vi.fn(),
    collection: vi.fn((_db: unknown, path: string) => ({ path })),
    doc: vi.fn(),
    setDoc: vi.fn(),
    deleteDoc: vi.fn(),
  };
});

import { getDocs } from "firebase/firestore";
import { usePublicAttendees } from "@/app/hooks/usePublicAttendees";
import { ATTENDEES_STORAGE_KEY } from "@/services/attendeesService";
import type { PublicAttendeeProfile } from "@/types/conference";

const mockGetDocs = getDocs as ReturnType<typeof vi.fn>;

const sampleDocs = [
  {
    id: "uid1",
    data: () => ({ displayName: "Alice", callsign: "W6ABC" }),
  },
];

const sampleAttendees: PublicAttendeeProfile[] = [
  { uid: "uid1", displayName: "Alice", callsign: "W6ABC" },
];

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

describe("usePublicAttendees", () => {
  it("initialises with localStorage data while loading", () => {
    localStorage.setItem(
      ATTENDEES_STORAGE_KEY,
      JSON.stringify(sampleAttendees),
    );
    mockGetDocs.mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => usePublicAttendees());

    // Should immediately have the cached data
    expect(result.current.attendees).toEqual(sampleAttendees);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("starts with an empty array when localStorage is empty", () => {
    mockGetDocs.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => usePublicAttendees());
    expect(result.current.attendees).toEqual([]);
  });

  it("populates attendees from Firestore and saves to localStorage", async () => {
    mockGetDocs.mockResolvedValue({ docs: sampleDocs });

    const { result } = renderHook(() => usePublicAttendees());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.attendees).toEqual(sampleAttendees);
    expect(result.current.error).toBeNull();

    // Verify persistence
    const stored = JSON.parse(
      localStorage.getItem(ATTENDEES_STORAGE_KEY)!,
    ) as PublicAttendeeProfile[];
    expect(stored).toEqual(sampleAttendees);
  });

  it("sets error message and retains cached data when Firestore fails", async () => {
    localStorage.setItem(
      ATTENDEES_STORAGE_KEY,
      JSON.stringify(sampleAttendees),
    );
    mockGetDocs.mockRejectedValue(new Error("Permission denied"));

    const { result } = renderHook(() => usePublicAttendees());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Permission denied");
    // Stale cache should still be present
    expect(result.current.attendees).toEqual(sampleAttendees);
  });

  it("refresh() triggers a new Firestore fetch", async () => {
    mockGetDocs.mockResolvedValue({ docs: [] });

    const { result } = renderHook(() => usePublicAttendees());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetDocs).toHaveBeenCalledTimes(1);

    mockGetDocs.mockResolvedValue({ docs: sampleDocs });

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetDocs).toHaveBeenCalledTimes(2);
    expect(result.current.attendees).toEqual(sampleAttendees);
  });

  it("clears error on a successful refresh", async () => {
    mockGetDocs.mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => usePublicAttendees());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();

    mockGetDocs.mockResolvedValue({ docs: sampleDocs });
    act(() => {
      result.current.refresh();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.attendees).toEqual(sampleAttendees);
  });
});
