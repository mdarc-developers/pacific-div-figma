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

// ── Mock useMoreAdmin ─────────────────────────────────────────────────────────
let mockIsMoreAdmin = false;
vi.mock("@/app/hooks/useMoreAdmin", () => ({
  useMoreAdmin: () => mockIsMoreAdmin,
}));

// Static import — vi.mock calls above are hoisted before this by Vitest
import { MoreAdminPage } from "@/app/pages/MoreAdminPage";

// ── Helper ────────────────────────────────────────────────────────────────────
function renderMoreAdminPage() {
  return render(
    <MemoryRouter>
      <ConferenceProvider>
        <MoreAdminPage />
      </ConferenceProvider>
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("MoreAdminPage (unauthenticated)", () => {
  it("renders without crashing", () => {
    mockUser = null;
    mockLoading = false;
    mockIsMoreAdmin = false;
    expect(() => renderMoreAdminPage()).not.toThrow();
  });

  it("shows 'Sign in required' when not signed in", () => {
    mockUser = null;
    mockLoading = false;
    mockIsMoreAdmin = false;
    renderMoreAdminPage();
    expect(screen.getByText(/sign in required/i)).toBeInTheDocument();
  });

  it("renders a link to the login page when not signed in", () => {
    mockUser = null;
    mockLoading = false;
    mockIsMoreAdmin = false;
    renderMoreAdminPage();
    const loginLink = screen.getByRole("link", { name: /sign in/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("shows a loading indicator while auth is being determined", () => {
    mockUser = null;
    mockLoading = true;
    mockIsMoreAdmin = false;
    renderMoreAdminPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});

describe("MoreAdminPage (authenticated, non-admin)", () => {
  it("shows 'Access Denied' when signed in but not a more-admin", () => {
    mockUser = { email: "user@example.com", uid: "uid-1" };
    mockLoading = false;
    mockIsMoreAdmin = false;
    renderMoreAdminPage();
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it("does not render the management heading for a non-admin user", () => {
    mockUser = { email: "user@example.com", uid: "uid-1" };
    mockLoading = false;
    mockIsMoreAdmin = false;
    renderMoreAdminPage();
    expect(
      screen.queryByRole("heading", { name: /more management/i }),
    ).not.toBeInTheDocument();
  });
});

describe("MoreAdminPage (authenticated, more-admin)", () => {
  it("renders the More Management heading for an admin", () => {
    mockUser = { email: "admin@example.com", uid: "uid-admin" };
    mockLoading = false;
    mockIsMoreAdmin = true;
    renderMoreAdminPage();
    expect(
      screen.getByRole("heading", { name: /more management/i }),
    ).toBeInTheDocument();
  });

  it("renders the additional tools description for an admin", () => {
    mockUser = { email: "admin@example.com", uid: "uid-admin" };
    mockLoading = false;
    mockIsMoreAdmin = true;
    renderMoreAdminPage();
    expect(
      screen.getByText(/additional conference management tools/i),
    ).toBeInTheDocument();
  });
});
