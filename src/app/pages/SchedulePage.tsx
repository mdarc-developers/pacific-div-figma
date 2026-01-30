import { useState } from 'react';
import { ScheduleView } from '@/app/components/ScheduleView';
import { pacificonData, sampleSessions } from '@/data/pacificon-sample';

export function SchedulePage() {
  const [bookmarkedSessions, setBookmarkedSessions] = useState<string[]>([]);

  const handleToggleBookmark = (sessionId: string) => {
    setBookmarkedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  return (
    <ScheduleView 
      sessions={sampleSessions}
      bookmarkedSessions={bookmarkedSessions}
      conference={pacificonData}
      onToggleBookmark={handleToggleBookmark}
    />
  );
}
