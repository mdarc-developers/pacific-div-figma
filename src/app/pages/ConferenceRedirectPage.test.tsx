import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Conference } from "@/types/conference";
import {
  isUpcomingOrCurrent,
  findNextConferenceBySlug,
} from "@/app/pages/ConferenceRedirectPage";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a minimal Conference fixture for testing. */
function makeConference(
  id: string,
  startDate: string,
  endDate: string,
): Conference {
  return {
    id,
    name: id,
    startDate,
    endDate,
    timezone: "America/Los_Angeles",
    timezoneNumeric: "-0700",
    primaryColor: "#000",
    secondaryColor: "#000",
    location: "Test Location",
    venue: "Test Venue",
    conferenceWebsite: "",
    venuePhone: "",
    venueGPS: "",
    venueGridSquare: "",
    venueWebsite: "",
    parkingWebsite: "",
    icalUrl: "",
    googlecalUrl: "",
    contactEmail: "",
    logoUrl: "",
  };
}

// ── isUpcomingOrCurrent ───────────────────────────────────────────────────────

describe("isUpcomingOrCurrent", () => {
  const FIXED_NOW = new Date("2026-03-06T00:00:00-0700");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true when the conference ends in the future", () => {
    const conf = makeConference("future-conf", "2026-10-16", "2026-10-18");
    expect(isUpcomingOrCurrent(conf)).toBe(true);
  });

  it("returns true when the conference is currently ongoing", () => {
    const conf = makeConference("current-conf", "2026-03-05", "2026-03-08");
    expect(isUpcomingOrCurrent(conf)).toBe(true);
  });

  it("returns false when the conference ended in the past", () => {
    const conf = makeConference("past-conf", "2026-01-01", "2026-01-03");
    expect(isUpcomingOrCurrent(conf)).toBe(false);
  });
});

// ── findNextConferenceBySlug ──────────────────────────────────────────────────

describe("findNextConferenceBySlug", () => {
  const FIXED_NOW = new Date("2026-03-06T00:00:00-0700");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const pastPacificon = makeConference("pacificon-2025", "2025-10-17", "2025-10-19");
  const nextPacificon = makeConference("pacificon-2026", "2026-10-16", "2026-10-18");
  const futurePacificon = makeConference("pacificon-2027", "2027-10-15", "2027-10-17");
  const unrelated = makeConference("hamvention-2026", "2026-05-15", "2026-05-17");

  const allConfs = [pastPacificon, nextPacificon, futurePacificon, unrelated];

  it("returns the nearest upcoming conference matching the slug", () => {
    const result = findNextConferenceBySlug(allConfs, "pacificon");
    expect(result?.id).toBe("pacificon-2026");
  });

  it("excludes past conferences", () => {
    const result = findNextConferenceBySlug(allConfs, "pacificon");
    expect(result?.id).not.toBe("pacificon-2025");
  });

  it("is case-insensitive for the slug", () => {
    const result = findNextConferenceBySlug(allConfs, "PACIFICON");
    expect(result?.id).toBe("pacificon-2026");
  });

  it("returns undefined when no conferences match the slug", () => {
    const result = findNextConferenceBySlug(allConfs, "seapac");
    expect(result).toBeUndefined();
  });

  it("returns undefined when all matching conferences are in the past", () => {
    const result = findNextConferenceBySlug([pastPacificon], "pacificon");
    expect(result).toBeUndefined();
  });

  it("does not return unrelated conferences", () => {
    const result = findNextConferenceBySlug(allConfs, "pacificon");
    expect(result?.id).not.toBe("hamvention-2026");
  });

  it("returns undefined for an empty slug match", () => {
    const result = findNextConferenceBySlug(allConfs, "xyz-unknown");
    expect(result).toBeUndefined();
  });
});

// ── ConferenceRedirectPage component ─────────────────────────────────────────

// Mock firebase so AuthContext / ThemeSync don't blow up in tests
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

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { ConferenceRedirectPage } from "@/app/pages/ConferenceRedirectPage";
import { ConferenceProvider } from "@/app/contexts/ConferenceContext";

function renderWithSlug(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/${slug}`]}>
      <ConferenceProvider>
        <Routes>
          <Route path="/:conferenceSlug" element={<ConferenceRedirectPage />} />
        </Routes>
      </ConferenceProvider>
    </MemoryRouter>,
  );
}

describe("ConferenceRedirectPage component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it("renders nothing visible", () => {
    const { container } = renderWithSlug("pacificon");
    expect(container.firstChild).toBeNull();
  });

  it("redirects to /schedule", () => {
    renderWithSlug("pacificon");
    expect(mockNavigate).toHaveBeenCalledWith("/schedule", { replace: true });
  });

  it("persists selected conference to localStorage for matching slug", () => {
    renderWithSlug("pacificon");
    const stored = localStorage.getItem("activeConference");
    // The stored value should be a Pacificon conference id (starts with 'pacificon')
    expect(stored?.startsWith("pacificon")).toBe(true);
  });

  it("still redirects to /schedule for an unknown slug", () => {
    renderWithSlug("unknownconference");
    expect(mockNavigate).toHaveBeenCalledWith("/schedule", { replace: true });
  });
});
