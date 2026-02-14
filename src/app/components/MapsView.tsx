import { useState } from 'react';
import { MapImage } from '@/types/conference';
import { Card, CardContent } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Map as MapIcon } from 'lucide-react';
import { useConference } from '@/app/contexts/ConferenceContext';

// Type for the imported conference module
interface ConferenceModule {
  sampleMaps?: MapImage[];
  [key: string]: unknown;
}

// Import all session data files at once using Vite's glob import
// This imports all files matching the pattern eagerly (at build time)
const conferenceModules = import.meta.glob('../../data/*-2026.ts', { eager: true });

// Process the modules into a lookup object
const MAP_DATA: Record<string, MapImage[]> = {};
Object.entries(conferenceModules).forEach(([path, module]) => {
  // Extract the conference ID from the file path
  // e.g., "../../data/pacificon-2026.ts" -> "pacificon-2026"
  const conferenceId = path.split('/').pop()?.replace('.ts', '') || '';
  const typedModule = module as ConferenceModule;
  if (typedModule.sampleMaps) {
    MAP_DATA[conferenceId] = typedModule.sampleMaps;
  }
});

export function MapsView() {
  const { activeConference } = useConference();
  const maps = MAP_DATA[activeConference.id] || [];
  const [selectedMap, setSelectedMap] = useState<string>(maps[0]?.id || '');

  if (maps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MapIcon className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No maps available</p>
      </div>
    );
  }

  const sortedMaps = [...maps].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full">
      <Tabs value={selectedMap} onValueChange={setSelectedMap} className="w-full">
        <TabsList className="w-full mb-6 flex-wrap h-auto">
          {sortedMaps.map(map => (
            <TabsTrigger key={map.id} value={map.id}>
              {map.name} Map
              {map.floor && ` (Floor ${map.floor})`}
            </TabsTrigger>
          ))}
        </TabsList>

        {sortedMaps.map(map => (
          <TabsContent key={map.id} value={map.id}>
            <Card>
              <CardContent className="p-4">
                <div className="w-full overflow-auto">
                  <ImageWithFallback
                    src={map.url}
                    alt={map.name}
                    className="w-full h-auto max-w-full"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                  {map.name}
                  {map.floor && ` - Floor ${map.floor}`}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
