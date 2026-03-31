import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ── Mock Firebase so AuthContext initialises without credentials ──────────────
vi.mock("@/lib/firebase", () => ({
  default: {},
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

// ── Hoisted mock callable so it can be configured per-test ───────────────────
const mockCallableFn = vi.hoisted(() => vi.fn());

vi.mock("firebase/functions", () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn(() => mockCallableFn),
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
import { UserAdminPage, parseFunctionsError } from "@/app/pages/UserAdminPage";

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

// ── Search interaction tests ───────────────────────────────────────────────────
describe("UserAdminPage (search interactions)", () => {
  beforeEach(() => {
    mockUser = { email: "admin@example.com", uid: "uid-admin" };
    mockLoading = false;
    mockIsUserAdmin = true;
    mockCallableFn.mockReset();
  });

  it("does not call the callable function when the email input is empty", () => {
    renderUserAdminPage();
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(mockCallableFn).not.toHaveBeenCalled();
  });

  it("shows user details after a successful lookup", async () => {
    mockCallableFn.mockResolvedValue({
      data: {
        uid: "uid-found",
        email: "found@example.com",
        displayName: "Found User",
        emailVerified: true,
        creationTime: "2024-01-01T00:00:00Z",
      },
    });
    renderUserAdminPage();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "found@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    await waitFor(() =>
      expect(screen.getByText("uid-found")).toBeInTheDocument(),
    );
    expect(screen.getByText("found@example.com")).toBeInTheDocument();
    expect(screen.getByText("Found User")).toBeInTheDocument();
  });

  it("shows a descriptive error when permission is denied (user-admin document not configured)", async () => {
    const err = Object.assign(
      new Error("Your account does not have user-admin group membership."),
      { code: "functions/permission-denied" },
    );
    mockCallableFn.mockRejectedValue(err);
    renderUserAdminPage();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/groups\/user-admin firestore document/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows a descriptive error when the user is not found", async () => {
    const err = Object.assign(
      new Error("No user found with that email address."),
      { code: "functions/not-found" },
    );
    mockCallableFn.mockRejectedValue(err);
    renderUserAdminPage();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "missing@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/no user found with that email address/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows a descriptive error for an internal server error", async () => {
    const err = Object.assign(new Error("internal"), {
      code: "functions/internal",
    });
    mockCallableFn.mockRejectedValue(err);
    renderUserAdminPage();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/groups\/user-admin.*firestore document may not exist/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows a descriptive error for an invalid-argument error", async () => {
    const err = Object.assign(new Error("targetEmail is required."), {
      code: "functions/invalid-argument",
    });
    mockCallableFn.mockRejectedValue(err);
    renderUserAdminPage();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "bad-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/valid email address/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows a descriptive error for an unauthenticated error", async () => {
    const err = Object.assign(
      new Error("You must be signed in to use this function."),
      { code: "functions/unauthenticated" },
    );
    mockCallableFn.mockRejectedValue(err);
    renderUserAdminPage();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/authentication required/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows a generic error message for an unknown error code", async () => {
    const err = Object.assign(new Error("something unexpected"), {
      code: "functions/unknown",
    });
    mockCallableFn.mockRejectedValue(err);
    renderUserAdminPage();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/failed to look up user/i),
      ).toBeInTheDocument(),
    );
  });
});

// ── parseFunctionsError unit tests ────────────────────────────────────────────
describe("parseFunctionsError", () => {
  it("returns a permission-denied message mentioning the Firestore document", () => {
    const err = Object.assign(new Error("denied"), {
      code: "functions/permission-denied",
    });
    expect(parseFunctionsError(err)).toMatch(/groups\/user-admin/i);
  });

  it("returns a not-found message for functions/not-found", () => {
    const err = Object.assign(new Error("not found"), {
      code: "functions/not-found",
    });
    expect(parseFunctionsError(err)).toMatch(/no user found/i);
  });

  it("returns an invalid-argument message for functions/invalid-argument", () => {
    const err = Object.assign(new Error("bad arg"), {
      code: "functions/invalid-argument",
    });
    expect(parseFunctionsError(err)).toMatch(/valid email address/i);
  });

  it("returns an unauthenticated message for functions/unauthenticated", () => {
    const err = Object.assign(new Error("unauth"), {
      code: "functions/unauthenticated",
    });
    expect(parseFunctionsError(err)).toMatch(/authentication required/i);
  });

  it("returns an internal error message mentioning the Firestore document for functions/internal", () => {
    const err = Object.assign(new Error("internal"), {
      code: "functions/internal",
    });
    const msg = parseFunctionsError(err);
    expect(msg).toMatch(/internal server error/i);
    expect(msg).toMatch(/groups\/user-admin/i);
  });

  it("falls back to the error message for an unknown code", () => {
    const err = Object.assign(new Error("weird error"), {
      code: "functions/deadline-exceeded",
    });
    expect(parseFunctionsError(err, "do the thing")).toMatch(
      /failed to do the thing: weird error/i,
    );
  });

  it("falls back gracefully for non-Error objects", () => {
    expect(parseFunctionsError("string error", "run")).toMatch(
      /failed to run/i,
    );
  });

  it("falls back gracefully for null/undefined", () => {
    expect(parseFunctionsError(null, "run")).toMatch(/failed to run/i);
    expect(parseFunctionsError(undefined, "run")).toMatch(/failed to run/i);
  });
});
