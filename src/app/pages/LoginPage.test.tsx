import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ── Mock Firebase so AuthContext initialises without real credentials ──────────
vi.mock("@/lib/firebase", () => ({
  auth: {
    onAuthStateChanged: vi.fn((_a, cb) => {
      cb(null);
      return () => {};
    }),
    currentUser: null,
  },
  db: {},
  storage: {},
}));

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...actual,
    onAuthStateChanged: vi.fn((_a, cb) => {
      (cb as (u: null) => void)(null);
      return () => {};
    }),
  };
});

// ── Mock AuthContext ─────────────────────────────────────────────────────────
const mockSignIn = vi.fn();
const mockSignInWithGoogle = vi.fn();
let mockUser: object | null = null;

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signInWithGoogle: mockSignInWithGoogle,
    user: mockUser,
  }),
}));

// Static import — vi.mock calls above are hoisted before this by Vitest
import { LoginPage } from "@/app/pages/LoginPage";

// ── Helper ────────────────────────────────────────────────────────────────────
function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("LoginPage", () => {
  beforeEach(() => {
    mockUser = null;
    mockSignIn.mockReset();
    mockSignInWithGoogle.mockReset();
  });

  it("renders the login form", () => {
    renderLoginPage();
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in$/i }),
    ).toBeInTheDocument();
  });

  it("renders the Google sign-in button", () => {
    renderLoginPage();
    expect(
      screen.getByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument();
  });

  it("renders a link to the sign-up page", () => {
    renderLoginPage();
    const signUpLink = screen.getByRole("link", { name: /sign up now/i });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute("href", "/signup");
  });

  it("calls signIn with the entered email and password on form submit", async () => {
    mockSignIn.mockResolvedValueOnce(undefined);
    renderLoginPage();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in$/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("user@example.com", "secret123");
    });
  });

  it("shows an error message when sign-in fails", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("Invalid credentials"));
    renderLoginPage();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "bad@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("calls signInWithGoogle when the Google button is clicked", async () => {
    mockSignInWithGoogle.mockResolvedValueOnce(undefined);
    renderLoginPage();

    fireEvent.click(
      screen.getByRole("button", { name: /sign in with google/i }),
    );

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });

  it("shows an error when Google sign-in fails", async () => {
    mockSignInWithGoogle.mockRejectedValueOnce(
      new Error("Google sign-in failed"),
    );
    renderLoginPage();

    fireEvent.click(
      screen.getByRole("button", { name: /sign in with google/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/google sign-in failed/i)).toBeInTheDocument();
    });
  });

  it("disables buttons while sign-in is in progress", async () => {
    let resolveSignIn!: () => void;
    mockSignIn.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveSignIn = resolve;
      }),
    );
    renderLoginPage();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in$/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /signing in/i }),
      ).toBeDisabled();
    });

    await act(async () => {
      resolveSignIn();
    });
  });
});
