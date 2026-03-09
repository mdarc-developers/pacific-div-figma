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

// ── Mock MapsView to keep the test surface small ──────────────────────────────
vi.mock("@/app/components/MapsView", () => ({
  MapsView: () => <div data-testid="maps-view" />,
}));

// Static imports — vi.mock calls above are hoisted before this by Vitest
import { MapsPage } from "@/app/pages/MapsPage";

// ── Helper ────────────────────────────────────────────────────────────────────
function renderMapsPage() {
  return render(
    <MemoryRouter>
      <ConferenceProvider>
        <MapsPage />
      </ConferenceProvider>
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("MapsPage", () => {
  it("renders without crashing", () => {
    expect(() => renderMapsPage()).not.toThrow();
  });

  it("renders the MapsView component", () => {
    renderMapsPage();
    expect(screen.getByTestId("maps-view")).toBeInTheDocument();
  });
});
