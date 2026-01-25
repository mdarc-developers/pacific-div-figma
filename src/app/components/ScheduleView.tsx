import { useState } from 'react';
import { Session } from '@/types/conference';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Clock, MapPin, User, Bookmark } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface ScheduleViewProps {
  sessions: Session[];
  bookmarkedSessions?: string[];
  onToggleBookmark?: (sessionId: string) => void;
}

export function ScheduleView({ sessions, bookmarkedSessions = [], onToggleBookmark }: ScheduleViewProps) {
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
  const dates = Object.keys(groupedSessions).sort();

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

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
              <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
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

  return (
    <div className="w-full">
      <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
        <TabsList className="w-full mb-6 flex-wrap h-auto">
          <TabsTrigger value="all">All Days</TabsTrigger>
          {dates.map(date => (
            <TabsTrigger key={date} value={date}>
              {formatDate(date)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          {dates.map(date => (
            <div key={date} className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{formatDate(date)}</h3>
              {groupedSessions[date]
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(renderSession)}
            </div>
          ))}
        </TabsContent>

        {dates.map(date => (
          <TabsContent key={date} value={date}>
            {groupedSessions[date]
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map(renderSession)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
