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

vi.mock("firebase/functions", () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn(),
}));

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    collection: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
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

// ── Mock useUserAdmin ─────────────────────────────────────────────────────────
let mockIsUserAdmin = false;
vi.mock("@/app/hooks/useUserAdmin", () => ({
  useUserAdmin: () => mockIsUserAdmin,
}));

// Static import — vi.mock calls above are hoisted before this by Vitest
import { UserAdminPage } from "@/app/pages/UserAdminPage";

// ── Helper ────────────────────────────────────────────────────────────────────
function renderUserAdminPage() {
  return render(
    <MemoryRouter>
      <UserAdminPage />
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("UserAdminPage (unauthenticated)", () => {
  it("renders without crashing", () => {
    mockUser = null;
    mockLoading = false;
    mockIsUserAdmin = false;
    expect(() => renderUserAdminPage()).not.toThrow();
  });

  it("shows 'Sign in required' when not signed in", () => {
    mockUser = null;
    mockLoading = false;
    mockIsUserAdmin = false;
    renderUserAdminPage();
    expect(screen.getByText(/sign in required/i)).toBeInTheDocument();
  });

  it("renders a link to the login page when not signed in", () => {
    mockUser = null;
    mockLoading = false;
    mockIsUserAdmin = false;
    renderUserAdminPage();
    const loginLink = screen.getByRole("link", { name: /sign in/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("shows a loading indicator while auth is being determined", () => {
    mockUser = null;
    mockLoading = true;
    mockIsUserAdmin = false;
    renderUserAdminPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});

describe("UserAdminPage (authenticated, non-admin)", () => {
  it("shows 'Access Denied' when signed in but not a user-admin", () => {
    mockUser = { email: "user@example.com", uid: "uid-1" };
    mockLoading = false;
    mockIsUserAdmin = false;
    renderUserAdminPage();
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it("does not render the search form for a non-admin user", () => {
    mockUser = { email: "user@example.com", uid: "uid-1" };
    mockLoading = false;
    mockIsUserAdmin = false;
    renderUserAdminPage();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

describe("UserAdminPage (authenticated, user-admin)", () => {
  it("renders the User Management heading for an admin", () => {
    mockUser = { email: "admin@example.com", uid: "uid-admin" };
    mockLoading = false;
    mockIsUserAdmin = true;
    renderUserAdminPage();
    expect(
      screen.getByRole("heading", { name: /user management/i }),
    ).toBeInTheDocument();
  });

  it("renders the search input for a user-admin", () => {
    mockUser = { email: "admin@example.com", uid: "uid-admin" };
    mockLoading = false;
    mockIsUserAdmin = true;
    renderUserAdminPage();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders the Search button", () => {
    mockUser = { email: "admin@example.com", uid: "uid-admin" };
    mockLoading = false;
    mockIsUserAdmin = true;
    renderUserAdminPage();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });
});
