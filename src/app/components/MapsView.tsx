import { useState, useRef, useEffect } from "react";
import { MapImage } from "@/types/conference";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Map as MapIcon } from "lucide-react";
import { useConference } from "@/app/contexts/ConferenceContext";

// Type for the imported conference module
interface ConferenceModule {
  conferenceMaps?: MapImage[];
  [key: string]: unknown;
}

// Import all session data files at once using Vite's glob import
// This imports all files matching the pattern eagerly (at build time)
const conferenceModules = import.meta.glob("../../data/*-20[0-9][0-9].ts", {
  eager: true,
});

// Process the modules into a lookup object
const MAP_DATA: Record<string, MapImage[]> = {};
Object.entries(conferenceModules).forEach(([path, module]) => {
  // Extract the conference ID from the file path
  // e.g., "../../data/pacificon-2026.ts" -> "pacificon-2026"
  const conferenceId = path.split("/").pop()?.replace(".ts", "") || "";
  const typedModule = module as ConferenceModule;
  if (typedModule.conferenceMaps) {
    MAP_DATA[conferenceId] = typedModule.conferenceMaps;
  }
});

/**
 * Renders a PDF inside an <iframe> whose height is automatically derived from
 * the map's original pixel dimensions.  A ResizeObserver watches the wrapper
 * div so the height stays correct on any viewport resize.
 */
function PdfIframe({ map }: { map: MapImage }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const updateHeight = () => {
      if (!wrapperRef.current) return;
      const w = wrapperRef.current.offsetWidth;
      const h =
        map.origHeightNum && map.origWidthNum
          ? Math.round(w * (map.origHeightNum / map.origWidthNum))
          : Math.round(w * (11 / 8.5)); // A4/Letter fallback
      setHeight(h);
    };

    const obs = new ResizeObserver(updateHeight);
    obs.observe(el);
    updateHeight();
    return () => obs.disconnect();
  }, [map.origHeightNum, map.origWidthNum]);

  return (
    <div ref={wrapperRef} className="w-full">
      <iframe
        title={map.name}
        src={map.url}
        className="w-full"
        style={{ height: height > 0 ? `${height}px` : "100vh" }}
      />
    </div>
  );
}

export function MapsView() {
  const { activeConference } = useConference();
  const maps = MAP_DATA[activeConference.id] || [];
  const [selectedMap, setSelectedMap] = useState<string>(maps[0]?.id || "");

  if (maps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MapIcon className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No maps available</p>
      </div>
    );
  }

  const sortedMaps = [...maps].sort((a, b) => a.order - b.order);

  function displayImage(map: MapImage) {
    if (map.url.endsWith("pdf")) {
      return <PdfIframe map={map} />;
    } else {
      return (
        <ImageWithFallback
          src={map.url}
          alt={map.name}
          className="w-full h-auto max-w-full"
        />
      );
    }
  }

  return (
    <div className="w-full">
      <Tabs
        value={selectedMap}
        onValueChange={setSelectedMap}
        className="w-full"
      >
        <div className="rounded-lg p-2 mb-6 w-full">
          <TabsList className="w-full flex-wrap h-auto bg-gray-100 dark:bg-gray-800">
            {sortedMaps.map((map) => (
              <TabsTrigger key={map.id} value={map.id}>
                {map.name} Map
                {map.floor && ` (Floor ${map.floor})`}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {sortedMaps.map((map) => (
          <TabsContent key={map.id} value={map.id}>
            <Card>
              <CardContent className="p-4">
                <div className="w-full overflow-auto">{displayImage(map)}</div>
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
