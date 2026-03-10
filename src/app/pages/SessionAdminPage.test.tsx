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

// ── Mock useSessionAdmin ──────────────────────────────────────────────────────
let mockIsSessionAdmin = false;
vi.mock("@/app/hooks/useSessionAdmin", () => ({
  useSessionAdmin: () => mockIsSessionAdmin,
}));

// ── Mock child view component ─────────────────────────────────────────────────
vi.mock("@/app/components/SessionAdminView", () => ({
  SessionAdminView: () => <div data-testid="session-admin-view" />,
}));

// Static import — vi.mock calls above are hoisted before this by Vitest
import { SessionAdminPage } from "@/app/pages/SessionAdminPage";

// ── Helper ────────────────────────────────────────────────────────────────────
function renderSessionAdminPage() {
  return render(
    <MemoryRouter>
      <ConferenceProvider>
        <SessionAdminPage />
      </ConferenceProvider>
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("SessionAdminPage (unauthenticated)", () => {
  it("renders without crashing", () => {
    mockUser = null;
    mockLoading = false;
    mockIsSessionAdmin = false;
    expect(() => renderSessionAdminPage()).not.toThrow();
  });

  it("shows 'Sign in required' when not signed in", () => {
    mockUser = null;
    mockLoading = false;
    mockIsSessionAdmin = false;
    renderSessionAdminPage();
    expect(screen.getByText(/sign in required/i)).toBeInTheDocument();
  });

  it("renders a link to the login page when not signed in", () => {
    mockUser = null;
    mockLoading = false;
    mockIsSessionAdmin = false;
    renderSessionAdminPage();
    const loginLink = screen.getByRole("link", { name: /sign in/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("shows a loading indicator while auth is being determined", () => {
    mockUser = null;
    mockLoading = true;
    mockIsSessionAdmin = false;
    renderSessionAdminPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});

describe("SessionAdminPage (authenticated, non-admin)", () => {
  it("shows 'Access Denied' when signed in but not a session admin", () => {
    mockUser = { email: "user@example.com", uid: "uid-1" };
    mockLoading = false;
    mockIsSessionAdmin = false;
    renderSessionAdminPage();
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it("does not render the admin view for a non-admin user", () => {
    mockUser = { email: "user@example.com", uid: "uid-1" };
    mockLoading = false;
    mockIsSessionAdmin = false;
    renderSessionAdminPage();
    expect(screen.queryByTestId("session-admin-view")).not.toBeInTheDocument();
  });
});

describe("SessionAdminPage (authenticated, session-admin)", () => {
  it("renders the Sessions Management heading for an admin", () => {
    mockUser = { email: "admin@example.com", uid: "uid-admin" };
    mockLoading = false;
    mockIsSessionAdmin = true;
    renderSessionAdminPage();
    expect(
      screen.getByRole("heading", { name: /sessions management/i }),
    ).toBeInTheDocument();
  });

  it("renders SessionAdminView for an admin", () => {
    mockUser = { email: "admin@example.com", uid: "uid-admin" };
    mockLoading = false;
    mockIsSessionAdmin = true;
    renderSessionAdminPage();
    expect(screen.getByTestId("session-admin-view")).toBeInTheDocument();
  });
});
