import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ConferenceProvider } from "@/app/contexts/ConferenceContext";
import {
  BookmarkProvider,
  useBookmarkContext,
} from "@/app/contexts/BookmarkContext";

// ── Mock localStorage ─────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  configurable: true,
  writable: true,
});

// ── Wrapper providing required contexts ───────────────────────────────────────
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConferenceProvider>
      <BookmarkProvider>{children}</BookmarkProvider>
    </ConferenceProvider>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("BookmarkContext", () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem("activeConference", "hamvention-2026");
  });

  it("throws when used outside BookmarkProvider", () => {
    expect(() => renderHook(() => useBookmarkContext())).toThrow(
      "useBookmarkContext must be used within a BookmarkProvider",
    );
  });

  it("initialises with empty bookmarked and prevBookmarked lists", () => {
    const { result } = renderHook(() => useBookmarkContext(), { wrapper });
    expect(result.current.bookmarkedItems).toEqual([]);
    expect(result.current.prevBookmarkedItems).toEqual([]);
  });

  it("toggleBookmark adds an item", () => {
    const { result } = renderHook(() => useBookmarkContext(), { wrapper });
    act(() => result.current.toggleBookmark("s1"));
    expect(result.current.bookmarkedItems).toContain("s1");
  });

  it("toggleBookmark removes an already-bookmarked item", () => {
    const { result } = renderHook(() => useBookmarkContext(), { wrapper });
    act(() => result.current.toggleBookmark("s1"));
    act(() => result.current.toggleBookmark("s1"));
    expect(result.current.bookmarkedItems).not.toContain("s1");
  });

  it("moves an item to prevBookmarkedItems when it is unbookmarked", () => {
    const { result } = renderHook(() => useBookmarkContext(), { wrapper });
    act(() => result.current.toggleBookmark("s1"));
    act(() => result.current.toggleBookmark("s1")); // unbookmark
    expect(result.current.prevBookmarkedItems).toContain("s1");
  });

  it("removes an item from prevBookmarkedItems when it is re-bookmarked", () => {
    const { result } = renderHook(() => useBookmarkContext(), { wrapper });
    act(() => result.current.toggleBookmark("s1"));
    act(() => result.current.toggleBookmark("s1")); // unbookmark → goes to prev
    act(() => result.current.toggleBookmark("s1")); // re-bookmark → removed from prev
    expect(result.current.bookmarkedItems).toContain("s1");
    expect(result.current.prevBookmarkedItems).not.toContain("s1");
  });

  it("persists bookmarks to localStorage on toggle", () => {
    const { result } = renderHook(() => useBookmarkContext(), { wrapper });
    act(() => result.current.toggleBookmark("s1"));
    const stored = localStorageMock.getItem("bookmarks_hamvention-2026");
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toContain("s1");
  });

  it("overrideBookmarks replaces state and persists to localStorage", () => {
    const { result } = renderHook(() => useBookmarkContext(), { wrapper });
    act(() => result.current.overrideBookmarks(["s10", "s11"], ["s12"]));
    expect(result.current.bookmarkedItems).toEqual(["s10", "s11"]);
    expect(result.current.prevBookmarkedItems).toEqual(["s12"]);
    const stored = localStorageMock.getItem("bookmarks_hamvention-2026");
    expect(JSON.parse(stored!)).toEqual(["s10", "s11"]);
    const prevStored = localStorageMock.getItem(
      "prev_bookmarks_hamvention-2026",
    );
    expect(JSON.parse(prevStored!)).toEqual(["s12"]);
  });

  it("loads existing localStorage values on mount", () => {
    localStorageMock.setItem(
      "bookmarks_hamvention-2026",
      JSON.stringify(["s5"]),
    );
    localStorageMock.setItem(
      "prev_bookmarks_hamvention-2026",
      JSON.stringify(["s6"]),
    );
    const { result } = renderHook(() => useBookmarkContext(), { wrapper });
    expect(result.current.bookmarkedItems).toContain("s5");
    expect(result.current.prevBookmarkedItems).toContain("s6");
  });

  it("does not add a duplicate to prevBookmarkedItems on repeated unbookmarks", () => {
    const { result } = renderHook(() => useBookmarkContext(), { wrapper });
    act(() => result.current.toggleBookmark("s1"));
    act(() => result.current.toggleBookmark("s1")); // unbookmark → prev
    // Re-add and remove again
    act(() => result.current.toggleBookmark("s1")); // re-bookmark → removed from prev
    act(() => result.current.toggleBookmark("s1")); // unbookmark again → back to prev
    const prevCount = result.current.prevBookmarkedItems.filter(
      (id) => id === "s1",
    ).length;
    expect(prevCount).toBe(1);
  });
});
