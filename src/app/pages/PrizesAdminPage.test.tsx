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

// ── Mock usePrizesAdmin ───────────────────────────────────────────────────────
let mockIsPrizesAdmin = false;
vi.mock("@/app/hooks/usePrizesAdmin", () => ({
  usePrizesAdmin: () => mockIsPrizesAdmin,
}));

// ── Mock child view components ────────────────────────────────────────────────
vi.mock("@/app/components/PrizesAdminView", () => ({
  PrizesAdminView: () => <div data-testid="prizes-admin-view" />,
}));

vi.mock("@/app/components/PrizesImageView", () => ({
  PrizesImageView: () => <div data-testid="prizes-image-view" />,
}));

// Static import — vi.mock calls above are hoisted before this by Vitest
import { PrizesAdminPage } from "@/app/pages/PrizesAdminPage";

// ── Helper ────────────────────────────────────────────────────────────────────
function renderPrizesAdminPage() {
  return render(
    <MemoryRouter>
      <ConferenceProvider>
        <PrizesAdminPage />
      </ConferenceProvider>
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("PrizesAdminPage (unauthenticated)", () => {
  it("renders without crashing", () => {
    mockUser = null;
    mockLoading = false;
    mockIsPrizesAdmin = false;
    expect(() => renderPrizesAdminPage()).not.toThrow();
  });

  it("shows 'Sign in required' when not signed in", () => {
    mockUser = null;
    mockLoading = false;
    mockIsPrizesAdmin = false;
    renderPrizesAdminPage();
    expect(screen.getByText(/sign in required/i)).toBeInTheDocument();
  });

  it("renders a link to the login page when not signed in", () => {
    mockUser = null;
    mockLoading = false;
    mockIsPrizesAdmin = false;
    renderPrizesAdminPage();
    const loginLink = screen.getByRole("link", { name: /sign in/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("shows a loading indicator while auth is being determined", () => {
    mockUser = null;
    mockLoading = true;
    mockIsPrizesAdmin = false;
    renderPrizesAdminPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});

describe("PrizesAdminPage (authenticated, non-admin)", () => {
  it("shows 'Access Denied' when signed in but not a prizes admin", () => {
    mockUser = { email: "user@example.com", uid: "uid-1" };
    mockLoading = false;
    mockIsPrizesAdmin = false;
    renderPrizesAdminPage();
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it("does not render the admin view for a non-admin user", () => {
    mockUser = { email: "user@example.com", uid: "uid-1" };
    mockLoading = false;
    mockIsPrizesAdmin = false;
    renderPrizesAdminPage();
    expect(
      screen.queryByTestId("prizes-admin-view"),
    ).not.toBeInTheDocument();
  });
});

describe("PrizesAdminPage (authenticated, prizes-admin)", () => {
  it("renders the Prizes Management heading for an admin", () => {
    mockUser = { email: "admin@example.com", uid: "uid-admin" };
    mockLoading = false;
    mockIsPrizesAdmin = true;
    renderPrizesAdminPage();
    expect(
      screen.getByRole("heading", { name: /prizes management/i }),
    ).toBeInTheDocument();
  });

  it("renders PrizesAdminView for an admin", () => {
    mockUser = { email: "admin@example.com", uid: "uid-admin" };
    mockLoading = false;
    mockIsPrizesAdmin = true;
    renderPrizesAdminPage();
    expect(screen.getByTestId("prizes-admin-view")).toBeInTheDocument();
  });
});
