import { useMemo, useState } from "react";
import { Session } from "@/types/conference";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  CalendarDays,
  MapPin,
  Pencil,
  PlusCircle,
  Tag,
  Trash2,
} from "lucide-react";
import { useConference } from "@/app/contexts/ConferenceContext";
import { ROOM_DATA } from "@/lib/supplementalData";
import { isSessionWithinConference } from "@/lib/overrideUtils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// SessionForm dialog
// ---------------------------------------------------------------------------

interface SessionFormProps {
  open: boolean;
  initial: Session | null;
  onSave: (session: Session) => void;
  onClose: () => void;
}

function SessionForm({ open, initial, onSave, onClose }: SessionFormProps) {
  const blank: Session = {
    id: "",
    title: "",
    description: "",
    speaker: [],
    location: "",
    startTime: "",
    endTime: "",
    category: "",
    url: "",
    track: [],
  };
  const [form, setForm] = useState<
    Session & { speakerRaw: string; trackRaw: string }
  >(
    initial
      ? {
          ...initial,
          speakerRaw: initial.speaker.join(", "),
          trackRaw: (initial.track ?? []).join(", "),
        }
      : { ...blank, speakerRaw: "", trackRaw: "" },
  );

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setForm(
        initial
          ? {
              ...initial,
              speakerRaw: initial.speaker.join(", "),
              trackRaw: (initial.track ?? []).join(", "),
            }
          : { ...blank, speakerRaw: "", trackRaw: "" },
      );
    }
    if (!isOpen) onClose();
  };

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    const id = form.id.trim() || newId("session");
    onSave({
      id,
      title: form.title,
      description: form.description,
      speaker: form.speakerRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      location: form.location,
      startTime: form.startTime,
      endTime: form.endTime,
      category: form.category,
      url: form.url,
      track: form.trackRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Session" : "Add Session"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1">
            <Label htmlFor="sess-id">ID</Label>
            <Input
              id="sess-id"
              value={form.id}
              onChange={(e) => set("id", e.target.value)}
              placeholder="auto-generated if blank"
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="sess-title">Title *</Label>
            <Input
              id="sess-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="sess-desc">Description</Label>
            <Input
              id="sess-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="sess-speaker">Speaker(s)</Label>
            <Input
              id="sess-speaker"
              value={form.speakerRaw}
              onChange={(e) => set("speakerRaw", e.target.value)}
              placeholder="comma-separated"
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="sess-location">Location</Label>
            <Input
              id="sess-location"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="sess-start">Start Time</Label>
            <Input
              id="sess-start"
              value={form.startTime}
              onChange={(e) => set("startTime", e.target.value)}
              placeholder="2026-10-16T09:00:00"
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="sess-end">End Time</Label>
            <Input
              id="sess-end"
              value={form.endTime}
              onChange={(e) => set("endTime", e.target.value)}
              placeholder="2026-10-16T10:00:00"
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="sess-category">Category</Label>
            <Input
              id="sess-category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="sess-track">Track(s)</Label>
            <Input
              id="sess-track"
              value={form.trackRaw}
              onChange={(e) => set("trackRaw", e.target.value)}
              placeholder="comma-separated"
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="sess-url">URL</Label>
            <Input
              id="sess-url"
              value={form.url ?? ""}
              onChange={(e) => set("url", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.title.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// DeleteDialog
// ---------------------------------------------------------------------------

interface DeleteDialogProps {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onClose: () => void;
}

function DeleteDialog({ open, name, onConfirm, onClose }: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Session</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete <strong>{name}</strong>? This cannot
          be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// SessionAdminView
// ---------------------------------------------------------------------------

export interface SessionAdminViewProps {
  conferenceId: string;
  initialSessions: Session[];
}

export function SessionAdminView({
  conferenceId,
  initialSessions,
}: SessionAdminViewProps) {
  const { activeConference } = useConference();
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [form, setForm] = useState<{ open: boolean; item: Session | null }>({
    open: false,
    item: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");

  // Collect defined room names from ROOM_DATA for this conference
  const validRoomNames = useMemo(() => {
    const roomEntries = ROOM_DATA[conferenceId] ?? [];
    return new Set(
      roomEntries.flatMap(([, rooms]) => rooms.map((r) => r.name)),
    );
  }, [conferenceId]);

  // Collect unique filter options from all sessions
  const allRooms = useMemo(
    () => [...new Set(sessions.map((s) => s.location).filter(Boolean))].sort(),
    [sessions],
  );
  const allTracks = useMemo(
    () => [...new Set(sessions.flatMap((s) => s.track ?? []))].sort(),
    [sessions],
  );
  const allDates = useMemo(
    () =>
      [
        ...new Set(
          sessions.map((s) => s.startTime.split("T")[0]).filter(Boolean),
        ),
      ].sort(),
    [sessions],
  );

  // Apply active filters
  const filteredSessions = useMemo(() => {
    let result = sessions;
    if (selectedRoom !== "all")
      result = result.filter((s) => s.location === selectedRoom);
    if (selectedTrack !== "all")
      result = result.filter((s) => (s.track ?? []).includes(selectedTrack));
    if (selectedDate !== "all")
      result = result.filter((s) => s.startTime.startsWith(selectedDate));
    return result;
  }, [sessions, selectedRoom, selectedTrack, selectedDate]);

  // Returns true when the room has not been assigned or is not in the defined rooms list.
  // Some locations contain comma-separated room names; only the first segment is checked.
  const isRoomUndefined = (location: string) => {
    const trimmed = location?.trim();
    if (!trimmed) return true;
    if (validRoomNames.size === 0) return false;
    const primaryRoom = trimmed.split(",")[0].trim();
    return !validRoomNames.has(primaryRoom);
  };

  // Returns true when the session start/end date is outside the conference date range
  const isDateOutOfRange = (session: Session) =>
    !isSessionWithinConference(session, activeConference);

  const saveSession = (session: Session) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === session.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = session;
        return next;
      }
      return [...prev, session];
    });
  };

  const deleteSession = (id: string) =>
    setSessions((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Sessions
          <span className="text-sm text-gray-500 font-normal">
            ({conferenceId})
          </span>
        </h2>
        <Button size="sm" onClick={() => setForm({ open: true, item: null })}>
          <PlusCircle className="h-4 w-4" />
          Add Session
        </Button>
      </div>

      {/* Room filter */}
      {allRooms.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedRoom === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRoom("all")}
            className="flex items-center gap-1"
          >
            <MapPin className="h-4 w-4" />
            All Locations
          </Button>
          {allRooms.map((room) => (
            <Button
              key={room}
              variant={selectedRoom === room ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setSelectedRoom(selectedRoom === room ? "all" : room)
              }
              className={`flex items-center gap-1 ${isRoomUndefined(room) ? "text-red-500 border-red-400 hover:text-red-600" : ""}`}
            >
              <MapPin className="h-4 w-4" />
              {room || <span className="italic">undefined</span>}
            </Button>
          ))}
        </div>
      )}

      {/* Track filter */}
      {allTracks.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedTrack === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTrack("all")}
            className="flex items-center gap-1"
          >
            <Tag className="h-4 w-4" />
            All Tracks
          </Button>
          {allTracks.map((track) => (
            <Button
              key={track}
              variant={selectedTrack === track ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setSelectedTrack(selectedTrack === track ? "all" : track)
              }
              className="flex items-center gap-1"
            >
              <Tag className="h-4 w-4" />
              {track}
            </Button>
          ))}
        </div>
      )}

      {/* Date filter */}
      {allDates.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedDate === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDate("all")}
            className="flex items-center gap-1"
          >
            <CalendarDays className="h-4 w-4" />
            All Dates
          </Button>
          {allDates.map((date) => {
            const dateOutOfRange =
              date < activeConference.startDate ||
              date > activeConference.endDate;
            return (
              <Button
                key={date}
                variant={selectedDate === date ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setSelectedDate(selectedDate === date ? "all" : date)
                }
                className={`flex items-center gap-1 ${dateOutOfRange ? "text-red-500 border-red-400 hover:text-red-600" : ""}`}
              >
                <CalendarDays className="h-4 w-4" />
                {date}
              </Button>
            );
          })}
        </div>
      )}

      {/* Session cards */}
      <div className="grid gap-4">
        {filteredSessions.map((session) => {
          const roomBad = isRoomUndefined(session.location);
          const dateBad = isDateOutOfRange(session);
          return (
            <Card key={session.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">
                    {session.title}
                  </CardTitle>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setForm({ open: true, item: session })}
                      aria-label={`Edit ${session.title}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-red-500 hover:text-red-600"
                      onClick={() => setDeleteTarget(session)}
                      aria-label={`Delete ${session.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                {session.description && <p>{session.description}</p>}
                {session.speaker.length > 0 && (
                  <p>
                    <strong>Speaker(s):</strong> {session.speaker.join(", ")}
                  </p>
                )}
                <p>
                  <strong>Location:</strong>{" "}
                  <span className={roomBad ? "text-red-500 font-medium" : ""}>
                    {session.location || <em>not defined</em>}
                  </span>
                </p>
                {session.startTime && (
                  <p>
                    <strong>Start:</strong>{" "}
                    <span className={dateBad ? "text-red-500 font-medium" : ""}>
                      {session.startTime}
                    </span>
                  </p>
                )}
                {session.endTime && (
                  <p>
                    <strong>End:</strong>{" "}
                    <span className={dateBad ? "text-red-500 font-medium" : ""}>
                      {session.endTime}
                    </span>
                  </p>
                )}
                {session.category && (
                  <p>
                    <strong>Category:</strong> {session.category}
                  </p>
                )}
                {session.track && session.track.length > 0 && (
                  <p>
                    <strong>Track(s):</strong> {session.track.join(", ")}
                  </p>
                )}
                <p className="text-xs text-gray-400">ID: {session.id}</p>
              </CardContent>
            </Card>
          );
        })}
        {filteredSessions.length === 0 && (
          <p className="text-gray-500 text-sm">
            {sessions.length === 0
              ? "No sessions yet."
              : "No sessions match the active filters."}
          </p>
        )}
      </div>

      {/* Dialogs */}
      <SessionForm
        open={form.open}
        initial={form.item}
        onSave={saveSession}
        onClose={() => setForm({ open: false, item: null })}
      />

      <DeleteDialog
        open={deleteTarget !== null}
        name={deleteTarget?.title ?? ""}
        onConfirm={() => {
          if (deleteTarget) deleteSession(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
