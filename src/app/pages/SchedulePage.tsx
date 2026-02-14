import { useState } from 'react';
import { ScheduleView } from '@/app/components/ScheduleView';

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
    <div>
      <ScheduleView
        bookmarkedSessions={bookmarkedSessions}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
