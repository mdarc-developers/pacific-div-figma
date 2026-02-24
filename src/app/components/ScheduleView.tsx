import { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Bookmark, Clock, MapPin, Mic, Zap } from 'lucide-react';
import { Session, Conference } from '@/types/conference';
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventInput } from "@fullcalendar/core";
import { useConference } from '@/app/contexts/ConferenceContext';
import { useSearch } from '@/app/contexts/SearchContext';

interface CalendarProps {
  events: EventInput[];
  startDate: string;
}

function formatSessionTime(timeString: string, tzString: string, activeConference: Conference) {
  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: activeConference.timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  const dateObj = new Date(timeString + tzString);
  const timeFormatter = new Intl.DateTimeFormat('en-US', timeOptions);
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
            type: 'timeGrid',
            duration: { days: 3 },
            buttonText: '3 days'
          }
        }}
        headerToolbar={{
          left: 'prev, next today',
          center: 'title',
          right: 'timeGridThreeDay, timeGridDay'
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
}

function SessionCard({ session, isBookmarked, isHighlighted, onToggleBookmark, activeConference, onRoomClick }: SessionCardProps) {
  const sessionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && sessionRef.current) {
      sessionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  return (
    <div
      ref={sessionRef}
      id={`session-${session.id}`}
      className={`mb-4 transition-all ${isHighlighted
        ? 'ring-2 ring-blue-500 shadow-lg scale-105'
        : ''
        }`}
    >
      <Card className={`transition-all ${isHighlighted ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{session.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary">{session.category}</Badge>
                {session.track && <Badge variant="outline">{session.track}</Badge>}
              </div>
            </div>
            {onToggleBookmark && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleBookmark(session.id)}
                className="ml-2"
              >
                <Bookmark
                  className={`h-5 w-5 ${isBookmarked ? 'fill-current text-blue-600' : ''
                    }`}
                />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {session.description}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Clock className="h-4 w-4" />
              <span>
                {formatSessionTime(
                  session.startTime,
                  activeConference.timezoneNumeric,
                  activeConference
                )}{' '}
                -{' '}
                {formatSessionTime(
                  session.endTime,
                  activeConference.timezoneNumeric,
                  activeConference
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
        </CardContent>
      </Card>
    </div>
  );
}

interface SessionModule {
  mapSessions?: [string, Session[]];
  [key: string]: unknown;
}

// Import all session data files at once using Vite's glob import
const sessionModules = import.meta.glob('../../data/*-2026.ts', { eager: true });

// Process the modules into a lookup object
const SESSION_DATA: Record<string, Session[]> = {};
Object.entries(sessionModules).forEach(([path, module]) => {
  const conferenceId = path.split('/').pop()?.replace('.ts', '') || '';
  const typedModule = module as SessionModule;
  if (typedModule.mapSessions) {
    SESSION_DATA[conferenceId] = typedModule.mapSessions;
  }
});

interface ScheduleViewProps {
  bookmarkedSessions?: string[];
  onToggleBookmark?: (sessionId: string) => void;
  highlightSessionId?: string;
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
  highlightSessionId }: ScheduleViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } = useConference();
  const { setHighlightForumRoomName } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const sessions = SESSION_DATA[activeConference.id] || [];
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [showNowAndNext, setShowNowAndNext] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');

  // Collect unique "room" names from all sessions, sorted alphabetically
  const rooms = useMemo(
    () => [...new Set(sessions.map(s => s.location))].sort(),
    [sessions]
  );

  // Apply active filters to a list of sessions
  const applyFilters = (list: Session[]): Session[] => {
    let filtered = list;
    if (showBookmarkedOnly) {
      filtered = filtered.filter(s => bookmarkedSessions.includes(s.id));
    }
    if (showNowAndNext) {
      filtered = filtered.filter(s => isNowOrNext(s, activeConference.timezoneNumeric));
    }
    if (selectedRoom !== 'all') {
      filtered = filtered.filter(s => s.location === selectedRoom);
    }
    return filtered;
  };

  // Group sessions by date
  const groupSessionsByDate = (sessions: Session[]) => {
    const grouped: Record<string, Session[]> = {};
    sessions.forEach(session => {
      const date = session.startTime.split('T')[0];
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
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    };
    const dateObj = new Date(dateString + "T11:00:00" + tzString);
    const timeFormatter = new Intl.DateTimeFormat('en-US', dateOptions);
    return timeFormatter.format(dateObj);
  }

  // Helper to format time for SessionCard
  const formatTime = (timeString: string) =>
    formatSessionTime(timeString, activeConference.timezoneNumeric, activeConference);

  const calendarEvents: EventInput[] = sessions.map(session => ({
    id: session.id,
    title: session.title,
    start: session.startTime + activeConference.timezoneNumeric,
    end: session.endTime + activeConference.timezoneNumeric,
    extendedProps: {
      speaker: session.speaker,
      location: session.location,
      category: session.category,
      url: session.url,
      track: session.track
    }
  }));

  // Navigate to the Forums map and highlight the clicked room
  const handleRoomClick = (roomName: string) => {
    setHighlightForumRoomName(roomName);
    if (location.pathname !== '/forums') {
      navigate('/forums');
    }
  };

  return (
    <div className="w-full">
      {/* Filter toolbar */}
      <div className="flex gap-2 mb-2">
        <Button
          variant={showBookmarkedOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowBookmarkedOnly(v => !v)}
          className="flex items-center gap-1"
        >
          <Bookmark className={`h-4 w-4 ${showBookmarkedOnly ? 'fill-current' : ''}`} />
          Bookmarked
        </Button>
        <Button
          variant={showNowAndNext ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowNowAndNext(v => !v)}
          className="flex items-center gap-1"
        >
          <Zap className="h-4 w-4" />
          Now &amp; Next
        </Button>
      </div>

      {/* Room filter row */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          variant={selectedRoom === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedRoom('all')}
          className="flex items-center gap-1"
        >
          <MapPin className="h-4 w-4" />
          All Rooms
        </Button>
        {rooms.map(room => (
          <Button
            key={room}
            variant={selectedRoom === room ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRoom(selectedRoom === room ? 'all' : room)}
            className="flex items-center gap-1"
          >
            <MapPin className="h-4 w-4" />
            {room}
          </Button>
        ))}
      </div>

      <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
        <TabsList className="w-full mb-6 flex-wrap h-auto">
          <TabsTrigger value="all">All Days</TabsTrigger>
          {dateKeys.map(date => (
            <TabsTrigger key={date} value={date}>
              {formatSessionDate(date, activeConference.timezoneNumeric)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          {dateKeys.map(date => {
            const filtered = applyFilters(groupedSessions[date]).sort((a, b) =>
              a.startTime.localeCompare(b.startTime)
            );
            if (filtered.length === 0) return null;
            return (
              <div key={date} className="mb-8">
                <h3 className="text-xl font-semibold mb-4">
                  {formatSessionDate(date, activeConference.timezoneNumeric)}
                </h3>
                {filtered.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isBookmarked={bookmarkedSessions.includes(session.id)}
                    isHighlighted={highlightSessionId === session.id}
                    onToggleBookmark={onToggleBookmark}
                    formatTime={formatTime}
                    activeConference={activeConference}
                    onRoomClick={handleRoomClick}
                  />
                ))}
              </div>
            );
          })}
          {dateKeys.every(date => applyFilters(groupedSessions[date]).length === 0) && (
            <p className="text-center text-gray-500 py-8">No sessions match the active filters.</p>
          )}
        </TabsContent>

        {dateKeys.map(date => {
          const filtered = applyFilters(groupedSessions[date]).sort((a, b) =>
            a.startTime.localeCompare(b.startTime)
          );
          return (
            <TabsContent key={date} value={date}>
              {filtered.length > 0
                ? filtered.map(session => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      isBookmarked={bookmarkedSessions.includes(session.id)}
                      isHighlighted={highlightSessionId === session.id}
                      onToggleBookmark={onToggleBookmark}
                      formatTime={formatTime}
                      activeConference={activeConference}
                      onRoomClick={handleRoomClick}
                    />
                  ))
                : <p className="text-center text-gray-500 py-8">No sessions match the active filters.</p>
              }
            </TabsContent>
          );
        })}
      </Tabs>
      <Calendar events={calendarEvents} startDate={activeConference.startDate} />
    </div>
  );
}
