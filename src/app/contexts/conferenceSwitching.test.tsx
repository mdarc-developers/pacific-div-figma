import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { Conference, PrizeWinner } from "@/types/conference";

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

// ── Mock AuthContext — no logged-in user (localStorage-only behaviour) ────────
vi.mock("@/app/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

// ── Mock Firestore service — not called when user is null ─────────────────────
vi.mock("@/services/userSettingsService", () => ({
  getUserRaffleTickets: vi.fn().mockResolvedValue([]),
  setUserRaffleTickets: vi.fn().mockResolvedValue(undefined),
}));

// Static imports must come after vi.mock() calls (Vitest hoists mocks)
import {
  ConferenceProvider,
  useConference,
} from "@/app/contexts/ConferenceContext";
import {
  BookmarkProvider,
  useBookmarkContext,
} from "@/app/contexts/BookmarkContext";
import {
  ExhibitorBookmarkProvider,
  useExhibitorBookmarkContext,
} from "@/app/contexts/ExhibitorBookmarkContext";
import {
  SessionVoteProvider,
  useSessionVoteContext,
} from "@/app/contexts/SessionVoteContext";
import {
  ExhibitorVoteProvider,
  useExhibitorVoteContext,
} from "@/app/contexts/ExhibitorVoteContext";
import { NotesProvider, useNotesContext } from "@/app/contexts/NotesContext";
import {
  ExhibitorNotesProvider,
  useExhibitorNotesContext,
} from "@/app/contexts/ExhibitorNotesContext";
import { useRaffleTickets } from "@/app/hooks/useRaffleTickets";
import { allConferences } from "@/data/all-conferences";

// ── Conference IDs used in tests ──────────────────────────────────────────────
const CONF_A_ID = "hamvention-2026"; // default / first conference
const CONF_B_ID = "seapac-2026"; // second conference to switch to

// ── Sample prize winners used to verify "prizes won" changes with conference ──
const SAMPLE_PRIZE_WINNERS: PrizeWinner[] = [
  { id: "w1", prizeId: ["p1"], winningTicket: "1001" }, // matched by DATA_A tickets
  { id: "w2", prizeId: ["p2"], winningTicket: "2001" }, // matched by DATA_B tickets
];

// ── Per-conference test data ──────────────────────────────────────────────────

/** Data pre-seeded in localStorage for conference A. */
const DATA_A = {
  raffleTickets: ["1001", "1002"],
  bookmarks: ["session-a1", "session-a2"],
  exhibitorBookmarks: ["exhibitor-a1"],
  sessionVotes: ["session-a3"],
  exhibitorVotes: ["exhibitor-a4"],
  sessionNotes: { "session-a5": "Note for session A5" } as Record<
    string,
    string
  >,
  exhibitorNotes: { "exhibitor-a6": "Note for exhibitor A6" } as Record<
    string,
    string
  >,
};

/** Data pre-seeded in localStorage for conference B. */
const DATA_B = {
  raffleTickets: ["2001"],
  bookmarks: ["session-b1"],
  exhibitorBookmarks: ["exhibitor-b1", "exhibitor-b2"],
  sessionVotes: ["session-b3", "session-b4"],
  exhibitorVotes: ["exhibitor-b5"],
  sessionNotes: {} as Record<string, string>,
  exhibitorNotes: { "exhibitor-b7": "Note for exhibitor B7" } as Record<
    string,
    string
  >,
};

// ── Helper: compute prizes won from raffle tickets ────────────────────────────
/** Returns prize winners whose winning ticket appears in raffleTickets. */
function computePrizesWon(
  raffleTickets: string[],
  prizeWinners: PrizeWinner[],
): PrizeWinner[] {
  const ticketSet = new Set(raffleTickets);
  return prizeWinners.filter((pw) => ticketSet.has(pw.winningTicket));
}

// ── Wrapper: all conference-specific context providers ────────────────────────
function AllContextsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConferenceProvider>
      <BookmarkProvider>
        <ExhibitorBookmarkProvider>
          <SessionVoteProvider>
            <ExhibitorVoteProvider>
              <NotesProvider>
                <ExhibitorNotesProvider>{children}</ExhibitorNotesProvider>
              </NotesProvider>
            </ExhibitorVoteProvider>
          </SessionVoteProvider>
        </ExhibitorBookmarkProvider>
      </BookmarkProvider>
    </ConferenceProvider>
  );
}

