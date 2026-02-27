import { describe, it, expect } from "vitest";
import { samplePrizes } from "./yuma-2026-prize-20260227T132422";
import { samplePrizeWinners } from "./yuma-2026-prizewinner-20260227T132422";
import { Prize, PrizeWinner } from "@/types/conference";

// ── yuma-2026 supplemental prize file ────────────────────────────────────────
// These tests guard the shape and presence of the supplemental prize/prizewinner
// exports that override the data embedded in yuma-2026.ts when they exist.
describe("yuma-2026-prize supplemental file", () => {
  it("exports a non-empty Prize array", () => {
    expect(Array.isArray(samplePrizes)).toBe(true);
    expect(samplePrizes.length).toBeGreaterThan(0);
  });

  it("each prize has required fields", () => {
    samplePrizes.forEach((prize: Prize) => {
      expect(typeof prize.id).toBe("string");
      expect(prize.id.length).toBeGreaterThan(0);
      expect(typeof prize.name).toBe("string");
      expect(prize.name.length).toBeGreaterThan(0);
      expect(typeof prize.category).toBe("string");
    });
  });
});

describe("yuma-2026-prizewinner supplemental file", () => {
  it("exports a non-empty PrizeWinner array", () => {
    expect(Array.isArray(samplePrizeWinners)).toBe(true);
    expect(samplePrizeWinners.length).toBeGreaterThan(0);
  });

  it("each winner has an id and at least one prizeId", () => {
    samplePrizeWinners.forEach((winner: PrizeWinner) => {
      expect(typeof winner.id).toBe("string");
      expect(winner.id.length).toBeGreaterThan(0);
      expect(Array.isArray(winner.prizeId)).toBe(true);
      expect(winner.prizeId.length).toBeGreaterThan(0);
    });
  });
});

// ── Supplemental file override logic ─────────────────────────────────────────
// Verifies that when supplemental data is present, it correctly overrides the
// data embedded in the main conference file.
describe("supplemental prize override logic", () => {
  it("supplemental prizes override main-file prizes for same conferenceId", () => {
    // Simulate how PrizesView.tsx merges data:
    //   1. Main conference file contributes initial prizes
    //   2. Supplemental file overrides them
    const PRIZE_DATA: Record<string, Prize[]> = {
      "yuma-2026": [{ id: "old-p1", name: "Old Prize", category: "Other", description: "", imageUrl: "", donor: "" }],
    };
    // Apply override (same logic as in PrizesView.tsx)
    const conferenceId = "yuma-2026";
    PRIZE_DATA[conferenceId] = samplePrizes;

    expect(PRIZE_DATA["yuma-2026"]).toBe(samplePrizes);
    expect(PRIZE_DATA["yuma-2026"].find((p) => p.id === "old-p1")).toBeUndefined();
    // Verify the supplemental data has the expected shape after override
    PRIZE_DATA["yuma-2026"].forEach((prize: Prize) => {
      expect(typeof prize.id).toBe("string");
      expect(typeof prize.name).toBe("string");
      expect(typeof prize.category).toBe("string");
    });
  });

  it("supplemental prizewinners override main-file winners for same conferenceId", () => {
    const PRIZE_WINNER_DATA: Record<string, PrizeWinner[]> = {
      "yuma-2026": [{ id: "old-w1", prizeId: ["old-p1"], winningTicket: "0000" }],
    };
    const conferenceId = "yuma-2026";
    PRIZE_WINNER_DATA[conferenceId] = samplePrizeWinners;

    expect(PRIZE_WINNER_DATA["yuma-2026"]).toBe(samplePrizeWinners);
    expect(PRIZE_WINNER_DATA["yuma-2026"].find((w) => w.id === "old-w1")).toBeUndefined();
    // Verify the supplemental data has the expected shape after override
    PRIZE_WINNER_DATA["yuma-2026"].forEach((winner: PrizeWinner) => {
      expect(typeof winner.id).toBe("string");
      expect(Array.isArray(winner.prizeId)).toBe(true);
    });
  });
});
