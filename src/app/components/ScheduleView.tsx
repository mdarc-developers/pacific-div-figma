import { useRef, useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
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
import {
  Bookmark,
  Clock,
  MapPin,
  Mic,
  StickyNote,
  Star,
  User,
  Zap,
} from "lucide-react";
import { Session, Conference, PublicAttendeeProfile } from "@/types/conference";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventInput } from "@fullcalendar/core";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useSearch } from "@/app/contexts/SearchContext";
import { blendWithWhite, contrastingColor } from "@/lib/colorUtils";
import {
  formatUpdateToken,
  formatUpdateTokenDetail,
} from "@/lib/overrideUtils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/app/components/ui/tooltip";
import {
  SESSION_DATA,
  SESSION_SUPPLEMENTAL_TOKEN,
} from "@/lib/supplementalData";
import { usePublicAttendees } from "@/app/hooks/usePublicAttendees";
import { useSpeakerSessions } from "@/app/hooks/useSpeakerSessions";
import { useProfileVisible } from "@/app/hooks/useProfileVisible";

interface CalendarProps {
  events: EventInput[];
  startDate: string;
}

function isValidDateTimeString(s: string): boolean {
  return s.length > 0 && !isNaN(new Date(s).getTime());
}

function formatSessionTime(
  timeString: string,
  tzString: string,
  activeConference: Conference,
) {
  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: activeConference.timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const dateObj = new Date(timeString + tzString);
  const timeFormatter = new Intl.DateTimeFormat("en-US", timeOptions);
  return timeFormatter.format(dateObj);
}

const Calendar = ({ events, startDate }: CalendarProps) => {
  return (
    <div className="calendar">
      <FullCalendar
        plugins={[timeGridPlugin]}
        initialView="timeGridThreeDay"
        initialDate={startDate}
        events={events}
        views={{
          timeGridThreeDay: {
            type: "timeGrid",
            duration: { days: 3 },
            buttonText: "3 days",
          },
        }}
        headerToolbar={{
          left: "prev, next today",
          center: "title",
          right: "timeGridThreeDay, timeGridDay",
        }}
      />
    </div>
  );
};

// NEW: Separate component for individual session
interface SessionCardProps {
  session: Session;
  isBookmarked: boolean;
  isHighlighted: boolean;
  onToggleBookmark?: (sessionId: string) => void;
  formatTime: (timeString: string) => string;
  activeConference: Conference;
  onRoomClick?: (roomName: string) => void;
  note?: string;
  onSaveNote?: (sessionId: string, text: string) => void;
  bookmarkCount?: number;
  isVoted?: boolean;
  onToggleVote?: (sessionId: string) => void;
  voteCount?: number;
  /** Public attendees who have self-registered as presenters for this session. */
  sessionPresenters?: PublicAttendeeProfile[];
  /** Whether the current logged-in user has selected this session as a presenter. */
  currentUserIsSpeaker?: boolean;
  /** Whether the current user's attendee profile is public. */
  currentUserProfileVisible?: boolean;
}

