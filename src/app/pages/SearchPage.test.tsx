import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ── Mock Firebase ─────────────────────────────────────────────────────────────
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

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
    setDoc: vi.fn().mockResolvedValue(undefined),
    doc: vi.fn(),
    increment: vi.fn((n: number) => n),
  };
});

// ── Mock ScheduleView to keep the test surface small ─────────────────────────
vi.mock("@/app/components/ScheduleView", () => ({
  ScheduleView: () => <div data-testid="schedule-view" />,
}));

// Static imports — vi.mock calls above are hoisted before this by Vitest
import { SearchPage } from "@/app/pages/SearchPage";
import { BookmarkProvider } from "@/app/contexts/BookmarkContext";
import { BookmarkCountsProvider } from "@/app/contexts/BookmarkCountsContext";
import { ConferenceProvider } from "@/app/contexts/ConferenceContext";

// ── Helper ────────────────────────────────────────────────────────────────────
function renderSearchPage() {
  return render(
    <MemoryRouter>
      <ConferenceProvider>
        <BookmarkProvider>
          <BookmarkCountsProvider>
            <SearchPage />
          </BookmarkCountsProvider>
        </BookmarkProvider>
      </ConferenceProvider>
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("SearchPage", () => {
  it("renders without crashing", () => {
    expect(() => renderSearchPage()).not.toThrow();
  });

  it("renders the ScheduleView component", () => {
    renderSearchPage();
    expect(screen.getByTestId("schedule-view")).toBeInTheDocument();
  });
});
