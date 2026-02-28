import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { usePrizesAdmin } from "@/app/hooks/usePrizesAdmin";
import { PrizesAdminView } from "@/app/components/PrizesAdminView";
import { PrizesImageView } from "@/app/components/PrizesImageView";
import { Prize, PrizeWinner } from "@/types/conference";

// Load sample data for all conferences (same glob as PrizesView)
interface PrizeModule {
  samplePrizes?: Prize[];
  samplePrizeWinners?: PrizeWinner[];
  [key: string]: unknown;
}

const conferenceModules = import.meta.glob("../../data/*-20[0-9][0-9].ts", {
  eager: true,
});

const PRIZE_DATA: Record<string, Prize[]> = {};
const PRIZE_WINNER_DATA: Record<string, PrizeWinner[]> = {};
Object.entries(conferenceModules).forEach(([path, mod]) => {
  const conferenceId = path.split("/").pop()?.replace(".ts", "") ?? "";
  const typedMod = mod as PrizeModule;
  if (typedMod.samplePrizes) PRIZE_DATA[conferenceId] = typedMod.samplePrizes;
  if (typedMod.samplePrizeWinners)
    PRIZE_WINNER_DATA[conferenceId] = typedMod.samplePrizeWinners;
});

// Track the newest supplemental file timestamp token per conference.
const PRIZE_SUPPLEMENTAL_TOKEN: Record<string, string> = {};

// Override with supplemental prize files (e.g. yuma-2026-prize-20260227T132422.ts).
// Sorting paths ensures the alphabetically last (= most recent timestamp) wins when
// multiple supplemental files exist for the same conference.
const supplementalPrizeModules = import.meta.glob("../../data/*-prize-*.ts", {
  eager: true,
});
Object.keys(supplementalPrizeModules)
  .sort()
  .forEach((path) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    const match = filename.match(/^(.+)-prize-/);
    if (match) {
      const conferenceId = match[1];
      const typedMod = supplementalPrizeModules[path] as PrizeModule;
      if (typedMod.samplePrizes) {
        PRIZE_DATA[conferenceId] = typedMod.samplePrizes;
        const token = filename.split("-").pop() ?? "";
        if (token && token > (PRIZE_SUPPLEMENTAL_TOKEN[conferenceId] ?? "")) {
          PRIZE_SUPPLEMENTAL_TOKEN[conferenceId] = token;
        }
      }
    }
  });

const supplementalPrizeWinnerModules = import.meta.glob(
  "../../data/*-prizewinner-*.ts",
  { eager: true },
);
Object.keys(supplementalPrizeWinnerModules)
  .sort()
  .forEach((path) => {
    const filename = path.split("/").pop()?.replace(".ts", "") ?? "";
    const match = filename.match(/^(.+)-prizewinner-/);
    if (match) {
      const conferenceId = match[1];
      const typedMod = supplementalPrizeWinnerModules[path] as PrizeModule;
      if (typedMod.samplePrizeWinners) {
        PRIZE_WINNER_DATA[conferenceId] = typedMod.samplePrizeWinners;
        const token = filename.split("-").pop() ?? "";
        if (token && token > (PRIZE_SUPPLEMENTAL_TOKEN[conferenceId] ?? "")) {
          PRIZE_SUPPLEMENTAL_TOKEN[conferenceId] = token;
        }
      }
    }
  });

export function PrizesAdminPage() {
  const { user, loading } = useAuth();
  const { activeConference } = useConference();
  const isPrizesAdmin = usePrizesAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Loading…
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ShieldAlert className="h-12 w-12 text-gray-400" />
        <p className="text-lg font-medium">Sign in required</p>
        <p className="text-sm text-gray-500">
          Please{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            sign in
          </Link>{" "}
          to access prizes management.
        </p>
      </div>
    );
  }

  // Signed in but not in the prize-admin group
  if (!isPrizesAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ShieldAlert className="h-12 w-12 text-red-400" />
        <p className="text-lg font-medium">Access Denied</p>
        <p className="text-sm text-gray-500">
          Your account does not have prize-admin group membership.
        </p>
      </div>
    );
  }

  const prizes = PRIZE_DATA[activeConference.id] ?? [];
  const winners = PRIZE_WINNER_DATA[activeConference.id] ?? [];
  const updateToken = PRIZE_SUPPLEMENTAL_TOKEN[activeConference.id];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="h-5 w-5 text-green-600" />
        <h1 className="text-2xl font-bold">Prizes Management</h1>
        <span className="text-sm text-gray-500 ml-2">
          ({activeConference.name})
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Use <strong>Save to drive</strong> to upload the current Prize and
        PrizeWinner data.
      </p>
      <PrizesAdminView
        conferenceId={activeConference.id}
        initialPrizes={prizes}
        initialWinners={winners}
        updateToken={updateToken}
      />

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Image Library</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Upload prize images to Google Drive (
          <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
            VITE_GOOGLE_DRIVE_FOLDER_PRIZES_ID
          </code>
          ). Select an image when editing a prize to set its image URL.
        </p>
        <PrizesImageView />
      </div>
    </div>
  );
}