function SessionCard({
  session,
  isBookmarked,
  isHighlighted,
  onToggleBookmark,
  activeConference,
  onRoomClick,
  note,
  onSaveNote,
  bookmarkCount,
  isVoted,
  onToggleVote,
  voteCount,
  sessionPresenters = [],
  currentUserIsSpeaker = false,
  currentUserProfileVisible = false,
}: SessionCardProps) {
  const sessionRef = useRef<HTMLDivElement>(null);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [draftNote, setDraftNote] = useState(note ?? "");

  // Keep draft in sync if the saved note changes externally (e.g. Firestore load),
  // but only when the editor is not currently open to avoid discarding in-progress edits.
  useEffect(() => {
    if (!showNoteEditor) {
      setDraftNote(note ?? "");
    }
  }, [note, showNoteEditor]);

  useEffect(() => {
    if (isHighlighted && sessionRef.current) {
      sessionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isHighlighted]);

  const handleSaveNote = () => {
    onSaveNote?.(session.id, draftNote);
    setShowNoteEditor(false);
  };

  const handleCancelNote = () => {
    setDraftNote(note ?? "");
    setShowNoteEditor(false);
  };

  return (
    <div
      ref={sessionRef}
      id={`session-${session.id}`}
      className={`mb-4 transition-all ${
        isHighlighted ? "ring-2 ring-blue-500 shadow-lg scale-105" : ""
      }`}
    >
      <Card
        className={`transition-all ${isHighlighted ? "ring-2 ring-blue-500 shadow-lg scale-105" : ""}`}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{session.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary">{session.category}</Badge>
                {session.track && (
                  <Badge variant="outline">{session.track}</Badge>
                )}
              </div>
            </div>
            {onToggleBookmark && (
              <div className="flex items-center gap-1 ml-2 shrink-0">
                {bookmarkCount !== undefined && bookmarkCount >= 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {bookmarkCount}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleBookmark(session.id)}
                >
                  <Bookmark
                    className={`h-5 w-5 ${
                      isBookmarked ? "fill-current text-blue-600" : ""
                    }`}
                  />
                </Button>
              </div>
            )}
            {onToggleVote && (
              <div className="flex items-center gap-1 ml-1 shrink-0">
                {voteCount !== undefined && voteCount >= 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {voteCount}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleVote(session.id)}
                  aria-label={isVoted ? "Remove vote" : "Vote for this session"}
                >
                  <Star
                    className={`h-5 w-5 ${
                      isVoted ? "fill-current text-yellow-500" : ""
                    }`}
                  />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {session.description}
          </p>
          {/* Registered attendee presenters for this session */}
          {(sessionPresenters.length > 0 ||
            (currentUserIsSpeaker && !currentUserProfileVisible)) && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {sessionPresenters.map((presenter) => (
                <Button
                  key={presenter.uid}
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                >
                  <Link to={`/attendees?highlight=${presenter.uid}`}>
                    <User className="h-3 w-3" />
                    {presenter.displayName || presenter.callsign || "Attendee"}
                  </Link>
                </Button>
              ))}
              {currentUserIsSpeaker && !currentUserProfileVisible && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="h-7 text-xs gap-1 opacity-50 cursor-not-allowed"
                  title="Make your profile public in /profile to show your name here"
                >
                  <User className="h-3 w-3" />
                  You (profile private)
                </Button>
              )}
            </div>
          )}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Clock className="h-4 w-4" />
              <span>
                {formatSessionTime(
                  session.startTime,
                  activeConference.timezoneNumeric,
                  activeConference,
                )}{" "}
                -{" "}
                {formatSessionTime(
                  session.endTime,
                  activeConference.timezoneNumeric,
                  activeConference,
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <MapPin className="h-4 w-4" />
              {onRoomClick ? (
                <button
                  type="button"
                  className="underline decoration-dotted hover:text-blue-600 cursor-pointer"
                  onClick={() => onRoomClick(session.location)}
                >
                  {session.location}
                </button>
              ) : (
                <span>{session.location}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Mic className="h-4 w-4" />
              <span>{session.speaker}</span>
            </div>
          </div>
          {/* Notes section — only shown when the parent provides a save handler */}
          {onSaveNote && (
            <div className="mt-3">
              {note && !showNoteEditor && (
                <div
                  className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-2 mb-2 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                  onClick={() => setShowNoteEditor(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setShowNoteEditor(true)
                  }
                  aria-label="Edit note"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <StickyNote className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-medium text-yellow-700 dark:text-yellow-400 text-xs">
                      My Note
                    </span>
                  </div>
                  <p className="line-clamp-3 whitespace-pre-wrap">{note}</p>
                </div>
              )}
              {showNoteEditor ? (
                <div className="space-y-2">
                  <Textarea
                    value={draftNote}
                    onChange={(e) => setDraftNote(e.target.value)}
                    placeholder="Type your notes here…"
                    className="text-sm min-h-[80px]"
                    autoFocus
                    aria-label="Session note"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveNote}>
                      Save Note
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelNote}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNoteEditor(true)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-0"
                >
                  <StickyNote className="h-3.5 w-3.5" />
                  {note ? "Edit Note" : "Add Note"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ScheduleViewProps {
  bookmarkedSessions?: string[];
  onToggleBookmark?: (sessionId: string) => void;
  highlightSessionId?: string;
  categoryFilter?: string;
  trackFilter?: string;
  notes?: Record<string, string>;
  onSaveNote?: (sessionId: string, text: string) => void;
  /** Aggregate bookmark counts keyed by session id. */
  sessionBookmarkCounts?: Record<string, number>;
  /** Sessions the current user has voted for. */
  votedSessions?: string[];
  onToggleSessionVote?: (sessionId: string) => void;
  /** Aggregate vote counts keyed by session id. */
  sessionVoteCounts?: Record<string, number>;
}

// Returns true if the session is currently happening or starts within the next 2 hours
function isNowOrNext(session: Session, tzString: string): boolean {
  const now = Date.now();
  const start = new Date(session.startTime + tzString).getTime();
  const end = new Date(session.endTime + tzString).getTime();
  const twoHoursMs = 2 * 60 * 60 * 1000;
  return end > now && start <= now + twoHoursMs;
}

export function ScheduleView({
  bookmarkedSessions = [],
  onToggleBookmark,
  highlightSessionId,
  categoryFilter,
  trackFilter,
  notes,
  onSaveNote,
  sessionBookmarkCounts = {},
  votedSessions = [],
  onToggleSessionVote,
  sessionVoteCounts = {},
}: ScheduleViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const { setHighlightForumRoomName } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const sessions = (SESSION_DATA[activeConference.id] || []).filter(
    (s) =>
      isValidDateTimeString(s.startTime) &&
      // When categoryFilter is set, only sessions whose category matches (case-insensitive) are included.
      // Sessions without a category are intentionally excluded when filtering.
      (!categoryFilter ||
        s.category?.toLowerCase() === categoryFilter.toLowerCase()) &&
      // When trackFilter is set, only sessions whose track array includes it are included.
      (!trackFilter || s.track?.includes(trackFilter)),
  );
  const updateToken = SESSION_SUPPLEMENTAL_TOKEN[activeConference.id];
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [showNowAndNext, setShowNowAndNext] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>("all");

  // Load public attendees to show self-registered presenters on session cards.
  const { attendees: publicAttendees } = usePublicAttendees();
  // Current user's speaker sessions and profile visibility for the greyed-out button.
  const { speakerSessions: userSpeakerSessions } = useSpeakerSessions(
    activeConference.id,
  );
  const { profileVisible: userProfileVisible } = useProfileVisible();

  // Build a map from sessionId → list of public attendees who registered as presenter.
  const sessionPresentersMap = useMemo(() => {
    const map = new Map<string, PublicAttendeeProfile[]>();
    for (const attendee of publicAttendees) {
      const sessions =
        attendee.speakerSessions?.[activeConference.id] ?? [];
      for (const sid of sessions) {
        const list = map.get(sid) ?? [];
        list.push(attendee);
        map.set(sid, list);
      }
    }
    return map;
  }, [publicAttendees, activeConference.id]);

  // Collect unique "room" names from all sessions, sorted alphabetically
  const collectedRooms = useMemo(
    () => [...new Set(sessions.map((s) => s.location))].sort(),
    [sessions],
  );

  // Apply active filters to a list of sessions
  const applyFilters = (list: Session[]): Session[] => {
    let filtered = list;
    if (showBookmarkedOnly) {
      filtered = filtered.filter((s) => bookmarkedSessions.includes(s.id));
    }
    if (showNowAndNext) {
      filtered = filtered.filter((s) =>
        isNowOrNext(s, activeConference.timezoneNumeric),
      );
    }
    if (selectedRoom !== "all") {
      filtered = filtered.filter((s) => s.location === selectedRoom);
    }
    return filtered;
  };

  // Group sessions by date
  const groupSessionsByDate = (sessions: Session[]) => {
    const grouped: Record<string, Session[]> = {};
    sessions.forEach((session) => {
      const date = session.startTime.split("T")[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });
    return grouped;
  };

  const groupedSessions = groupSessionsByDate(sessions);
  const dateKeys = Object.keys(groupedSessions).sort();

  function formatSessionDate(dateString: string, tzString: string) {
    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: activeConference.timezone,
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    const dateObj = new Date(dateString + "T11:00:00" + tzString);
    const timeFormatter = new Intl.DateTimeFormat("en-US", dateOptions);
    return timeFormatter.format(dateObj);
  }

  // Helper to format time for SessionCard
  const formatTime = (timeString: string) =>
    formatSessionTime(
      timeString,
      activeConference.timezoneNumeric,
      activeConference,
    );

  const calendarEvents: EventInput[] = sessions.map((session) => ({
    id: session.id,
    title: session.title,
    start: session.startTime + activeConference.timezoneNumeric,
    end: session.endTime + activeConference.timezoneNumeric,
    extendedProps: {
      speaker: session.speaker,
      location: session.location,
      category: session.category,
      url: session.url,
      track: session.track,
    },
  }));

  // Navigate to the Forums map and highlight the clicked room
  const handleRoomClick = (roomName: string) => {
    setHighlightForumRoomName(roomName);
    if (location.pathname !== "/forums") {
      navigate("/forums");
    }
  };

  const tabBg = blendWithWhite(activeConference.primaryColor);
  const tabText = contrastingColor(tabBg);

  return (
    <div className="w-full">
      <Tabs
        value={selectedDay}
        onValueChange={setSelectedDay}
        className="w-full"
      >
        <div
          className="rounded-lg p-2 mb-6 w-full"
          style={{ backgroundColor: tabBg, color: tabText }}
        >
          {/* Filter toolbar */}
          <div className="flex gap-2 mb-2 justify-center">
            <Button
              variant={showBookmarkedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowBookmarkedOnly((v) => !v)}
              className="flex items-center gap-1"
            >
              <Bookmark
                className={`h-4 w-4 ${showBookmarkedOnly ? "fill-current" : ""}`}
              />
              Bookmarked
            </Button>
            <Button
              variant={showNowAndNext ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowNowAndNext((v) => {
                  if (!v) setSelectedDay("all");
                  return !v;
                });
              }}
              className="flex items-center gap-1"
            >
              <Zap className="h-4 w-4" />
              Now &amp; Next
            </Button>
          </div>

          {/* Room filter row */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button
              variant={selectedRoom === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRoom("all")}
              className="flex items-center gap-1"
            >
              <MapPin className="h-4 w-4" />
              All Rooms
            </Button>
            {collectedRooms.map((room) => (
              <Button
                key={room}
                variant={selectedRoom === room ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setSelectedRoom(selectedRoom === room ? "all" : room)
                }
                className="flex items-center gap-1"
              >
                <MapPin className="h-4 w-4" />
                {room}
              </Button>
            ))}
          </div>

          <TabsList className="w-full flex-wrap h-auto bg-transparent">
            <TabsTrigger value="all">All Days</TabsTrigger>
            {dateKeys.map((date) => (
              <TabsTrigger key={date} value={date}>
                {formatSessionDate(date, activeConference.timezoneNumeric)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="all">
          {dateKeys.map((date) => {
            const filtered = applyFilters(groupedSessions[date]).sort((a, b) =>
              a.startTime.localeCompare(b.startTime),
            );
            if (filtered.length === 0) return null;
            return (
              <div key={date} className="mb-8">
                <h3 className="text-xl font-semibold mb-4">
                  {formatSessionDate(date, activeConference.timezoneNumeric)}
                </h3>
                {filtered.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isBookmarked={bookmarkedSessions.includes(session.id)}
                    isHighlighted={highlightSessionId === session.id}
                    onToggleBookmark={onToggleBookmark}
                    formatTime={formatTime}
                    activeConference={activeConference}
                    onRoomClick={handleRoomClick}
                    note={notes?.[session.id]}
                    onSaveNote={onSaveNote}
                    bookmarkCount={sessionBookmarkCounts[session.id]}
                    isVoted={votedSessions.includes(session.id)}
                    onToggleVote={onToggleSessionVote}
                    voteCount={sessionVoteCounts[session.id]}
                    sessionPresenters={
                      sessionPresentersMap.get(session.id) ?? []
                    }
                    currentUserIsSpeaker={userSpeakerSessions.includes(
                      session.id,
                    )}
                    currentUserProfileVisible={userProfileVisible}
                  />
                ))}
              </div>
            );
          })}
          {dateKeys.every(
            (date) => applyFilters(groupedSessions[date]).length === 0,
          ) && (
            <p className="text-center text-gray-500 py-8">
              No sessions match the active filters.
            </p>
          )}
        </TabsContent>

        {dateKeys.map((date) => {
          const filtered = applyFilters(groupedSessions[date]).sort((a, b) =>
            a.startTime.localeCompare(b.startTime),
          );
          return (
            <TabsContent key={date} value={date}>
              {filtered.length > 0 ? (
                filtered.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isBookmarked={bookmarkedSessions.includes(session.id)}
                    isHighlighted={highlightSessionId === session.id}
                    onToggleBookmark={onToggleBookmark}
                    formatTime={formatTime}
                    activeConference={activeConference}
                    onRoomClick={handleRoomClick}
                    note={notes?.[session.id]}
                    onSaveNote={onSaveNote}
                    bookmarkCount={sessionBookmarkCounts[session.id]}
                    isVoted={votedSessions.includes(session.id)}
                    onToggleVote={onToggleSessionVote}
                    voteCount={sessionVoteCounts[session.id]}
                    sessionPresenters={
                      sessionPresentersMap.get(session.id) ?? []
                    }
                    currentUserIsSpeaker={userSpeakerSessions.includes(
                      session.id,
                    )}
                    currentUserProfileVisible={userProfileVisible}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No sessions match the active filters.
                </p>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
      <Calendar
        events={calendarEvents}
        startDate={activeConference.startDate}
      />
      {updateToken && (
        <p className="text-xs text-gray-400 mt-4">
          Updated:{" "}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="underline decoration-dotted cursor-help"
              >
                {formatUpdateToken(updateToken)}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {formatUpdateTokenDetail(updateToken)}
            </TooltipContent>
          </Tooltip>
        </p>
      )}
    </div>
  );
}
