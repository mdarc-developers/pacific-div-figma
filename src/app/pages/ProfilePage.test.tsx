import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ConferenceProvider } from "@/app/contexts/ConferenceContext";

// ── Mock Firebase auth so AuthContext initialises without credentials ─────────
vi.mock("@/lib/firebase", () => ({
  auth: {
    onAuthStateChanged: vi.fn((_a, cb) => {
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
    onAuthStateChanged: vi.fn((_a, cb) => {
      (cb as (u: null) => void)(null);
      return () => {};
    }),
    sendEmailVerification: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    signInWithPopup: vi.fn(),
    // getRedirectResult is a browser-only API that throws
    // auth/operation-not-supported-in-this-environment in Node.js.
    // Stub it out so AuthProvider's mount effect resolves cleanly.
    getRedirectResult: vi.fn().mockResolvedValue(null),
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
import { BookmarkProvider } from "@/app/contexts/BookmarkContext";
import { ExhibitorBookmarkProvider } from "@/app/contexts/ExhibitorBookmarkContext";
import { BookmarkCountsProvider } from "@/app/contexts/BookmarkCountsContext";
import { VoteProvider } from "@/app/contexts/VoteContext";
import { ExhibitorVoteProvider } from "@/app/contexts/ExhibitorVoteContext";
import { VoteCountsProvider } from "@/app/contexts/VoteCountsContext";
import { NotesProvider } from "@/app/contexts/NotesContext";
import { ExhibitorNotesProvider } from "@/app/contexts/ExhibitorNotesContext";
import { ActivitySectionsProvider } from "@/app/contexts/ActivitySectionsContext";
import { AttendanceProvider } from "@/app/contexts/AttendanceContext";

// ── Helper ────────────────────────────────────────────────────────────────────
function renderProfilePage() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <ConferenceProvider>
            <BookmarkProvider>
              <ExhibitorBookmarkProvider>
                <BookmarkCountsProvider>
                  <VoteProvider>
                    <ExhibitorVoteProvider>
                      <VoteCountsProvider>
                        <NotesProvider>
                          <ExhibitorNotesProvider>
                            <ActivitySectionsProvider>
                              <AttendanceProvider>
                                <ProfilePage />
                              </AttendanceProvider>
                            </ActivitySectionsProvider>
                          </ExhibitorNotesProvider>
                        </NotesProvider>
                      </VoteCountsProvider>
                    </ExhibitorVoteProvider>
                  </VoteProvider>
                </BookmarkCountsProvider>
              </ExhibitorBookmarkProvider>
            </BookmarkProvider>
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
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows the account features heading", () => {
    renderProfilePage();
    expect(screen.getByText(/account features/i)).toBeInTheDocument();
  });

  it("shows the Sign In with Google button when not logged in", () => {
    renderProfilePage();
    expect(
      screen.getByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument();
  });
});
