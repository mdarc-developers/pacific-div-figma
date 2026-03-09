import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ── Mock Firebase so AuthContext initialises without credentials ──────────────
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

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...actual,
    onAuthStateChanged: vi.fn((_a: unknown, cb: (u: null) => void) => {
      cb(null);
      return () => {};
    }),
  };
});

// ── Mock AuthContext ─────────────────────────────────────────────────────────
let mockUser: { email: string } | null = null;

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

// ── Mock AlertHistoryContext ─────────────────────────────────────────────────
vi.mock("../contexts/AlertHistoryContext", () => ({
  useAlertHistoryContext: () => ({
    alertHistory: [],
    clearHistory: vi.fn(),
    addAlert: vi.fn(),
    overrideAlertHistory: vi.fn(),
  }),
}));

// Static import — vi.mock calls above are hoisted before this by Vitest
import { AlertsPage } from "@/app/pages/AlertsPage";

// ── Helper ────────────────────────────────────────────────────────────────────
function renderAlertsPage() {
  return render(
    <MemoryRouter>
      <AlertsPage />
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("AlertsPage", () => {
  it("renders without crashing", () => {
    mockUser = null;
    expect(() => renderAlertsPage()).not.toThrow();
  });

  it("renders the AlertsView (sign-in prompt) when not authenticated", () => {
    mockUser = null;
    renderAlertsPage();
    expect(
      screen.getByRole("heading", { name: /prize notifications/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders alert history heading when authenticated", () => {
    mockUser = { email: "ham@example.com" };
    renderAlertsPage();
    expect(
      screen.getByRole("heading", { name: /alert history/i }),
    ).toBeInTheDocument();
  });

  it("does not render the sign-in prompt when authenticated", () => {
    mockUser = { email: "ham@example.com" };
    renderAlertsPage();
    expect(
      screen.queryByRole("heading", { name: /prize notifications/i }),
    ).not.toBeInTheDocument();
  });

  it("shows empty-state message when there are no alerts", () => {
    mockUser = { email: "ham@example.com" };
    renderAlertsPage();
    expect(
      screen.getByText(/no alerts yet/i),
    ).toBeInTheDocument();
  });
});

