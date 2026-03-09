import { useState } from "react";
import { CalendarCheck, Plus, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Conference } from "@/types/conference";

interface AttendanceCardProps {
  /** List of conferenceIds the user is attending. */
  attendance: string[];
  /** All conferences available for selection (separators with id "---" excluded). */
  allConferences: Conference[];
  onAddConference: (conferenceId: string) => void;
  onRemoveConference: (conferenceId: string) => void;
}

export function AttendanceCard({
  attendance,
  allConferences,
  onAddConference,
  onRemoveConference,
}: AttendanceCardProps) {
  const [selected, setSelected] = useState<string>("");

  // Build a map for name lookups
  const conferenceMap = new Map(allConferences.map((c) => [c.id, c.name]));

  // Conferences not yet in the attendance list
  const available = allConferences.filter((c) => !attendance.includes(c.id));

  const handleAdd = () => {
    if (!selected) return;
    onAddConference(selected);
    setSelected("");
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarCheck className="h-4 w-4" />
          Conference Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Conferences you are attending.
        </p>

        {attendance.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No conferences added yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {attendance.map((conferenceId) => (
              <li
                key={conferenceId}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-sm truncate">
                  {conferenceMap.get(conferenceId) ?? conferenceId}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveConference(conferenceId)}
                  aria-label={`Remove ${conferenceMap.get(conferenceId) ?? conferenceId} from attendance`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {available.length > 0 && (
          <>
            <Separator />
            <div className="flex items-center gap-2">
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger
                  className="flex-1 text-sm"
                  aria-label="Select a conference to add"
                >
                  <SelectValue placeholder="Add a conference…" />
                </SelectTrigger>
                <SelectContent>
                  {available.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
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
                aria-label="Add conference to attendance"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
