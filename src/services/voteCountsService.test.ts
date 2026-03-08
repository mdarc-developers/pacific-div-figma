import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: {},
  storage: {},
}));

const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockDoc = vi.fn((_db: unknown, col: string, id: string) => ({
  path: `${col}/${id}`,
}));
const mockIncrement = vi.fn((delta: number) => ({ _increment: delta }));

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    getDoc: (...args: unknown[]) => mockGetDoc(...args),
    setDoc: (...args: unknown[]) => mockSetDoc(...args),
    doc: (...args: unknown[]) => mockDoc(...args),
    increment: (delta: number) => mockIncrement(delta),
  };
});

import {
  loadSessionVoteCountsFromLS,
  saveSessionVoteCountsToLS,
  loadExhibitorVoteCountsFromLS,
  saveExhibitorVoteCountsToLS,
  getVoteCounts,
  incrementSessionVoteCount,
  incrementExhibitorVoteCount,
} from "@/services/voteCountsService";

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

// ── loadSessionVoteCountsFromLS ───────────────────────────────────────────────

describe("loadSessionVoteCountsFromLS", () => {
  it("returns an empty object when nothing is stored", () => {
    expect(loadSessionVoteCountsFromLS("conf-1")).toEqual({});
  });

  it("returns stored counts for the given conferenceId", () => {
    localStorage.setItem(
      "session_vote_counts_conf-1",
      JSON.stringify({ "session-a": 3, "session-b": 1 }),
    );
    expect(loadSessionVoteCountsFromLS("conf-1")).toEqual({
      "session-a": 3,
      "session-b": 1,
    });
  });

  it("is keyed by conferenceId — another conference returns empty", () => {
    localStorage.setItem(
      "session_vote_counts_conf-1",
      JSON.stringify({ "session-a": 3 }),
    );
    expect(loadSessionVoteCountsFromLS("conf-2")).toEqual({});
  });

  it("returns an empty object when the stored value is malformed JSON", () => {
    localStorage.setItem("session_vote_counts_conf-1", "not-json{{{");
    expect(loadSessionVoteCountsFromLS("conf-1")).toEqual({});
  });
});

// ── saveSessionVoteCountsToLS ─────────────────────────────────────────────────

describe("saveSessionVoteCountsToLS", () => {
  it("persists counts to localStorage under the correct key", () => {
    saveSessionVoteCountsToLS("conf-1", { "session-a": 5 });
    const raw = localStorage.getItem("session_vote_counts_conf-1");
    expect(JSON.parse(raw!)).toEqual({ "session-a": 5 });
  });

  it("overwrites previously saved counts", () => {
    saveSessionVoteCountsToLS("conf-1", { "session-a": 5 });
    saveSessionVoteCountsToLS("conf-1", { "session-a": 2 });
    expect(loadSessionVoteCountsFromLS("conf-1")).toEqual({ "session-a": 2 });
  });

  it("does not throw for an empty object", () => {
    expect(() => saveSessionVoteCountsToLS("conf-1", {})).not.toThrow();
  });
});

// ── loadExhibitorVoteCountsFromLS ─────────────────────────────────────────────

describe("loadExhibitorVoteCountsFromLS", () => {
  it("returns an empty object when nothing is stored", () => {
    expect(loadExhibitorVoteCountsFromLS("conf-1")).toEqual({});
  });

  it("returns stored exhibitor counts for the given conferenceId", () => {
    localStorage.setItem(
      "exhibitor_vote_counts_conf-1",
      JSON.stringify({ "exhibitor-x": 7 }),
    );
    expect(loadExhibitorVoteCountsFromLS("conf-1")).toEqual({ "exhibitor-x": 7 });
  });

  it("returns an empty object when the stored value is malformed JSON", () => {
    localStorage.setItem("exhibitor_vote_counts_conf-1", "bad-json");
    expect(loadExhibitorVoteCountsFromLS("conf-1")).toEqual({});
  });
});

// ── saveExhibitorVoteCountsToLS ───────────────────────────────────────────────

describe("saveExhibitorVoteCountsToLS", () => {
  it("persists exhibitor counts to localStorage under the correct key", () => {
    saveExhibitorVoteCountsToLS("conf-1", { "exhibitor-x": 4 });
    const raw = localStorage.getItem("exhibitor_vote_counts_conf-1");
    expect(JSON.parse(raw!)).toEqual({ "exhibitor-x": 4 });
  });

  it("overwrites previously saved exhibitor counts", () => {
    saveExhibitorVoteCountsToLS("conf-1", { "exhibitor-x": 4 });
    saveExhibitorVoteCountsToLS("conf-1", { "exhibitor-x": 1 });
    expect(loadExhibitorVoteCountsFromLS("conf-1")).toEqual({ "exhibitor-x": 1 });
  });
});

// ── getVoteCounts ─────────────────────────────────────────────────────────────

describe("getVoteCounts", () => {
  it("returns empty counts when the document does not exist", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });
    const result = await getVoteCounts("conf-1");
    expect(result).toEqual({ sessionCounts: {}, exhibitorCounts: {} });
  });

  it("returns session and exhibitor counts from the Firestore document", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        sessions: { "session-a": 3, "session-b": 1 },
        exhibitors: { "exhibitor-x": 5 },
      }),
    });
    const result = await getVoteCounts("conf-1");
    expect(result.sessionCounts).toEqual({ "session-a": 3, "session-b": 1 });
    expect(result.exhibitorCounts).toEqual({ "exhibitor-x": 5 });
  });

  it("defaults to empty objects when sessions/exhibitors fields are missing", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({}),
    });
    const result = await getVoteCounts("conf-1");
    expect(result.sessionCounts).toEqual({});
    expect(result.exhibitorCounts).toEqual({});
  });

  it("reads from the voteCounts/{conferenceId} path", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });
    await getVoteCounts("conf-abc");
    expect(mockDoc).toHaveBeenCalledWith(expect.anything(), "voteCounts", "conf-abc");
  });
});

// ── incrementSessionVoteCount ─────────────────────────────────────────────────

describe("incrementSessionVoteCount", () => {
  it("calls setDoc with merge:true and a positive increment when delta is 1", async () => {
    mockSetDoc.mockResolvedValue(undefined);
    await incrementSessionVoteCount("conf-1", "session-a", 1);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "voteCounts/conf-1" }),
      { sessions: { "session-a": expect.anything() } },
      { merge: true },
    );
    expect(mockIncrement).toHaveBeenCalledWith(1);
  });

  it("calls setDoc with a negative increment when delta is -1", async () => {
    mockSetDoc.mockResolvedValue(undefined);
    await incrementSessionVoteCount("conf-1", "session-a", -1);
    expect(mockIncrement).toHaveBeenCalledWith(-1);
  });
});

// ── incrementExhibitorVoteCount ───────────────────────────────────────────────

describe("incrementExhibitorVoteCount", () => {
  it("calls setDoc with merge:true and a positive increment when delta is 1", async () => {
    mockSetDoc.mockResolvedValue(undefined);
    await incrementExhibitorVoteCount("conf-1", "exhibitor-x", 1);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "voteCounts/conf-1" }),
      { exhibitors: { "exhibitor-x": expect.anything() } },
      { merge: true },
    );
    expect(mockIncrement).toHaveBeenCalledWith(1);
  });

  it("calls setDoc with a negative increment when delta is -1", async () => {
    mockSetDoc.mockResolvedValue(undefined);
    await incrementExhibitorVoteCount("conf-1", "exhibitor-x", -1);
    expect(mockIncrement).toHaveBeenCalledWith(-1);
  });
});
