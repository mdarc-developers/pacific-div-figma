import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ConferenceProvider } from "@/app/contexts/ConferenceContext";

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
type MockUser = { email: string; uid: string } | null;
let mockUser: MockUser = null;
let mockLoading = false;

vi.mock("@/app/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    loading: mockLoading,
  }),
}));

// ── Mock useExhibitorAdmin ────────────────────────────────────────────────────
let mockIsExhibitorAdmin = false;
vi.mock("@/app/hooks/useExhibitorAdmin", () => ({
  useExhibitorAdmin: () => mockIsExhibitorAdmin,
}));

// ── Mock child view component ─────────────────────────────────────────────────
vi.mock("@/app/components/ExhibitorAdminView", () => ({
  ExhibitorAdminView: () => <div data-testid="exhibitor-admin-view" />,
}));

// Static import — vi.mock calls above are hoisted before this by Vitest
import { ExhibitorAdminPage } from "@/app/pages/ExhibitorAdminPage";

// ── Helper ────────────────────────────────────────────────────────────────────
function renderExhibitorAdminPage() {
  return render(
    <MemoryRouter>
      <ConferenceProvider>
        <ExhibitorAdminPage />
      </ConferenceProvider>
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("ExhibitorAdminPage (unauthenticated)", () => {
  it("renders without crashing", () => {
    mockUser = null;
    mockLoading = false;
    mockIsExhibitorAdmin = false;
    expect(() => renderExhibitorAdminPage()).not.toThrow();
  });

  it("shows 'Sign in required' when not signed in", () => {
    mockUser = null;
    mockLoading = false;
    mockIsExhibitorAdmin = false;
    renderExhibitorAdminPage();
    expect(screen.getByText(/sign in required/i)).toBeInTheDocument();
  });

  it("renders a link to the login page when not signed in", () => {
    mockUser = null;
    mockLoading = false;
    mockIsExhibitorAdmin = false;
    renderExhibitorAdminPage();
    const loginLink = screen.getByRole("link", { name: /sign in/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("shows a loading indicator while auth is being determined", () => {
    mockUser = null;
    mockLoading = true;
    mockIsExhibitorAdmin = false;
    renderExhibitorAdminPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});

describe("ExhibitorAdminPage (authenticated, non-admin)", () => {
  it("shows 'Access Denied' when signed in but not an exhibitor admin", () => {
    mockUser = { email: "user@example.com", uid: "uid-1" };
    mockLoading = false;
    mockIsExhibitorAdmin = false;
    renderExhibitorAdminPage();
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it("does not render the admin view for a non-admin user", () => {
    mockUser = { email: "user@example.com", uid: "uid-1" };
    mockLoading = false;
    mockIsExhibitorAdmin = false;
    renderExhibitorAdminPage();
    expect(
      screen.queryByTestId("exhibitor-admin-view"),
    ).not.toBeInTheDocument();
  });
});

describe("ExhibitorAdminPage (authenticated, exhibitor-admin)", () => {
  it("renders the Exhibitors Management heading for an admin", () => {
    mockUser = { email: "admin@example.com", uid: "uid-admin" };
    mockLoading = false;
    mockIsExhibitorAdmin = true;
    renderExhibitorAdminPage();
    expect(
      screen.getByRole("heading", { name: /exhibitors management/i }),
    ).toBeInTheDocument();
  });

  it("renders ExhibitorAdminView for an admin", () => {
    mockUser = { email: "admin@example.com", uid: "uid-admin" };
    mockLoading = false;
    mockIsExhibitorAdmin = true;
    renderExhibitorAdminPage();
    expect(screen.getByTestId("exhibitor-admin-view")).toBeInTheDocument();
  });
});
