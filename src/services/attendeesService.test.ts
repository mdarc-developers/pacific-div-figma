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
  { uid: "uid2", displayName: "Bob Jones" },
];

describe("loadAttendeesFromStorage", () => {
  it("returns an empty array when localStorage is empty", () => {
    expect(loadAttendeesFromStorage()).toEqual([]);
  });

  it("returns the stored attendees", () => {
    localStorage.setItem(
      ATTENDEES_STORAGE_KEY,
      JSON.stringify(sampleAttendees),
    );
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

  it("maps Firestore documents to PublicAttendeeProfile objects (allowed fields only)", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "uid1",
          data: () => ({
            displayName: "Alice Smith",
            callsign: "W6ABC",
            // email, groups, sessions, prizesDonated are stored in
            // Firestore but should NOT be returned by fetchPublicAttendees.
            // exhibitors is now included as a non-sensitive affiliation field.
            email: "alice@example.com",
            groups: ["organizers"],
            sessions: ["session-1"],
            exhibitors: ["exhibitor-1"],
            prizesDonated: ["prize-1"],
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
    // exhibitors is now a public field (organisational affiliation)
    expect(result[0]).toEqual({
      uid: "uid1",
      displayName: "Alice Smith",
      callsign: "W6ABC",
      exhibitors: ["exhibitor-1"],
    });
    // Sensitive fields must remain absent
    expect(result[0]).not.toHaveProperty("email");
    expect(result[0]).not.toHaveProperty("groups");
    expect(result[0]).not.toHaveProperty("sessions");
    expect(result[0]).not.toHaveProperty("prizesDonated");
    expect(result[1]).toEqual({ uid: "uid2", displayName: "Bob Jones" });
  });

  it("includes speakerSessions when present in Firestore data", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "uid1",
          data: () => ({
            displayName: "Alice Smith",
            speakerSessions: {
              "quartzfest-2027": ["session-a", "session-b"],
            },
          }),
        },
      ],
    });

    const result = await fetchPublicAttendees();
    expect(result[0]).toEqual({
      uid: "uid1",
      displayName: "Alice Smith",
      speakerSessions: { "quartzfest-2027": ["session-a", "session-b"] },
    });
  });

  it("omits speakerSessions when the map is empty", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "uid1",
          data: () => ({
            displayName: "Alice Smith",
            speakerSessions: {},
          }),
        },
      ],
    });

    const result = await fetchPublicAttendees();
    expect(result[0]).not.toHaveProperty("speakerSessions");
  });

  it("omits fields that are absent or empty strings", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "uid3",
          data: () => ({
            displayName: "",
            callsign: null,
          }),
        },
      ],
    });

    const result = await fetchPublicAttendees();
    expect(result[0]).toEqual({ uid: "uid3" });
  });

  it("rethrows when Firestore read fails", async () => {
    mockGetDocs.mockRejectedValue(new Error("network error"));
    await expect(fetchPublicAttendees()).rejects.toThrow("network error");
  });

  it("rethrows permission-denied errors", async () => {
    const permissionError = Object.assign(new Error("permission-denied"), {
      code: "permission-denied",
    });
    mockGetDocs.mockRejectedValue(permissionError);
    await expect(fetchPublicAttendees()).rejects.toThrow();
  });
});

describe("writePublicProfile", () => {
  it("calls setDoc with only the allowed fields (strips sensitive data)", async () => {
    mockSetDoc.mockResolvedValue(undefined);
    // Pass a profile object — TypeScript ensures only allowed fields exist,
    // but we verify the safe-profile logic strips nothing extra.
    const profile: PublicAttendeeProfile = {
      uid: "uid1",
      displayName: "Alice",
      callsign: "W6ABC",
      displayProfile: "Ham radio operator",
    };
    await writePublicProfile("uid1", profile);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "publicProfiles/uid1" }),
      {
        uid: "uid1",
        displayName: "Alice",
        callsign: "W6ABC",
        displayProfile: "Ham radio operator",
      },
      { merge: true },
    );
  });

  it("includes exhibitors when present", async () => {
    mockSetDoc.mockResolvedValue(undefined);
    const profile: PublicAttendeeProfile = {
      uid: "uid3",
      displayName: "Carol",
      callsign: "KD6XYZ",
      exhibitors: ["flexradio", "arrl"],
    };
    await writePublicProfile("uid3", profile);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "publicProfiles/uid3" }),
      {
        uid: "uid3",
        displayName: "Carol",
        callsign: "KD6XYZ",
        exhibitors: ["flexradio", "arrl"],
      },
      { merge: true },
    );
  });

  it("includes speakerSessions when present", async () => {
    mockSetDoc.mockResolvedValue(undefined);
    const profile: PublicAttendeeProfile = {
      uid: "uid4",
      displayName: "Dave",
      speakerSessions: { "quartzfest-2027": ["session-x"] },
    };
    await writePublicProfile("uid4", profile);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "publicProfiles/uid4" }),
      {
        uid: "uid4",
        displayName: "Dave",
        speakerSessions: { "quartzfest-2027": ["session-x"] },
      },
      { merge: true },
    );
  });

  it("omits optional fields that are undefined", async () => {
    mockSetDoc.mockResolvedValue(undefined);
    const profile: PublicAttendeeProfile = { uid: "uid2" };
    await writePublicProfile("uid2", profile);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "publicProfiles/uid2" }),
      { uid: "uid2" },
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
