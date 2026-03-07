import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
    sendEmailVerification: vi.fn().mockResolvedValue(undefined),
  };
});

// ── Mock AuthContext ─────────────────────────────────────────────────────────
const mockSignUp = vi.fn();
const mockSignInWithGoogle = vi.fn();
let mockUser: object | null = null;

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
    user: mockUser,
  }),
}));

// Static import — vi.mock calls above are hoisted before this by Vitest
import { SignUpPage } from "@/app/pages/SignUpPage";

// ── Helper ────────────────────────────────────────────────────────────────────
function renderSignUpPage() {
  return render(
    <MemoryRouter>
      <SignUpPage />
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("SignUpPage", () => {
  it("renders the sign-up form by default", () => {
    mockUser = null;
    renderSignUpPage();
    expect(
      screen.getByRole("heading", { name: /sign up/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up$/i }),
    ).toBeInTheDocument();
  });

  it("shows an error when passwords do not match", async () => {
    mockUser = null;
    renderSignUpPage();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
      target: { value: "password1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: "password2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up$/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("shows the confirmation splash after successful sign-up", async () => {
    mockUser = null;
    // signUp resolves successfully; auth.currentUser is null so
    // sendEmailVerification is skipped (avoid dealing with its mock here).
    mockSignUp.mockResolvedValueOnce(undefined);

    renderSignUpPage();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up$/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /account created/i }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /continue to app/i }),
    ).toBeInTheDocument();
    // The sign-up form should no longer be visible
    expect(
      screen.queryByRole("heading", { name: /^sign up$/i }),
    ).not.toBeInTheDocument();
  });

  it("shows an error when sign-up fails", async () => {
    mockUser = null;
    mockSignUp.mockRejectedValueOnce(new Error("email-already-in-use"));

    renderSignUpPage();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "taken@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up$/i }));

    await waitFor(() => {
      expect(screen.getByText(/email-already-in-use/i)).toBeInTheDocument();
    });

    // Splash must NOT be shown on error
    expect(
      screen.queryByRole("heading", { name: /account created/i }),
    ).not.toBeInTheDocument();
  });
});
