import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ConferenceProvider } from "@/app/contexts/ConferenceContext";

// ── Mock Firebase auth so AuthContext initialises without credentials ─────────
vi.mock("@/lib/firebase", () => ({
  auth: { onAuthStateChanged: vi.fn((_a, cb) => { cb(null); return () => {}; }) },
  db: {},
  storage: {},
}));

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...actual,
    getAuth: vi.fn(() => ({ currentUser: null })),
    onAuthStateChanged: vi.fn((_a, cb) => { (cb as (u: null) => void)(null); return () => {}; }),
    sendEmailVerification: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
  };
});

// ── Stub out the prize-admin glob import so it doesn't break in test env ──────
vi.mock("@/app/hooks/usePrizesAdmin", () => ({
  usePrizesAdmin: () => false,
}));

// Static import after mocks are declared (vi.mock is hoisted by Vitest)
import { ProfilePage } from "@/app/pages/ProfilePage";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { ThemeProvider } from "@/app/contexts/ThemeContext";

// ── Helper ────────────────────────────────────────────────────────────────────
function renderProfilePage() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <ConferenceProvider>
            <ProfilePage />
          </ConferenceProvider>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("ProfilePage (unauthenticated)", () => {
  it("renders without crashing", () => {
    expect(() => renderProfilePage()).not.toThrow();
  });

  it("shows the sign-in prompt when not logged in", () => {
    renderProfilePage();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it("shows the account features heading", () => {
    renderProfilePage();
    expect(screen.getByText(/account features/i)).toBeInTheDocument();
  });
});
