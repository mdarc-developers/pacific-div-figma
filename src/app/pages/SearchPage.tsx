import { useState, useEffect, useRef } from 'react';
import { ScheduleView } from '@/app/components/ScheduleView';
import { useConference } from '@/app/contexts/ConferenceContext';
import { useSearchParams } from 'react-router-dom';

export function SearchPage() {
  const [bookmarkedSessions, setBookmarkedSessions] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } = useConference();
  const [searchParams] = useSearchParams();
  const highlightSessionId = searchParams.get('highlight');
  const scrollToRef = useRef<HTMLDivElement>(null);

  // Scroll to highlighted session when it changes
  useEffect(() => {
    if (highlightSessionId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`session-${highlightSessionId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [highlightSessionId]);

  const handleToggleBookmark = (sessionId: string) => {
    setBookmarkedSessions(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  return (
    <div ref={scrollToRef}>
      <ScheduleView
        bookmarkedSessions={bookmarkedSessions}
        onToggleBookmark={handleToggleBookmark}
        highlightSessionId={highlightSessionId || undefined}
      />
    </div>
  );
}
