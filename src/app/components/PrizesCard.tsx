import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Ticket, Trophy, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Separator } from "@/app/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/components/ui/tabs";
import { MAX_RANGE_SIZE } from "@/app/hooks/useRaffleTickets";
import { Prize, PrizeWinner } from "@/types/conference";

interface PrizesCardProps {
  raffleTickets: string[];
  onAddTicket: (ticket: string) => void;
  onRemoveTicket: (ticket: string) => void;
  onAddTicketRange: (start: number, end: number) => void;
  prizes: Prize[];
  prizeWinners: PrizeWinner[];
}

export function PrizesCard({
  raffleTickets,
  onAddTicket,
  onRemoveTicket,
  onAddTicketRange,
  prizes,
  prizeWinners,
}: PrizesCardProps) {
  const [newTicket, setNewTicket] = useState<string>("");
  const [rangeStart, setRangeStart] = useState<string>("");
  const [rangeEnd, setRangeEnd] = useState<string>("");

  const rangeStartNum = parseInt(rangeStart, 10);
  const rangeEndNum = parseInt(rangeEnd, 10);
  const rangeSize =
    !isNaN(rangeStartNum) && !isNaN(rangeEndNum)
      ? rangeEndNum - rangeStartNum + 1
      : 0;
  const isRangeValid =
    rangeStart.trim() !== "" &&
    rangeEnd.trim() !== "" &&
    !isNaN(rangeStartNum) &&
    !isNaN(rangeEndNum) &&
    rangeStartNum <= rangeEndNum &&
    rangeSize <= MAX_RANGE_SIZE;

  const handleAddTicket = () => {
    const trimmed = newTicket.trim();
    if (!trimmed) return;
    onAddTicket(trimmed);
    setNewTicket("");
  };

  const handleAddRange = () => {
    if (!isRangeValid) return;
    onAddTicketRange(rangeStartNum, rangeEndNum);
    setRangeStart("");
    setRangeEnd("");
  };

  // Determine prizes won by matching user's raffle tickets against prize winners
  const ticketSet = new Set(raffleTickets);
  const prizeMap = new Map(prizes.map((p) => [p.id, p]));
  const wonEntries = prizeWinners
    .filter((pw) => ticketSet.has(pw.winningTicket))
    .flatMap((pw) =>
      pw.prizeId.map((pid) => ({
        prizeId: pid,
        winningTicket: pw.winningTicket,
        prize: prizeMap.get(pid),
      })),
    );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Prizes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Prizes won section */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Prizes won</p>
          {wonEntries.length === 0 && (
            <span className="text-xs text-muted-foreground">None yet</span>
          )}
        </div>
        {wonEntries.length > 0 && (
          <ul className="space-y-1">
            {wonEntries.map(({ prizeId, winningTicket, prize }) => (
              <li key={`${prizeId}-${winningTicket}`} className="text-sm">
                <Link
                  to={`/prizes#prize-${prizeId}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {prize ? prize.name : prizeId}
                </Link>
                <span className="text-xs text-muted-foreground ml-2">
                  (ticket {winningTicket})
                </span>
              </li>
            ))}
          </ul>
        )}

        <Separator />

        {/* Raffle Tickets subheading */}
        <p className="text-sm font-medium flex items-center gap-2">
          <Ticket className="h-4 w-4" />
          Raffle Tickets
        </p>
        {raffleTickets.length > 0 && (
          <ul className="space-y-2">
            {raffleTickets.map((ticket) => (
              <li
                key={ticket}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-mono">{ticket}</span>
                <button
                  type="button"
                  onClick={() => onRemoveTicket(ticket)}
                  aria-label={`Remove ticket ${ticket}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <Tabs defaultValue="single">
          <TabsList className="h-7 text-xs mb-1">
            <TabsTrigger value="single" className="h-6 px-3 text-xs">
              Single
            </TabsTrigger>
            <TabsTrigger value="range" className="h-6 px-3 text-xs">
              Range
            </TabsTrigger>
          </TabsList>
          <TabsContent value="single" className="mt-0">
            <div className="flex gap-2">
              <Input
                placeholder="Enter ticket number"
                value={newTicket}
                onChange={(e) => setNewTicket(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTicket();
                }}
                className="h-8 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTicket}
                disabled={!newTicket.trim()}
                aria-label="Add ticket"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="range" className="mt-0 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="First"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddRange();
                }}
                className="h-8 text-sm w-24"
                aria-label="Range start ticket number"
              />
              <span className="text-sm text-muted-foreground">–</span>
              <Input
                type="number"
                placeholder="Last"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddRange();
                }}
                className="h-8 text-sm w-24"
                aria-label="Range end ticket number"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRange}
                disabled={!isRangeValid}
                aria-label="Add ticket range"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {rangeStart &&
              rangeEnd &&
              !isNaN(rangeStartNum) &&
              !isNaN(rangeEndNum) && (
                <p className="text-xs text-muted-foreground">
                  {rangeStartNum > rangeEndNum
                    ? "Start must be ≤ end"
                    : rangeSize > MAX_RANGE_SIZE
                      ? `Range too large (max ${MAX_RANGE_SIZE})`
                      : `${rangeSize} ticket${rangeSize !== 1 ? "s" : ""} will be added`}
                </p>
              )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