// ── Composite hook: all conference-specific state in one place ────────────────
function useAllConferenceData() {
  const { activeConference, setActiveConference } = useConference();
  const { bookmarkedItems } = useBookmarkContext();
  const { bookmarkedExhibitors } = useExhibitorBookmarkContext();
  const { votedSessions } = useSessionVoteContext();
  const { votedExhibitors } = useExhibitorVoteContext();
  const { notes: sessionNotes } = useNotesContext();
  const { notes: exhibitorNotes } = useExhibitorNotesContext();
  const [raffleTickets] = useRaffleTickets(activeConference.id);

  return {
    activeConference,
    setActiveConference,
    bookmarkedItems,
    bookmarkedExhibitors,
    votedSessions,
    votedExhibitors,
    sessionNotes,
    exhibitorNotes,
    raffleTickets,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("Conference switching", () => {
  beforeEach(() => {
    localStorage.clear();

    // Start with conference A as the active conference
    localStorage.setItem("activeConference", CONF_A_ID);

    // Seed conference A data into localStorage
    localStorage.setItem(
      `raffle_tickets_${CONF_A_ID}`,
      JSON.stringify(DATA_A.raffleTickets),
    );
    localStorage.setItem(
      `bookmarks_${CONF_A_ID}`,
      JSON.stringify(DATA_A.bookmarks),
    );
    localStorage.setItem(
      `exhibitor_bookmarks_${CONF_A_ID}`,
      JSON.stringify(DATA_A.exhibitorBookmarks),
    );
    localStorage.setItem(
      `session_votes_${CONF_A_ID}`,
      JSON.stringify(DATA_A.sessionVotes),
    );
    localStorage.setItem(
      `exhibitor_votes_${CONF_A_ID}`,
      JSON.stringify(DATA_A.exhibitorVotes),
    );
    localStorage.setItem(
      `notes_${CONF_A_ID}`,
      JSON.stringify(DATA_A.sessionNotes),
    );
    localStorage.setItem(
      `exhibitor_notes_${CONF_A_ID}`,
      JSON.stringify(DATA_A.exhibitorNotes),
    );

    // Seed conference B data into localStorage
    localStorage.setItem(
      `raffle_tickets_${CONF_B_ID}`,
      JSON.stringify(DATA_B.raffleTickets),
    );
    localStorage.setItem(
      `bookmarks_${CONF_B_ID}`,
      JSON.stringify(DATA_B.bookmarks),
    );
    localStorage.setItem(
      `exhibitor_bookmarks_${CONF_B_ID}`,
      JSON.stringify(DATA_B.exhibitorBookmarks),
    );
    localStorage.setItem(
      `session_votes_${CONF_B_ID}`,
      JSON.stringify(DATA_B.sessionVotes),
    );
    localStorage.setItem(
      `exhibitor_votes_${CONF_B_ID}`,
      JSON.stringify(DATA_B.exhibitorVotes),
    );
    localStorage.setItem(
      `notes_${CONF_B_ID}`,
      JSON.stringify(DATA_B.sessionNotes),
    );
    localStorage.setItem(
      `exhibitor_notes_${CONF_B_ID}`,
      JSON.stringify(DATA_B.exhibitorNotes),
    );

    // Seed an account-level preference (not conference-specific)
    localStorage.setItem("theme", "dark");
  });

  it("loads conference A data correctly on initial render", () => {
    const { result } = renderHook(() => useAllConferenceData(), {
      wrapper: AllContextsWrapper,
    });

    expect(result.current.activeConference.id).toBe(CONF_A_ID);
    expect(result.current.raffleTickets).toEqual(DATA_A.raffleTickets);
    expect(result.current.bookmarkedItems).toEqual(DATA_A.bookmarks);
    expect(result.current.bookmarkedExhibitors).toEqual(
      DATA_A.exhibitorBookmarks,
    );
    expect(result.current.votedSessions).toEqual(DATA_A.sessionVotes);
    expect(result.current.votedExhibitors).toEqual(DATA_A.exhibitorVotes);
    expect(result.current.sessionNotes).toEqual(DATA_A.sessionNotes);
    expect(result.current.exhibitorNotes).toEqual(DATA_A.exhibitorNotes);
  });

  it("loads conference B data for all conference-related values after switching", () => {
    const { result } = renderHook(() => useAllConferenceData(), {
      wrapper: AllContextsWrapper,
    });

    const confB = allConferences.find((c) => c.id === CONF_B_ID) as Conference;
    act(() => {
      result.current.setActiveConference(confB);
    });

    expect(result.current.activeConference.id).toBe(CONF_B_ID);
    expect(result.current.raffleTickets).toEqual(DATA_B.raffleTickets);
    expect(result.current.bookmarkedItems).toEqual(DATA_B.bookmarks);
    expect(result.current.bookmarkedExhibitors).toEqual(
      DATA_B.exhibitorBookmarks,
    );
    expect(result.current.votedSessions).toEqual(DATA_B.sessionVotes);
    expect(result.current.votedExhibitors).toEqual(DATA_B.exhibitorVotes);
    expect(result.current.sessionNotes).toEqual(DATA_B.sessionNotes);
    expect(result.current.exhibitorNotes).toEqual(DATA_B.exhibitorNotes);
  });

  it("prizes won change when switching conferences (derived from raffle tickets × prize winners)", () => {
    const { result } = renderHook(() => useAllConferenceData(), {
      wrapper: AllContextsWrapper,
    });

    // Conference A: ticket 1001 matches winner w1
    const prizesWonA = computePrizesWon(
      result.current.raffleTickets,
      SAMPLE_PRIZE_WINNERS,
    );
    expect(prizesWonA).toHaveLength(1);
    expect(prizesWonA[0].winningTicket).toBe("1001");

    // Switch to conference B
    const confB = allConferences.find((c) => c.id === CONF_B_ID) as Conference;
    act(() => {
      result.current.setActiveConference(confB);
    });

    // Conference B: ticket 2001 matches winner w2
    const prizesWonB = computePrizesWon(
      result.current.raffleTickets,
      SAMPLE_PRIZE_WINNERS,
    );
    expect(prizesWonB).toHaveLength(1);
    expect(prizesWonB[0].winningTicket).toBe("2001");

    // The two prize sets must differ
    expect(prizesWonA).not.toEqual(prizesWonB);
  });

  it("account-level values (theme) are not affected by switching conferences", () => {
    const { result } = renderHook(() => useAllConferenceData(), {
      wrapper: AllContextsWrapper,
    });

    const themeBefore = localStorage.getItem("theme");

    const confB = allConferences.find((c) => c.id === CONF_B_ID) as Conference;
    act(() => {
      result.current.setActiveConference(confB);
    });

    // Theme must remain unchanged after conference switch
    expect(localStorage.getItem("theme")).toBe(themeBefore);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("conference A data is preserved in localStorage after switching to conference B", () => {
    const { result } = renderHook(() => useAllConferenceData(), {
      wrapper: AllContextsWrapper,
    });

    const confB = allConferences.find((c) => c.id === CONF_B_ID) as Conference;
    act(() => {
      result.current.setActiveConference(confB);
    });

    // All conference A localStorage entries must still be intact
    expect(
      JSON.parse(localStorage.getItem(`raffle_tickets_${CONF_A_ID}`)!),
    ).toEqual(DATA_A.raffleTickets);
    expect(JSON.parse(localStorage.getItem(`bookmarks_${CONF_A_ID}`)!)).toEqual(
      DATA_A.bookmarks,
    );
    expect(
      JSON.parse(localStorage.getItem(`exhibitor_bookmarks_${CONF_A_ID}`)!),
    ).toEqual(DATA_A.exhibitorBookmarks);
    expect(
      JSON.parse(localStorage.getItem(`session_votes_${CONF_A_ID}`)!),
    ).toEqual(DATA_A.sessionVotes);
    expect(
      JSON.parse(localStorage.getItem(`exhibitor_votes_${CONF_A_ID}`)!),
    ).toEqual(DATA_A.exhibitorVotes);
    expect(JSON.parse(localStorage.getItem(`notes_${CONF_A_ID}`)!)).toEqual(
      DATA_A.sessionNotes,
    );
    expect(
      JSON.parse(localStorage.getItem(`exhibitor_notes_${CONF_A_ID}`)!),
    ).toEqual(DATA_A.exhibitorNotes);
  });
});
