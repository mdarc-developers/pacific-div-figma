import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

const mockGetDoc = vi.fn();
const mockDoc = vi.fn((_db, _col, _id) => ({ path: "stats/signupCounter" }));

vi.mock("firebase/firestore", () => ({
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
}));

import { useSignupCount } from "@/app/hooks/useSignupCount";

afterEach(() => {
  vi.clearAllMocks();
});

describe("useSignupCount", () => {
  it("returns null initially while loading", () => {
    mockGetDoc.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useSignupCount());
    expect(result.current).toBeNull();
  });

  it("returns the count from stats/signupCounter", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ count: 42 }),
    });

    const { result } = renderHook(() => useSignupCount());

    await waitFor(() => expect(result.current).toBe(42));
  });

  it("returns null when the document does not exist", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => undefined,
    });

    const { result } = renderHook(() => useSignupCount());

    await waitFor(() => expect(result.current).toBeNull());
  });

  it("returns null when count field is missing", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ other: "field" }),
    });

    const { result } = renderHook(() => useSignupCount());

    await waitFor(() => {
      // state settled (no pending promise)
      expect(mockGetDoc).toHaveBeenCalledTimes(1);
    });
    expect(result.current).toBeNull();
  });

  it("returns null and does not throw when Firestore read fails", async () => {
    mockGetDoc.mockRejectedValue(new Error("Permission denied"));

    const { result } = renderHook(() => useSignupCount());

    await waitFor(() => {
      expect(mockGetDoc).toHaveBeenCalledTimes(1);
    });
    expect(result.current).toBeNull();
  });
});
