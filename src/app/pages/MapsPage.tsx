import { MapsView } from '@/app/components/MapsView';
import { pacificonData, sampleMaps } from '@/data/pacificon-sample';

export function MapsPage() {
  return (
    <MapsView
      maps={sampleMaps}
      conference={pacificonData}
    />
  );
}
