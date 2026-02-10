import { useState } from 'react';
import { ScheduleView } from '@/app/components/ScheduleView';
import { sampleSessions } from '@/data/pacificon-2026';
//import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useConference } from '@/app/contexts/ConferenceContext';

export function SchedulePage() {
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

  const handleToggleBookmark = (sessionId: string) => {
    setBookmarkedSessions(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  return (
    <div>
      <ScheduleView sessions={sampleSessions}
        bookmarkedSessions={bookmarkedSessions}
        conference={activeConference}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
