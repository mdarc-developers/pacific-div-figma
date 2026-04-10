import { describe, it, expect, vi, beforeEach } from "vitest";
import { castVote, MAX_VOTES } from "@/lib/vote";

// Mock sonner so toast calls are captured without a real DOM.
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
  },
}));

// Re-import after mocking so we can inspect calls.
import { toast } from "sonner";

describe("castVote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds a vote when the list is empty", () => {
    const result = castVote([], "session-1", "session");
    expect(result).toEqual(["session-1"]);
    expect(toast.info).not.toHaveBeenCalled();
  });

  it("removes a vote when the id is already present (unvote)", () => {
    const result = castVote(["session-1"], "session-1", "session");
    expect(result).toEqual([]);
    expect(toast.info).not.toHaveBeenCalled();
  });

  it("blocks a second vote and shows a toast when limit is reached", () => {
    // Already voted for session-1, try to vote for session-2.
    const result = castVote(["session-1"], "session-2", "session");
    expect(result).toEqual(["session-1"]); // unchanged
    expect(toast.info).toHaveBeenCalledOnce();
    expect(toast.info).toHaveBeenCalledWith(
      expect.stringContaining("session"),
    );
  });

  it("uses the itemLabel in the toast message", () => {
    castVote(["exhibitor-1"], "exhibitor-2", "exhibitor");
    expect(toast.info).toHaveBeenCalledWith(
      expect.stringContaining("exhibitor"),
    );
  });

  it("falls back to 'item' when no itemLabel is provided", () => {
    castVote(["x"], "y");
    expect(toast.info).toHaveBeenCalledWith(expect.stringContaining("item"));
  });

  it("allows voting after unvoting (round-trip)", () => {
    // Vote for session-1.
    let state = castVote([], "session-1", "session");
    expect(state).toEqual(["session-1"]);

    // Unvote session-1.
    state = castVote(state, "session-1", "session");
    expect(state).toEqual([]);

    // Vote for session-2.
    state = castVote(state, "session-2", "session");
    expect(state).toEqual(["session-2"]);

    expect(toast.info).not.toHaveBeenCalled();
  });

  it("does not mutate the input array", () => {
    const prev = ["session-1"];
    const result = castVote(prev, "session-2", "session");
    // Should be blocked; prev must be unchanged.
    expect(result).toBe(prev); // same reference returned when blocked
    expect(prev).toEqual(["session-1"]);
  });

  it("returns a new array reference when a vote is added", () => {
    const prev: string[] = [];
    const result = castVote(prev, "session-1", "session");
    expect(result).not.toBe(prev);
  });

  it("returns a new array reference when a vote is removed", () => {
    const prev = ["session-1"];
    const result = castVote(prev, "session-1", "session");
    expect(result).not.toBe(prev);
  });

  it("MAX_VOTES constant is 1", () => {
    expect(MAX_VOTES).toBe(1);
  });
});
