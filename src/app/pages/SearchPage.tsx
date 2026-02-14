import { useState, useEffect, useRef } from 'react';
import { ScheduleView } from '@/app/components/ScheduleView';
import { useConference } from '@/app/contexts/ConferenceContext';
import { useSearchParams } from 'react-router-dom';

// Import all session data files at once using Vite's glob import
// This imports all files matching the pattern eagerly (at build time)
const conferenceModules = import.meta.glob('../../data/*-2026.ts', { eager: true });

// Process the modules into a lookup object
const SESSION_DATA: Record<string, MapImage[]> = {};
Object.entries(conferenceModules).forEach(([path, module]: [string, any]) => {
  // Extract the conference ID from the file path
  // e.g., "../../data/pacificon-2026.ts" -> "pacificon-2026"
  const conferenceId = path.split('/').pop()?.replace('.ts', '') || '';
  if (module.sampleSessions) {
    SESSION_DATA[conferenceId] = module.sampleSessions;
  }
});

export function SearchPage() {
  const [bookmarkedSessions, setBookmarkedSessions] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } = useConference();
  const [searchParams] = useSearchParams();
  const highlightSessionId = searchParams.get('highlight');
  const scrollToRef = useRef<HTMLDivElement>(null);
  const sampleSessions = SESSION_DATA[activeConference.id] || [];

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
      <ScheduleView sessions={sampleSessions}
        bookmarkedSessions={bookmarkedSessions}
        onToggleBookmark={handleToggleBookmark}
        highlightSessionId={highlightSessionId || undefined}
      />
    </div>
  );
}
