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

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    getDocs: vi.fn().mockResolvedValue({ docs: [] }),
    collection: vi.fn((_db: unknown, path: string) => ({ path })),
    doc: vi.fn(),
    getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
    onSnapshot: vi.fn(() => () => {}),
  };
});

vi.mock("@/app/hooks/useSignupCount", () => ({
  useSignupCount: () => null,
}));

// Static import after mocks are declared (vi.mock is hoisted by Vitest)
import { AttendeesPage } from "@/app/pages/AttendeesPage";
import { AuthProvider } from "@/app/contexts/AuthContext";

function renderAttendeesPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ConferenceProvider>
          <AttendeesPage />
        </ConferenceProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("AttendeesPage (unauthenticated)", () => {
  it("renders without crashing", () => {
    expect(() => renderAttendeesPage()).not.toThrow();
  });

  it("shows the access-denied component when not signed in", async () => {
    renderAttendeesPage();
    // The access-denied section should appear
    const denied = await screen.findByTestId("attendees-access-denied");
    expect(denied).toBeInTheDocument();
  });

  it("shows a link to the profile page in the access-denied message", async () => {
    renderAttendeesPage();
    const profileLinks = await screen.findAllByRole("link", {
      name: /profile page/i,
    });
    expect(profileLinks.length).toBeGreaterThan(0);
    profileLinks.forEach((link) =>
      expect(link).toHaveAttribute("href", "/profile"),
    );
  });

  it("has the Sync button disabled when not signed in", async () => {
    renderAttendeesPage();
    const syncBtn = await screen.findByRole("button", { name: /sync/i });
    expect(syncBtn).toBeDisabled();
  });

  it("has the Visible button disabled when not signed in", async () => {
    renderAttendeesPage();
    const visibleBtn = await screen.findByRole("button", { name: /visible/i });
    expect(visibleBtn).toBeDisabled();
  });
});
