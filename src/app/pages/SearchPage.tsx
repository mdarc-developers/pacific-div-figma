import { useState, useEffect, useRef } from 'react';
import { ScheduleView } from '@/app/components/ScheduleView';
import { sampleSessions } from '@/data/pacificon-2026';
//import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useConference } from '@/app/contexts/ConferenceContext';
import { useSearchParams } from 'react-router-dom';


export function SearchPage() {
  const [bookmarkedSessions, setBookmarkedSessions] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } = useConference();
//  const map = {
//    order: '2',
//    id: 'map-2',
//    conferenceId: 'pacificon-2026',
//    name: 'Forums',
//    url: '/pacificon-forums-2025.jpg',
//  }
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
      <ScheduleView sessions={sampleSessions}
        bookmarkedSessions={bookmarkedSessions}
        conference={activeConference}
        onToggleBookmark={handleToggleBookmark}
        highlightSessionId={highlightSessionId || undefined}
      />
    </div>
  );
}
