import { useState } from 'react';
import { ExhibitorView } from '@/app/components/ExhibitorView';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useConference } from '@/app/contexts/ConferenceContext';
import { MapImage, Booth } from '@/types/conference';

interface MapsModule {
  sampleMaps?: MapImage[];
  [key: string]: unknown;
}

interface BoothModule {
  exhibitorBooths?: Booth[];
  [key: string]: unknown;
}

// Import all session data files at once using Vite's glob import
// This imports all files matching the pattern eagerly (at build time)
const conferenceModules = import.meta.glob('../../data/*-2026.ts', { eager: true });

// Process the modules into a lookup object
const MAP_DATA: Record<string, MapImage[]> = {};
const BOOTH_DATA: Record<string, Booth[]> = {};
Object.entries(conferenceModules).forEach(([path, module]) => {
  // Extract the conference ID from the file path
  // e.g., "../../data/pacificon-2026.ts" -> "pacificon-2026"
  const conferenceId = path.split('/').pop()?.replace('.ts', '') || '';
  const typedMapModule = module as MapsModule;
  const typedBoothModule = module as BoothModule;
  if (typedMapModule.sampleMaps) {
    MAP_DATA[conferenceId] = typedMapModule.sampleMaps;
  }
  if (typedBoothModule.exhibitorBooths) {
    BOOTH_DATA[conferenceId] = typedBoothModule.exhibitorBooths;
  }
});

export function ExhibitorsPage() {
  const [bookmarkedExhibitors, setBookmarkedExhibitors] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } = useConference();
  const sampleMaps = MAP_DATA[activeConference.id] || [];
  const numEmaps = activeConference.mapExhibitorsUrl?.length || 0;

  let exhibitorsMap: MapImage | undefined;
  let multipleExhibitorMaps: MapImage[] = [];

  if (numEmaps === 1) {
    exhibitorsMap = sampleMaps.find(m => activeConference.mapExhibitorsUrl.includes(m.url)) ||
    {
      order: 1,
      id: 'map-0',
      conferenceId: activeConference.id || 'unknown',
      name: 'No Exhibitors Map Found',
      url: '/pacificon-exhibitors-2025.png',
      origHeightNum: 256,
      origWidthNum: 582
    };
  } else if (numEmaps > 1) {
    //for (const element of activeConference.mapExhibitorsUrl) {
    //const foundMap = sampleMaps.find(m => m.url === element)
    //if ( foundMap ) { multipleExhibitorMaps.push(foundMap);
    // Filter approach is cleaner and handles edge cases better
    multipleExhibitorMaps = sampleMaps.filter(m =>
      activeConference.mapExhibitorsUrl.includes(m.url)
    );

    // Fallback if no matches found
    if (multipleExhibitorMaps.length === 0) {
      console.warn('No matching maps found for URLs:', activeConference.mapExhibitorsUrl);
    }
  }

  const handleToggleBookmark = (exhibitorId: string) => {
    setBookmarkedExhibitors(prev =>
      prev.includes(exhibitorId)
        ? prev.filter(id => id !== exhibitorId)
        : [...prev, exhibitorId]
    );
  };

  const displaymaps = (x: number) => {
    if (x === 1 && exhibitorsMap) {
      return (
        <>
          <ImageWithFallback
            src={exhibitorsMap.url}
            alt={exhibitorsMap.name}
            className="w-full h-auto max-w-full"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
            {exhibitorsMap.name}
          </p>
        </>
      );
    } else if (x > 1 && multipleExhibitorMaps.length > 0) {
      return (
        <>
          {multipleExhibitorMaps.map((img) => (
            <div key={img.id}>
              <ImageWithFallback
                src={img.url}
                alt={img.name}
                className="w-full h-auto max-w-full"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                {img.name}
              </p>
            </div>
          ))}
        </>
      );
    } else if (x > 1 && multipleExhibitorMaps.length === 0) {
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          No exhibitor maps available
        </p>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="w-full overflow-auto">
        {displaymaps(numEmaps)}
      </div>
      <ExhibitorView
        bookmarkedExhibitors={bookmarkedExhibitors}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
