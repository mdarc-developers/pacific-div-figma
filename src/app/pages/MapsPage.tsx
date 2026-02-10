import { MapsView } from '@/app/components/MapsView';
//import { pacificonData, sampleMaps } from '@/data/pacificon-sample';
import { sampleMaps } from '@/data/pacificon-2026';
import { useConference } from '@/app/contexts/ConferenceContext';

export function MapsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } = useConference();
  return (
    <MapsView
      maps={sampleMaps}
      conference={activeConference}
    />
  );
}
