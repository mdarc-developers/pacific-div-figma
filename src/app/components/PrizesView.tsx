import { useRef, useEffect, useState } from 'react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Clock, MapPin, Mic } from 'lucide-react';
import { Session, Conference } from '@/types/conference';
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventInput } from "@fullcalendar/core";
import { useConference } from '@/app/contexts/ConferenceContext';

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

interface SessionCardProps {
  isHighlighted: boolean;
  activeConference: Conference;
}

function SessionCard({ session, isHighlighted, activeConference }: SessionCardProps) {
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
              <span>{session.location}</span>
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
  sampleSessions?: Session[];
  [key: string]: unknown;
}

// Import all session data files at once using Vite's glob import
const sessionModules = import.meta.glob('../../data/*-2026.ts', { eager: true });

// Process the modules into a lookup object
const SESSION_DATA: Record<string, Session[]> = {};
Object.entries(sessionModules).forEach(([path, module]) => {
  const conferenceId = path.split('/').pop()?.replace('.ts', '') || '';
  const typedModule = module as SessionModule;
  if (typedModule.sampleSessions) {
    SESSION_DATA[conferenceId] = typedModule.sampleSessions;
  }
});

interface PrizesViewProps {
  highlightPrizeId?: string;
}

export function PrizesView({
  highlightPrizeId }: PrizesViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } = useConference();
  const sessions = SESSION_DATA[activeConference.id] || [];
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
              {formatSessionDate(date, activeConference.timezoneNumeric)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          {dateKeys.map(date => (
            <div key={date} className="mb-8">
              <h3 className="text-xl font-semibold mb-4">
                {formatSessionDate(date, activeConference.timezoneNumeric)}
              </h3>
              {groupedSessions[date]
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    activeConference={activeConference}
                  />
                ))}
            </div>
          ))}
        </TabsContent>

        {dateKeys.map(date => (
          <TabsContent key={date} value={date}>
            {groupedSessions[date]
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isHighlighted={highlightPrizeId === session.id}
                  activeConference={activeConference}
                />
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
