import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ConferenceProvider } from "@/app/contexts/ConferenceContext";

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

// ── Mock PrizesView to keep the test surface small ────────────────────────────
vi.mock("@/app/components/PrizesView", () => ({
  PrizesView: () => <div data-testid="prizes-view" />,
}));

// Static imports — vi.mock calls above are hoisted before this by Vitest
import { PrizesPage } from "@/app/pages/PrizesPage";

// ── Helper ────────────────────────────────────────────────────────────────────
function renderPrizesPage() {
  return render(
    <MemoryRouter>
      <ConferenceProvider>
        <PrizesPage />
      </ConferenceProvider>
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("PrizesPage", () => {
  it("renders without crashing", () => {
    expect(() => renderPrizesPage()).not.toThrow();
  });

  it("renders the PrizesView component", () => {
    renderPrizesPage();
    expect(screen.getByTestId("prizes-view")).toBeInTheDocument();
  });
});
