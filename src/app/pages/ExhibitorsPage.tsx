import { MapsView } from '@/app/components/MapsView';
import { useConference } from '@/app/contexts/ConferenceContext';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export function ExhibitorsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //const { activeConference, allConferencesList, setActiveConference } = useConference();
  const map = {
    order: 1,
    id: 'map-1',
    conferenceId: 'pacificon-2026',
    name: 'Exhibitors',
    url: '/pacificon-exhibitors-2025.png',
  }
  return (
    <div>
      <div className="w-full overflow-auto">
        <ImageWithFallback
          src={map.url}
          alt={map.name}
          className="w-full h-auto max-w-full"
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
        {map.name}
      </p>
    </div>
  );
}

