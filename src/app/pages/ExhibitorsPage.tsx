import { useState, useEffect, useRef } from 'react';
import { ExhibitorView } from '@/app/components/ExhibitorView';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useConference } from '@/app/contexts/ConferenceContext';
import { MapImage, Booth, Exhibitor } from '@/types/conference';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapsModule {
  sampleMaps?: MapImage[];
  [key: string]: unknown;
}

interface BoothModule {
  exhibitorBooths?: Booth[];
  [key: string]: unknown;
}

interface ExhibitorModule {
  sampleExhibitors?: Exhibitor[];
  [key: string]: unknown;
}

// Import all session data files at once using Vite's glob import
// This imports all files matching the pattern eagerly (at build time)
const conferenceModules = import.meta.glob('../../data/*-2026.ts', { eager: true });

// Process the modules into a lookup object
const MAP_DATA: Record<string, MapImage[]> = {};
const BOOTH_DATA: Record<string, Booth[]> = {};
const EXHIBITOR_DATA: Record<string, Exhibitor[]> = {};
Object.entries(conferenceModules).forEach(([path, module]) => {
  // Extract the conference ID from the file path
  // e.g., "../../data/pacificon-2026.ts" -> "pacificon-2026"
  const conferenceId = path.split('/').pop()?.replace('.ts', '') || '';
  const typedMapModule = module as MapsModule;
  const typedBoothModule = module as BoothModule;
  const typedExhibitorModule = module as ExhibitorModule;
  if (typedMapModule.sampleMaps) {
    MAP_DATA[conferenceId] = typedMapModule.sampleMaps;
  }
  if (typedBoothModule.exhibitorBooths) {
    BOOTH_DATA[conferenceId] = typedBoothModule.exhibitorBooths;
  }
  if (typedExhibitorModule.sampleExhibitors) {
    EXHIBITOR_DATA[conferenceId] = typedExhibitorModule.sampleExhibitors;
  }
});

export function ExhibitorsPage() {
  const [bookmarkedExhibitors, setBookmarkedExhibitors] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } = useConference();
  const sampleMaps = MAP_DATA[activeConference.id] || [];
  const exhibitorBooths = BOOTH_DATA[activeConference.id] || [];
  const sampleExhibitors = EXHIBITOR_DATA[activeConference.id] || [];
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const numEmaps = activeConference.mapExhibitorsUrl.length || 0;
  const boothToName = new Map();

  for (const ex of sampleExhibitors) {
    for (const boo in ex.location) {
      //console.log(ex.location[boo].toString() + " " + ex.name);
      boothToName.set(ex.location[boo], ex.name);
    }
  };
  //const foundMap = sampleMaps.find(m => m.url === element)
  //if ( foundMap ) { multipleExhibitorMaps.push(foundMap);

  let exhibitorsMap: MapImage | undefined; // singleton
  let multipleExhibitorMaps: MapImage[] = [];

  useEffect(() => {
    if (!mapRef.current) return;

    const setHeight = () => {
      if (!mapRef.current) return;
      const calcW = mapRef.current.offsetWidth;
      const calcH = Math.round(calcW * origAspect(exhibitorsMap.origHeightNum, exhibitorsMap.origWidthNum));
      mapRef.current.style.height = `${calcH}px`;
      leafletRef.current?.invalidateSize();
    };

    // ResizeObserver is more reliable than window resize for element-level changes
    const resizObs = new ResizeObserver(setHeight);
    resizObs.observe(mapRef.current);

    setHeight(); // Set correct height on first mount

    return () => resizObs.disconnect();
  }, []); // Empty dependency array ensures this runs once when mounted

  // Leaflet exhibitorsMap initialisation — runs once on mount
  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize exhibitorsMap instance
    const leafletMap = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -1,
      maxZoom: 1,
      zoomSnap: 0,
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: false,
      tapHold: false,
      bounceAtZoomLimits: true,
    });

    // ... (rest of your exhibitorsMap initialization code) ...
    // Click handler for finding coordinates while building room polygons
    leafletMap.on('click', (e) => {
      const { lat, lng } = e.latlng;
      //console.log(`Clicked: [${lat.toFixed(1)}, ${lng.toFixed(1)}]`);
    });

    const bounds: L.LatLngBoundsExpression = [
      [0, 0],
      [exhibitorsMap.origHeightNum || 256, exhibitorsMap.origWidthNum || 582],
    ];

    // debug line
    //console.log('exhibitorsMap at Leaflet init:', exhibitorsMap.origHeightNum, exhibitorsMap.origWidthNum);

    L.imageOverlay(exhibitorsMap.url, bounds).addTo(leafletMap);
    leafletMap.fitBounds(bounds);

    // The initial setTimeout is usually fine for first load issues:
    // Small delay ensures container has rendered with correct dimensions before fit
    setTimeout(() => leafletMap.invalidateSize(), 100);

    let found = 0;
    exhibitorBooths.forEach(exhibitorBooth => {
      const polygon = L.polygon(exhibitorBooth.coords as [number, number][], {
        color: '#fff',
        fillColor: '#fff',
        fillOpacity: 0.0,
        weight: 2,
      }).addTo(leafletMap);
      //console.log(exhibitorBooth.id.toString());
      found = boothToName.get(exhibitorBooth.id);
      if (found) {
        //console.log(exhibitorBooth.id.toString() + " " + found);
        polygon.bindPopup(exhibitorBooth.id.toString() + "<br/>" + found);
      } else {
        //console.log(exhibitorBooth.id.toString());
        polygon.bindPopup(exhibitorBooth.id.toString());
      }
      // Your mouseover/mouseout functions with arrow syntax to fix 'this' typing:
      polygon.on('mouseover', () => polygon.setStyle({ fillOpacity: 0.6 }));
      polygon.on('mouseout', () => polygon.setStyle({ fillOpacity: 0.0 }));
    });

    leafletRef.current = leafletMap;

    // Cleanup function when component unmounts
    return () => {
      leafletMap.remove();
      leafletRef.current = null;
    };
  }, []); // Empty dependency array ensures this runs once when mounted

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

  function origAspect(h?: number, w?: number) {
    if (!h)
      throw new Error("exhibitorsMap missing origHeightNum");
    else if (!w)
      throw new Error("exhibitorsMap missing origWidthNum");
    return h / w;
  };

  const handleToggleBookmark = (exhibitorId: string) => {
    setBookmarkedExhibitors(prev =>
      prev.includes(exhibitorId)
        ? prev.filter(id => id !== exhibitorId)
        : [...prev, exhibitorId]
    );
  };

  const displayMaps = (x: number) => {
    if (x === 1 && exhibitorsMap) {
      //  <ImageWithFallback
      //    src={exhibitorsMap.url}
      //    alt={exhibitorsMap.name}
      //    className="w-full h-auto max-w-full"
      //  />
      return (
        <>
          <div className="w-full" ref={mapRef} ></div>
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
    <div className="block">
      <div className="w-full">
        {displayMaps(numEmaps)}
      </div>
      <ExhibitorView
        bookmarkedExhibitors={bookmarkedExhibitors}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
