import { useState, useEffect, useRef } from "react";
import { Mic, Plus, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import { Separator } from "@/app/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Session } from "@/types/conference";

interface SpeakerCardProps {
  /** Session IDs the user has registered as a presenter for. */
  speakerSessions: string[];
  /** All sessions available for the active conference. */
  allSessions: Session[];
  onAddSession: (sessionId: string) => void;
  onRemoveSession: (sessionId: string) => void;
}

export function SpeakerCard({
  speakerSessions,
  allSessions,
  onAddSession,
  onRemoveSession,
}: SpeakerCardProps) {
  // presenterEnabled tracks whether the user has opted in to the presenter panel.
  // Initialized from existing sessions (localStorage), and also responds to
  // Firestore loads (sessions arriving asynchronously after mount).
  const [presenterEnabled, setPresenterEnabled] = useState(
    speakerSessions.length > 0,
  );
  const [selected, setSelected] = useState<string>("");

  // Guard flag: when the user explicitly unchecks, we avoid re-enabling the
  // checkbox just because the speakerSessions state hasn't cleared yet.
  const isUnchecking = useRef(false);

  // When speakerSessions loads from Firestore (may arrive after initial render),
  // automatically enable the presenter panel if sessions are found.
  useEffect(() => {
    if (!isUnchecking.current && speakerSessions.length > 0) {
      setPresenterEnabled(true);
    }
  }, [speakerSessions.length]);

  // Build a map for quick title lookup
  const sessionMap = new Map(allSessions.map((s) => [s.id, s]));

  // Sessions not yet added by the user
  const available = allSessions.filter((s) => !speakerSessions.includes(s.id));

  const handlePresenterChange = (checked: boolean) => {
    setPresenterEnabled(checked);
    if (!checked) {
      isUnchecking.current = true;
      // Remove all speaker sessions when unchecking
      speakerSessions.forEach((id) => onRemoveSession(id));
      setSelected("");
      // Allow re-detection of external loads once the UI settles
      requestAnimationFrame(() => {
        isUnchecking.current = false;
      });
    }
  };

  const handleAdd = () => {
    if (!selected) return;
    onAddSession(selected);
    setSelected("");
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Mic className="h-4 w-4" aria-hidden="true" />
          Speaker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 justify-end">
          <Label
            htmlFor="presenter-checkbox"
            className="text-sm font-medium cursor-pointer"
          >
            I am presenting a session at this conference
          </Label>
          <Checkbox
            id="presenter-checkbox"
            checked={presenterEnabled}
            onCheckedChange={(checked) =>
              handlePresenterChange(checked === true)
            }
          />
        </div>

        {presenterEnabled && (
          <>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Select the sessions you are presenting. Your name will appear on
              the attendees page as a speaker.
            </p>

            {speakerSessions.length > 0 && (
              <ul className="space-y-1">
                {speakerSessions.map((sessionId) => {
                  const session = sessionMap.get(sessionId);
                  return (
                    <li
                      key={sessionId}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-sm truncate">
                        {session?.title ?? sessionId}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveSession(sessionId)}
                        aria-label={`Remove ${session?.title ?? sessionId} from presenter sessions`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}

            {available.length > 0 && (
              <div className="flex items-center gap-2">
                <Select value={selected} onValueChange={setSelected}>
                  <SelectTrigger
                    className="flex-1 text-sm"
                    aria-label="Select a session to add"
                  >
                    <SelectValue placeholder="Add a session…" />
                  </SelectTrigger>
                  <SelectContent>
                    {available.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0"
                  onClick={handleAdd}
                  disabled={!selected}
                  aria-label="Add session to presenter list"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {available.length === 0 && speakerSessions.length > 0 && (
              <p className="text-xs text-muted-foreground italic">
                All available sessions have been added.
              </p>
            )}

            {allSessions.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                No sessions are available for this conference.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
