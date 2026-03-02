import { useState, useEffect } from "react";
import { ExhibitorView } from "@/app/components/ExhibitorView";
import { ExhibitorsMapView } from "@/app/components/ExhibitorsMapView";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useBookmarks } from "@/app/hooks/useBookmarks";
import { useMdarcDeveloper } from "@/app/hooks/useMdarcDeveloper";
import { MapImage } from "@/types/conference";
import { MAP_DATA, BOOTH_DATA, EXHIBITOR_DATA } from "@/lib/sessionData";

export function ExhibitorsPage() {
  const isMdarcDeveloper = useMdarcDeveloper();
  const [highlightedExhibitorId, setHighlightedExhibitorId] = useState<
    string | undefined
  >(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const [bookmarkedExhibitors, handleToggleBookmark] = useBookmarks(
    activeConference.id,
    "exhibitor_bookmarks_",
  );
  const conferenceMaps = MAP_DATA[activeConference.id] || [];
  const boothEntry = BOOTH_DATA[activeConference.id];
  const exhibitorBooths = boothEntry ? boothEntry[1] : [];
  const exhibitorEntry = EXHIBITOR_DATA[activeConference.id];
  const mapExhibitors = exhibitorEntry ? exhibitorEntry[1] : [];
  const numEmaps = activeConference.mapExhibitorBooths.length; // num Exhibitor map

  const [exhibitorsMap, setExhibitorsMap] = useState<MapImage | undefined>(
    () => {
      // Single-map assumption: always pick the map whose URL matches mapBooths[0].
      // TODO: restore `activeConference.mapExhibitorsUrl.length === 1` guard when multi-map is re-enabled.
      const boothMapUrl = boothEntry?.[0];
      if (!boothMapUrl) return undefined;
      return (
        conferenceMaps.find((m) => m.url === boothMapUrl) ||
        undefined
      );
        
      // Multi-map initialiser (disabled — single-map assumption):
      // if (activeConference.mapExhibitorsUrl.length === 1) {
      //   return conferenceMaps.find(m => activeConference.mapExhibitorsUrl.includes(m.url)) || {
      //     order: 1, id: 'map-0', name: 'No Exhibitors Map Found',
      //     url: '/assets/maps/pacificon-exhibitors-2025.png', origHeightNum: 256, origWidthNum: 582
      //   };
      // }
      // return undefined;
    },
  );
  // Multi-map state
  // const [multipleExhibitorMaps, setMultipleExhibitorMaps] = useState<MapImage[]>(() => {
  //   if (activeConference.mapExhibitorsUrl.length > 1) {
  //     return conferenceMaps.filter(m => activeConference.mapExhibitorsUrl.includes(m.url));
  //   }
  //   return [];
  // });

  //const [multipleExhibitorMaps, setMultipleExhibitorMaps] = useState<
  //  MapImage[]
  //>([]);
  //console.log("no longer applicable, one mapExhibitors.url per conference. multipleExhibitorMaps: " + multipleExhibitorMaps);

  useEffect(() => {
    // Single-map assumption: always refresh exhibitorsMap from mapBooths URL.
    // TODO: restore numEmaps > 1 branch when multi-map is re-enabled.
    const boothMapUrl = BOOTH_DATA[activeConference.id]?.[0];
    setExhibitorsMap(
      boothMapUrl
        ? conferenceMaps.find((m) => m.url === boothMapUrl) || {
            order: 1,
            id: "map-0",
            name: "No Exhibitors Map Found",
            url: "/assets/maps/pacificon-exhibitors-2025.png",
            origHeightNum: 256,
            origWidthNum: 582,
          }
        : undefined,
    );
    //setMultipleExhibitorMaps([]);

    // Multi-map branch (disabled — single-map assumption):
    // if (numEmaps === 1) {
    //   setExhibitorsMap(
    //     conferenceMaps.find(m => activeConference.mapExhibitorsUrl.includes(m.url)) || {
    //       order: 1, id: 'map-0', name: 'No Exhibitors Map Found',
    //       url: '/assets/maps/pacificon-exhibitors-2025.png', origHeightNum: 256, origWidthNum: 582
    //     }
    //   );
    //   setMultipleExhibitorMaps([]);
    // } else if (numEmaps > 1) {
    //   const maps = conferenceMaps.filter(m => activeConference.mapExhibitorsUrl.includes(m.url));
    //   if (maps.length === 0) {
    //     console.warn('No matching maps found for URLs:', activeConference.mapExhibitorsUrl);
    //   }
    //   setMultipleExhibitorMaps(maps);
    //   setExhibitorsMap(undefined);
    // }
  }, [activeConference]);

  const handleLocationClick = (exhibitorId: string) => {
    setHighlightedExhibitorId(exhibitorId);
  };

  return (
    <div className="block">
      {isMdarcDeveloper && activeConference.mapExhibitorBooths && (
        <div className="mb-4 p-3 rounded border border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-600 text-xs font-mono text-yellow-900 dark:text-yellow-200">
          <p className="font-semibold mb-1">Developer: mapExhibitorBooths</p>
          <p>URL: {activeConference.mapExhibitorBooths[0]}</p>
          <p>Exhibitors loaded: {String(activeConference.mapExhibitorBooths[1])}</p>
          <p>Booths loaded: {String(activeConference.mapExhibitorBooths[2])}</p>
        </div>
      )}
      {numEmaps === 1 && (
        <ExhibitorsMapView
          exhibitorsMap={exhibitorsMap}
          exhibitorBooths={exhibitorBooths}
          mapExhibitors={mapExhibitors}
          highlightedExhibitorId={highlightedExhibitorId}
          onHighlightChange={setHighlightedExhibitorId}
        />
      )}
      <ExhibitorView
        bookmarkedExhibitors={bookmarkedExhibitors}
        onToggleBookmark={handleToggleBookmark}
        highlightExhibitorId={highlightedExhibitorId}
        onLocationClick={handleLocationClick}
      />
    </div>
  );
}
