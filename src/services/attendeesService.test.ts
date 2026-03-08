import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Firebase modules before importing service
vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: {},
  storage: {},
}));

const mockGetDocs = vi.fn();
const mockSetDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockCollection = vi.fn((_db: unknown, path: string) => ({ path }));
const mockDoc = vi.fn((_db: unknown, col: string, id: string) => ({
  path: `${col}/${id}`,
}));

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    getDocs: (...args: unknown[]) => mockGetDocs(...args),
    setDoc: (...args: unknown[]) => mockSetDoc(...args),
    deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
    collection: (...args: unknown[]) => mockCollection(...args),
    doc: (...args: unknown[]) => mockDoc(...args),
  };
});

import {
  loadAttendeesFromStorage,
  saveAttendeesToStorage,
  fetchPublicAttendees,
  writePublicProfile,
  deletePublicProfile,
  ATTENDEES_STORAGE_KEY,
} from "@/services/attendeesService";
import type { PublicAttendeeProfile } from "@/types/conference";

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

const sampleAttendees: PublicAttendeeProfile[] = [
  { uid: "uid1", displayName: "Alice Smith", callsign: "W6ABC" },
  { uid: "uid2", displayName: "Bob Jones", email: "bob@example.com" },
];

describe("loadAttendeesFromStorage", () => {
  it("returns an empty array when localStorage is empty", () => {
    expect(loadAttendeesFromStorage()).toEqual([]);
  });

  it("returns the stored attendees", () => {
    localStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(sampleAttendees));
    expect(loadAttendeesFromStorage()).toEqual(sampleAttendees);
  });

  it("returns an empty array when the stored value is malformed JSON", () => {
    localStorage.setItem(ATTENDEES_STORAGE_KEY, "not-json{{{");
    expect(loadAttendeesFromStorage()).toEqual([]);
  });
});

describe("saveAttendeesToStorage", () => {
  it("persists attendees to localStorage", () => {
    saveAttendeesToStorage(sampleAttendees);
    const stored = JSON.parse(
      localStorage.getItem(ATTENDEES_STORAGE_KEY)!,
    ) as PublicAttendeeProfile[];
    expect(stored).toEqual(sampleAttendees);
  });

  it("overwrites existing data", () => {
    saveAttendeesToStorage(sampleAttendees);
    saveAttendeesToStorage([]);
    expect(loadAttendeesFromStorage()).toEqual([]);
  });
});

describe("fetchPublicAttendees", () => {
  it("returns an empty array when the collection is empty", async () => {
    mockGetDocs.mockResolvedValue({ docs: [] });
    const result = await fetchPublicAttendees();
    expect(result).toEqual([]);
  });

  it("maps Firestore documents to PublicAttendeeProfile objects", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "uid1",
          data: () => ({
            displayName: "Alice Smith",
            callsign: "W6ABC",
            email: "alice@example.com",
            groups: ["organizers"],
          }),
        },
        {
          id: "uid2",
          data: () => ({
            displayName: "Bob Jones",
          }),
        },
      ],
    });

    const result = await fetchPublicAttendees();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      uid: "uid1",
      displayName: "Alice Smith",
      callsign: "W6ABC",
      email: "alice@example.com",
      groups: ["organizers"],
    });
    expect(result[1]).toEqual({ uid: "uid2", displayName: "Bob Jones" });
  });

  it("omits fields that are absent or empty strings", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "uid3",
          data: () => ({
            displayName: "",
            callsign: null,
            email: "test@test.com",
          }),
        },
      ],
    });

    const result = await fetchPublicAttendees();
    expect(result[0]).toEqual({ uid: "uid3", email: "test@test.com" });
  });

  it("throws when Firestore read fails", async () => {
    mockGetDocs.mockRejectedValue(new Error("network error"));
    await expect(fetchPublicAttendees()).rejects.toThrow("network error");
  });
});

describe("writePublicProfile", () => {
  it("calls setDoc with the correct path and profile data", async () => {
    mockSetDoc.mockResolvedValue(undefined);
    const profile: PublicAttendeeProfile = { uid: "uid1", displayName: "Alice" };
    await writePublicProfile("uid1", profile);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "publicProfiles/uid1" }),
      profile,
      { merge: true },
    );
  });
});

describe("deletePublicProfile", () => {
  it("calls deleteDoc with the correct path", async () => {
    mockDeleteDoc.mockResolvedValue(undefined);
    await deletePublicProfile("uid1");
    expect(mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "publicProfiles/uid1" }),
    );
  });
});
