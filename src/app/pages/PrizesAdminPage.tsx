import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { usePrizeAdmin } from "@/app/hooks/usePrizeAdmin";
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

export function PrizesAdminPage() {
  const { user, loading } = useAuth();
  const { activeConference } = useConference();
  const isPrizeAdmin = usePrizeAdmin();

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
          to access prize management.
        </p>
      </div>
    );
  }

  // Signed in but not in the prize-admin group
  if (!isPrizeAdmin) {
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

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="h-5 w-5 text-green-600" />
        <h1 className="text-2xl font-bold">Prize Management</h1>
        <span className="text-sm text-gray-500 ml-2">
          ({activeConference.name})
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Changes are in-memory only until Firestore persistence is wired up.
        Access is gated by the{" "}
        <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
          prize-admin
        </code>{" "}
        group (simulating Google Cloud Groups).
      </p>
      <PrizesAdminView initialPrizes={prizes} initialWinners={winners} />

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Image Library</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Upload prize images to Firebase Cloud Storage (
          <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
            assets/prizes/
          </code>
          ). Select an image when editing a prize to set its image URL.
        </p>
        <PrizesImageView />
      </div>
    </div>
  );
}
