import { describe, it, expect } from "vitest";
import {
  MAX_VOTES,
  sanitizeVotes,
  validateAddVote,
  validateRemoveVote,
} from "./voteValidation";

describe("MAX_VOTES", () => {
  it("is 1", () => {
    expect(MAX_VOTES).toBe(1);
  });
});

// ── sanitizeVotes ─────────────────────────────────────────────────────────────

describe("sanitizeVotes", () => {
  it("returns an empty array for undefined", () => {
    expect(sanitizeVotes(undefined)).toEqual([]);
  });

  it("returns an empty array for null", () => {
    expect(sanitizeVotes(null)).toEqual([]);
  });

  it("returns an empty array for a non-array value", () => {
    expect(sanitizeVotes("session-1")).toEqual([]);
    expect(sanitizeVotes(42)).toEqual([]);
    expect(sanitizeVotes({})).toEqual([]);
  });

  it("filters out non-string elements", () => {
    expect(sanitizeVotes(["session-1", 2, null, "session-2"])).toEqual([
      "session-1",
    ]); // truncated to MAX_VOTES=1
  });

  it("returns the array unchanged when within the limit", () => {
    expect(sanitizeVotes(["session-1"])).toEqual(["session-1"]);
  });

  it("truncates to MAX_VOTES when the array exceeds the limit", () => {
    expect(sanitizeVotes(["session-1", "session-2"])).toEqual(["session-1"]);
  });

  it("respects a custom maxVotes parameter", () => {
    expect(sanitizeVotes(["a", "b", "c"], 2)).toEqual(["a", "b"]);
  });

  it("returns an empty array for an empty array", () => {
    expect(sanitizeVotes([])).toEqual([]);
  });
});

// ── validateAddVote ───────────────────────────────────────────────────────────

describe("validateAddVote", () => {
  it("returns null when the vote is valid (empty list)", () => {
    expect(validateAddVote([], "session-1")).toBeNull();
  });

  it("returns 'already-voted' when the item is already in the list", () => {
    expect(validateAddVote(["session-1"], "session-1")).toBe("already-voted");
  });

  it("returns 'vote-limit-reached' when the list is at MAX_VOTES", () => {
    expect(validateAddVote(["session-1"], "session-2")).toBe(
      "vote-limit-reached",
    );
  });

  it("allows adding when there is exactly one slot available (custom maxVotes)", () => {
    expect(validateAddVote(["a"], "b", 2)).toBeNull();
  });

  it("blocks adding when the list is full (custom maxVotes)", () => {
    expect(validateAddVote(["a", "b"], "c", 2)).toBe("vote-limit-reached");
  });

  it("returns null for an empty list regardless of itemId", () => {
    expect(validateAddVote([], "anything")).toBeNull();
  });
});

// ── validateRemoveVote ────────────────────────────────────────────────────────

describe("validateRemoveVote", () => {
  it("returns null when the item is present (valid removal)", () => {
    expect(validateRemoveVote(["session-1"], "session-1")).toBeNull();
  });

  it("returns 'not-voted' when the item is not in the list", () => {
    expect(validateRemoveVote([], "session-1")).toBe("not-voted");
    expect(validateRemoveVote(["session-2"], "session-1")).toBe("not-voted");
  });
});
