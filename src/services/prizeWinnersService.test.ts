import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: {},
  storage: {},
}));

const mockSetDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockDoc = vi.fn((_db: unknown, col: string, id: string) => ({
  path: `${col}/${id}`,
}));

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    setDoc: (...args: unknown[]) => mockSetDoc(...args),
    deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
    doc: (...args: unknown[]) => mockDoc(...args),
  };
});

import {
  savePrizeWinnerToFirestore,
  deletePrizeWinnerFromFirestore,
} from "@/services/prizeWinnersService";
import { type PrizeWinner } from "@/types/conference";

beforeEach(() => {
  vi.clearAllMocks();
  mockSetDoc.mockResolvedValue(undefined);
  mockDeleteDoc.mockResolvedValue(undefined);
});

const makeWinner = (overrides: Partial<PrizeWinner> = {}): PrizeWinner => ({
  id: "winner-123",
  prizeId: ["p1"],
  winningTicket: "1001",
  conferenceId: "conf-2026",
  ...overrides,
});

describe("savePrizeWinnerToFirestore", () => {
  it("calls setDoc on the prizeWinners collection with the winner data", async () => {
    const winner = makeWinner();
    await savePrizeWinnerToFirestore(winner);
    expect(mockDoc).toHaveBeenCalledWith(
      expect.anything(),
      "prizeWinners",
      "winner-123",
    );
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "prizeWinners/winner-123" }),
      winner,
      { merge: true },
    );
  });

  it("includes conferenceId in the persisted data", async () => {
    const winner = makeWinner({ conferenceId: "hamcation-2026" });
    await savePrizeWinnerToFirestore(winner);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ conferenceId: "hamcation-2026" }),
      { merge: true },
    );
  });
});

describe("deletePrizeWinnerFromFirestore", () => {
  it("calls deleteDoc on the prizeWinners collection with the correct id", async () => {
    await deletePrizeWinnerFromFirestore("winner-456");
    expect(mockDoc).toHaveBeenCalledWith(
      expect.anything(),
      "prizeWinners",
      "winner-456",
    );
    expect(mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "prizeWinners/winner-456" }),
    );
  });
});
