import { Prize, PrizeWinner } from "@/types/conference";
import { conferenceModules } from "@/lib/conferenceData";

interface PrizeModule {
  samplePrizes?: Prize[];
  [key: string]: unknown;
}

interface PrizeWinnerModule {
  samplePrizeWinners?: PrizeWinner[];
  [key: string]: unknown;
}

// Process the modules into a lookup object
export const PRIZE_DATA: Record<string, Prize[]> = {};
export const PRIZE_WINNER_DATA: Record<string, PrizeWinner[]> = {};
Object.entries(conferenceModules).forEach(([path, module]) => {
  const conferenceId = path.split("/").pop()?.replace(".ts", "") || "";
  const typedModule = module as PrizeModule;
  if (typedModule.samplePrizes) {
    PRIZE_DATA[conferenceId] = typedModule.samplePrizes;
  }
  const typedWinnerModule = module as PrizeWinnerModule;
  if (typedWinnerModule.samplePrizeWinners) {
    PRIZE_WINNER_DATA[conferenceId] = typedWinnerModule.samplePrizeWinners;
  }
});

// Track the newest supplemental file timestamp token (string after the last "-")
// per conference so it can be displayed as a data-freshness indicator.
export const PRIZE_SUPPLEMENTAL_TOKEN: Record<string, string> = {};

// Override with supplemental prize files (e.g. yuma-2026-prize-20260227T132422.ts).
// Sorting paths ensures the alphabetically last (= most recent timestamp) wins when
// multiple supplemental files exist for the same conference.
const supplementalPrizeModules = import.meta.glob("../data/*-prize-*.ts", {
  eager: true,
});
Object.keys(supplementalPrizeModules)
  .sort()
  .forEach((path) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    const match = filename.match(/^(.+)-prize-/);
    if (match) {
      const conferenceId = match[1];
      const typedModule = supplementalPrizeModules[path] as PrizeModule;
      if (typedModule.samplePrizes) {
        PRIZE_DATA[conferenceId] = typedModule.samplePrizes;
        const token = filename.split("-").pop() ?? "";
        if (token && token > (PRIZE_SUPPLEMENTAL_TOKEN[conferenceId] ?? "")) {
          PRIZE_SUPPLEMENTAL_TOKEN[conferenceId] = token;
        }
      }
    }
  });

const supplementalPrizeWinnerModules = import.meta.glob(
  "../data/*-prizewinner-*.ts",
  { eager: true },
);
Object.keys(supplementalPrizeWinnerModules)
  .sort()
  .forEach((path) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    const match = filename.match(/^(.+)-prizewinner-/);
    if (match) {
      const conferenceId = match[1];
      const typedModule = supplementalPrizeWinnerModules[
        path
      ] as PrizeWinnerModule;
      if (typedModule.samplePrizeWinners) {
        PRIZE_WINNER_DATA[conferenceId] = typedModule.samplePrizeWinners;
        const token = filename.split("-").pop() ?? "";
        if (token && token > (PRIZE_SUPPLEMENTAL_TOKEN[conferenceId] ?? "")) {
          PRIZE_SUPPLEMENTAL_TOKEN[conferenceId] = token;
        }
      }
    }
  });
