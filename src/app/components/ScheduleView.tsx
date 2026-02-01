import { useState } from 'react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Clock, MapPin, User, Bookmark } from 'lucide-react';
import { Session, Conference } from '@/types/conference';
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventInput } from "@fullcalendar/core";

interface ScheduleViewProps {
  sessions: Session[];
  bookmarkedSessions?: string[];
  conference: Conference;
  onToggleBookmark?: (sessionId: string) => void;
}

interface CalendarProps {
  events: EventInput[];
  startDate: string;
}
const Calendar = ({ events, startDate }: CalendarProps) => {
  return (
    <div className="calendar">
      <FullCalendar
        plugins={[timeGridPlugin]}
        initialView="timeGridThreeDay"
        initialDate={startDate}
        events={events}
        //visibleRange={{
        //  start: { startDate },
        //}}
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


export function ScheduleView({ sessions, bookmarkedSessions = [], conference, onToggleBookmark }: ScheduleViewProps) {
  const [selectedDay, setSelectedDay] = useState<string>('all');

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
  function formatSessionTime(timeString: string, tzString: string) {
    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone: conference.timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    const dateObj = new Date(timeString + tzString);
    const timeFormatter = new Intl.DateTimeFormat('en-US', timeOptions);
    return timeFormatter.format(dateObj);
  }

  function formatSessionDate(dateString: string, tzString: string) {
    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: conference.timezone,
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    };
    const dateObj = new Date(dateString + "T11:00:00" + tzString);
    const timeFormatter = new Intl.DateTimeFormat('en-US', dateOptions);
    return timeFormatter.format(dateObj);
  }

  //const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const renderSession = (session: Session) => {
    const isBookmarked = bookmarkedSessions.includes(session.id);

    return (
      <Card key={session.id} className="mb-4">
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
                  className={`h-5 w-5 ${isBookmarked ? 'fill-current text-blue-600' : ''}`}
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
              <span>{formatSessionTime(session.startTime, conference.timezoneNumeric)} - {formatSessionTime(session.endTime, conference.timezoneNumeric)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <MapPin className="h-4 w-4" />
              <span>{session.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <User className="h-4 w-4" />
              <span>{session.speaker}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const calendarEvents: EventInput[] = sessions.map(session => ({
    id: session.id,
    title: session.title,
    start: session.startTime + conference.timezoneNumeric,
    end: session.endTime + conference.timezoneNumeric,
    extendedProps: {
      speaker: session.speaker,
      location: session.location
    }
  }));

  return (
    <div className="w-full">
      <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
        <TabsList className="w-full mb-6 flex-wrap h-auto">
          <TabsTrigger value="all">All Days</TabsTrigger>
          {dateKeys.map(date => (
            <TabsTrigger key={date} value={date}>
              {formatSessionDate(date, conference.timezoneNumeric)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          {dateKeys.map(date => (
            <div key={date} className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{formatSessionDate(date, conference.timezoneNumeric)}</h3>
              {groupedSessions[date]
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(renderSession)}
            </div>
          ))}
        </TabsContent>

        {dateKeys.map(date => (
          <TabsContent key={date} value={date}>
            {groupedSessions[date]
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map(renderSession)}
          </TabsContent>
        ))}
      </Tabs>
      <Calendar events={calendarEvents} startDate={conference.startDate} />
    </div>
  );
}
