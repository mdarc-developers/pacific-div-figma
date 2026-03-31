import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
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

vi.mock("firebase/functions", () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn(() => vi.fn()),
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

vi.mock("@/app/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

vi.mock("@/app/hooks/useUserAdmin", () => ({
  useUserAdmin: () => false,
}));

import { UserAdminPage } from "@/app/pages/UserAdminPage";

describe("UserAdminPage", () => {
  it("renders without crashing (delegates to UserAdminSearch)", () => {
    expect(() =>
      render(
        <MemoryRouter>
          <UserAdminPage />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });
});
