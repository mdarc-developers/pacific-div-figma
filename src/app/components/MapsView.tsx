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
import { blendWithWhite, contrastingColor } from "@/lib/colorUtils";
import { MAP_DATA, ROOM_DATA, EXHIBITOR_DATA } from "@/lib/sessionData";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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

  const forumsMapUrl = ROOM_DATA[activeConference.id]?.[0];
  const exhibitorsMapUrl = EXHIBITOR_DATA[activeConference.id]?.[0];

  function getMapDestination(map: MapImage): string | null {
    if (forumsMapUrl && map.url === forumsMapUrl) return "/forums";
    if (exhibitorsMapUrl && map.url === exhibitorsMapUrl) return "/exhibitors";
    return null;
  }

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

  const tabBg = blendWithWhite(activeConference.primaryColor);
  const tabText = contrastingColor(tabBg);

  return (
    <div className="w-full">
      <Tabs
        value={selectedMap}
        onValueChange={setSelectedMap}
        className="w-full"
      >
        <div
          className="rounded-lg p-2 mb-6 w-full"
          style={{ backgroundColor: tabBg, color: tabText }}
        >
          <TabsList className="w-full flex-wrap h-auto bg-transparent">
            {sortedMaps.map((map) => (
              <TabsTrigger key={map.id} value={map.id}>
                {map.name} Map
                {map.floor && ` (Floor ${map.floor})`}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {sortedMaps.map((map) => {
          const destination = getMapDestination(map);
          const destinationLabel =
            destination === "/forums"
              ? "→ View Forums"
              : destination === "/exhibitors"
                ? "→ View Exhibitors"
                : null;
          return (
            <TabsContent key={map.id} value={map.id}>
              <Card>
                <CardContent className="p-4">
                  <div
                    className={`w-full overflow-auto ${destination ? "cursor-pointer" : ""}`.trim()}
                    onClick={
                      destination ? () => navigate(destination) : undefined
                    }
                    title={
                      destinationLabel
                        ? `View interactive ${destinationLabel.slice(2).toLowerCase()} map`
                        : undefined
                    }
                  >
                    {displayImage(map)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                    {map.name}
                    {map.floor && ` - Floor ${map.floor}`}
                    {destinationLabel && (
                      <span className="ml-2 text-blue-600 dark:text-blue-400 underline">
                        {destinationLabel}
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
