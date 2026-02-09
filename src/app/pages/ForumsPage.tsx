import { useState } from 'react';
import { ScheduleView } from '@/app/components/ScheduleView';
import { pacificonData, sampleSessions } from '@/data/pacificon-sample';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export function ForumsPage() {
  const [bookmarkedSessions, setBookmarkedSessions] = useState<string[]>([]);
  const map = {
    order: '2',
    id: 'map-2',
    conferenceId: 'pacificon-2026',
    name: 'Forums',
    url: '/pacificon-forums-2025.jpg',
    height: '256px',
    width: '582px',
  }

  const handleToggleBookmark = (sessionId: string) => {
    setBookmarkedSessions(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  //const imageElement = document.getElementById("forums-map");
  //imageElement.addEventListener("load", () => {
  //    const renderedHeight = imageElement.getBoundingClientRect().height;
  //});

  return (
    <div>
      <div className="w-full overflow-auto p-8">
        <ImageWithFallback
          src={map.url}
          alt={map.name}
          className="w-full h-auto max-w-full"
          height={map.height}
          width={map.width}
        />
      </div>
      <ScheduleView sessions={sampleSessions}
        bookmarkedSessions={bookmarkedSessions}
        conference={pacificonData}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
