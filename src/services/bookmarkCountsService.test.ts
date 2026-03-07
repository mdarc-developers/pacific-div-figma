import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: {},
  storage: {},
}));

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    doc: vi.fn(),
    increment: vi.fn(),
  };
});

import { withZeroFallbacks } from "@/services/bookmarkCountsService";

describe("withZeroFallbacks", () => {
  it("returns an empty object when knownIds is empty", () => {
    expect(withZeroFallbacks({}, [])).toEqual({});
  });

  it("adds zero entries for every id not present in counts", () => {
    const result = withZeroFallbacks({}, ["a", "b", "c"]);
    expect(result).toEqual({ a: 0, b: 0, c: 0 });
  });

  it("preserves existing non-zero counts", () => {
    const result = withZeroFallbacks({ a: 5, b: 3 }, ["a", "b", "c"]);
    expect(result).toEqual({ a: 5, b: 3, c: 0 });
  });

  it("does not overwrite an existing count of zero", () => {
    const result = withZeroFallbacks({ a: 0 }, ["a", "b"]);
    expect(result).toEqual({ a: 0, b: 0 });
  });

  it("includes counts for ids not in knownIds (extra Firestore entries)", () => {
    const result = withZeroFallbacks({ x: 10 }, ["a"]);
    expect(result).toEqual({ a: 0, x: 10 });
  });
});
