import { useRef, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Award, HandHelping, Info, Trophy } from "lucide-react";
import { Prize, PrizeWinner } from "@/types/conference";
import { useConference } from "@/app/contexts/ConferenceContext";

interface PrizeCardProps {
  prize: Prize;
  prizeWinner: string;
  isHighlighted: boolean;
}

function PrizeCard({ prize, prizeWinner, isHighlighted }: PrizeCardProps) {
  const prizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && prizeRef.current) {
      prizeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isHighlighted]);

  return (
    <div
      ref={prizeRef}
      id={`prize-${prize.id}`}
      className={`mb-4 transition-all w-full ${
        isHighlighted ? "ring-2 ring-blue-500 shadow-lg scale-105" : ""
      }`}
    >
      <Card
        className={`transition-all w-full  ${isHighlighted ? "ring-2 ring-blue-500 shadow-lg scale-105" : ""}`}
      >
        <CardHeader>
          <div className="flex space-y-2 gap-2 justify-between items-start">
            <Trophy className="h-4 w-4" />
            <CardTitle className="text-lg mb-2 w-full">{prize.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <img
            className="float-right"
            alt="prize image"
            src={prize.imageUrl}
            width="200px"
            height="200px"
          />
          <p className="text-sm space-y-2 flex gap-2 text-gray-600 dark:text-gray-400 mb-3">
            <Info className="h-4 w-4" />
            {prize.description}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <HandHelping className="h-4 w-4" />
              <span>{prize.donor}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Award className="h-4 w-4" />
              <span>{prizeWinner}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface PrizeModule {
  samplePrizes?: Prize[];
  [key: string]: unknown;
}

interface PrizeWinnerModule {
  samplePrizeWinners?: PrizeWinner[];
  [key: string]: unknown;
}

// Import all prize data files at once using Vite's glob import
const conferenceModules = import.meta.glob("../../data/*-20[0-9][0-9].ts", {
  eager: true,
});

// Process the modules into a lookup object
const PRIZE_DATA: Record<string, Prize[]> = {};
const PRIZE_WINNER_DATA: Record<string, PrizeWinner[]> = {};
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
      const typedModule = supplementalPrizeWinnerModules[path] as PrizeWinnerModule;
      if (typedModule.samplePrizeWinners) {
        PRIZE_WINNER_DATA[conferenceId] = typedModule.samplePrizeWinners;
        const token = filename.split("-").pop() ?? "";
        if (token && token > (PRIZE_SUPPLEMENTAL_TOKEN[conferenceId] ?? "")) {
          PRIZE_SUPPLEMENTAL_TOKEN[conferenceId] = token;
        }
      }
    }
  });

/**
 * Format a supplemental-file timestamp token for display.
 * Input:  "20260227T132422"  (YYYYMMDDTHHmmss, the string after the last "-" in the filename)
 * Output: "27T1324"          ({UTCday}T{UTChour}{UTCminute})
 */
export function formatUpdateToken(token: string): string {
  const month = token.slice(4, 6);
  const day = token.slice(6, 8);
  const hour = token.slice(9, 11);
  const minute = token.slice(11, 13);
  return `${day}T${hour}${minute}`;
}

interface PrizesViewProps {
  highlightPrizeId?: string;
}

export function PrizesView({ highlightPrizeId }: PrizesViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const prizes = PRIZE_DATA[activeConference.id] || [];
  const prizeWinners = PRIZE_WINNER_DATA[activeConference.id] || [];
  const updateToken = PRIZE_SUPPLEMENTAL_TOKEN[activeConference.id];
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Group prizes by category
  const groupPrizesByCategory = (prizes: Prize[]) => {
    const grouped: Record<string, Prize[]> = {};
    prizes.forEach((loopprize) => {
      const category = loopprize.category ? loopprize.category : "Prize";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(loopprize);
    });
    return grouped;
  };

  const groupedPrizes = groupPrizesByCategory(prizes);
  const categoryKeys = Object.keys(groupedPrizes).sort();

  //function formatPrizeDate(dateString: string, tzString: string) {
  //  const dateOptions: Intl.DateTimeFormatOptions = {
  //    timeZone: activeConference.timezone,
  //    weekday: 'long',
  //    month: 'long',
  //    day: 'numeric'
  //  };
  //  const dateObj = new Date(dateString + "T11:00:00" + tzString);
  //  const timeFormatter = new Intl.DateTimeFormat('en-US', dateOptions);
  //  return timeFormatter.format(dateObj);
  //}

  // Helper to format time
  //const formatTime = (timeString: string) =>
  //  formatPrizeTime(timeString, activeConference.timezoneNumeric, activeConference);

  const pwin = (pw?: string) => {
    if (pw) {
      const pwId = prizeWinners.find((element) => element.id === pw);
      if (pwId) {
        if (pwId.claimedAt) return pwId.winningTicket + " <claimed>";
        else {
          if (pwId.notifiedAt) return pwId.winningTicket + " [notified]";
          else return pwId.winningTicket + " not claimed";
        }
      }
    }
    return "";
  };

  return (
    <div className="w-full">
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="w-full"
      >
        <TabsList className="w-full mb-6 flex-wrap h-auto">
          <TabsTrigger value="all">All Prizes</TabsTrigger>
          {categoryKeys.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          {categoryKeys.map((category) => (
            <div key={category} className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{category}</h3>
              {groupedPrizes[category]
                .sort((a, b) => a.category.localeCompare(b.category))
                .map((prize) => (
                  <PrizeCard
                    key={prize.id}
                    prize={prize}
                    prizeWinner={pwin(prize.winner)}
                    isHighlighted={highlightPrizeId === prize.id}
                  />
                ))}
            </div>
          ))}
        </TabsContent>

        {categoryKeys.map((category) => (
          <TabsContent key={category} value={category}>
            {groupedPrizes[category]
              .sort((a, b) => a.category.localeCompare(b.category))
              .map((prize) => (
                <PrizeCard
                  key={prize.id}
                  prize={prize}
                  prizeWinner={pwin(prize.winner)}
                  isHighlighted={highlightPrizeId === prize.id}
                />
              ))}
          </TabsContent>
        ))}
      </Tabs>
      {updateToken && (
        <p
          className="text-xs text-gray-400 mt-4"
          title={updateToken}
        >
          Updated: {formatUpdateToken(updateToken)}
        </p>
      )}
    </div>
  );
}
