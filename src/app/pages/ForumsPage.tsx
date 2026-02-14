import { useState, useEffect, useRef } from 'react';
import { ScheduleView } from '@/app/components/ScheduleView';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useConference } from '@/app/contexts/ConferenceContext';
import { MapImage, Room } from '@/types/conference';

interface MapsModule {
  sampleMaps?: MapImage[];
  [key: string]: unknown;
}

interface RoomModule {
  forumRooms?: Room[];
  [key: string]: unknown;
}

// Import all session data files at once using Vite's glob import
// This imports all files matching the pattern eagerly (at build time)
const conferenceModules = import.meta.glob('../../data/*-2026.ts', { eager: true });

// Process the modules into a lookup object
const MAP_DATA: Record<string, MapImage[]> = {};
const ROOM_DATA: Record<string, Room[]> = {};
Object.entries(conferenceModules).forEach(([path, module]) => {
  // Extract the conference ID from the file path
  // e.g., "../../data/pacificon-2026.ts" -> "pacificon-2026"
  const conferenceId = path.split('/').pop()?.replace('.ts', '') || '';
  const typedMapModule = module as MapsModule;
  const typedRoomModule = module as RoomModule;
  if (typedMapModule.sampleMaps) {
    MAP_DATA[conferenceId] = typedMapModule.sampleMaps;
  }
  if (typedRoomModule.forumRooms) {
    ROOM_DATA[conferenceId] = typedRoomModule.forumRooms;
  }
});

export function ForumsPage() {
  const [bookmarkedSessions, setBookmarkedSessions] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } = useConference();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const forumRooms = ROOM_DATA[activeConference.id] || [];
  const sampleMaps = MAP_DATA[activeConference.id] || [];

  function origAspect(h?: number, w?: number) {
    if (!h)
      throw new Error("forumMap missing origHeightNum");
    else if (!w)
      throw new Error("forumMap missing origWidthNum");
    return h / w;
  };

  // REMOVE THIS line, as it's outside the component/hooks and causes issues:
  // window.addEventListener('resize', function () { leafletRef.invalidateSize(); }); 

  const handleToggleBookmark = (sessionId: string) => {
    setBookmarkedSessions(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  //function wToH(fcalcW: number) {
  //  return Math.round(fcalcW * forumMap.origAspect);
  //};

  useEffect(() => {
    if (!mapRef.current) return;

    const setHeight = () => {
      if (!mapRef.current) return;
      const calcW = mapRef.current.offsetWidth;
      const calcH = Math.round(calcW * origAspect(forumMap.origHeightNum, forumMap.origWidthNum));
      mapRef.current.style.height = `${calcH}px`;
      leafletRef.current?.invalidateSize();
    };

    // ResizeObserver is more reliable than window resize for element-level changes
    const resizObs = new ResizeObserver(setHeight);
    resizObs.observe(mapRef.current);

    setHeight(); // Set correct height on first mount

    //const handleResize = () => {
    //  const calcW = mapRef.current!.offsetWidth;
    //  const calcH = wToH(calcW);
    //  mapRef.current!.style.height = `${calcH}px`;
    //
    //  // CRITICAL FIX: Invalidate forumMap size after container size changes
    //  if (leafletRef.current) {
    //    leafletRef.current.invalidateSize();
    //  }
    //}
    //handleResize(); // Initial call
    //window.addEventListener('resize', handleResize);
    //return () => window.removeEventListener('resize', handleResize);
    return () => resizObs.disconnect();
  }, []); // Empty dependency array ensures this runs once when mounted

  // Leaflet forumMap initialisation — runs once on mount
  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize forumMap instance
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
      keyboard: false
    });

    // ... (rest of your forumMap initialization code) ...
    // Click handler for finding coordinates while building room polygons
    leafletMap.on('click', (e) => {
      const { lat, lng } = e.latlng;
      console.log(`Clicked: [${lat.toFixed(1)}, ${lng.toFixed(1)}]`);
    });

    const bounds: L.LatLngBoundsExpression = [
      [0, 0],
      //[wToH(forumMap.origWidthNum), forumMap.origWidthNum]
      [forumMap.origHeightNum || 256, forumMap.origWidthNum || 582],
    ];

    // debug line
    //console.log('forumMap at Leaflet init:', forumMap.origHeightNum, forumMap.origWidthNum);

    L.imageOverlay(forumMap.url, bounds).addTo(leafletMap);
    leafletMap.fitBounds(bounds);

    // The initial setTimeout is usually fine for first load issues:
    // Small delay ensures container has rendered with correct dimensions before fit
    setTimeout(() => leafletMap.invalidateSize(), 100);

    forumRooms.forEach(forumRoom => {
      const polygon = L.polygon(forumRoom.coords as [number, number][], {
        color: forumRoom.color,
        fillColor: forumRoom.color,
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(leafletMap);
      polygon.bindPopup(forumRoom.name);
      // Your mouseover/mouseout functions with arrow syntax to fix 'this' typing:
      polygon.on('mouseover', () => polygon.setStyle({ fillOpacity: 0.6 }));
      polygon.on('mouseout', () => polygon.setStyle({ fillOpacity: 0.3 }));
    });

    leafletRef.current = leafletMap;

    // Cleanup function when component unmounts
    return () => {
      leafletMap.remove();
      leafletRef.current = null;
    };
  }, []); // Empty dependency array ensures this runs once when mounted

  //const forumMap: MapImage = sampleMaps.find(m => m.origHeightNum !== undefined) || // assume origWidthNum as well
  const forumMap: MapImage = sampleMaps.find(m => m.url === activeConference.mapSessionsUrl) || // assume origWidthNum as well
  {
    id: 'map-0',
    conferenceId: 'pacificon-2026',
    name: 'noForumMapFound',
    url: '/pacificon-forums-2025.jpg',
    order: 6,
    origHeightNum: 256,
    origWidthNum: 582
  };

  return (
    <div className="block">
      {/* 
        - w-full: fills parent width
        - No padding here — padding shrinks offsetWidth, causing Leaflet to
          miscalculate its viewport and render polygons outside the visible area.
        - Height is set dynamically by the ResizeObserver above.
      */}
      <div className="w-full" ref={mapRef} ></div>
      <ScheduleView
        bookmarkedSessions={bookmarkedSessions}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
