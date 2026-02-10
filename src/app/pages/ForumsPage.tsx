import { useState, useEffect, useRef } from 'react';
import { ScheduleView } from '@/app/components/ScheduleView';
import { pacificonData, sampleSessions } from '@/data/pacificon-sample';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Room = {
  name: string;
  coords: [number, number][];
  color: string;
};

// Define your room polygons here
// Coords format: [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
// NOTE: All x values must be <= origWidthNum (582) and y values <= origHeightNum (256)
// The Pleasanton/Danville/San Ramon coords below are PLACEHOLDERS — update them to match
// your actual image. Their original x values (630–715) exceeded the image width of 582.
const rooms: Room[] = [
  // ... (your rooms data) ...
  // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
  {
    name: 'Salon 2',
    coords: [[1, 3], [57, 3], [57, 90], [1, 90]], // Bottom Left
    color: '#10B981',
  },
  {
    name: 'Salon E',
    coords: [[55, 310], [215, 310], [215, 413], [55, 413]], // Center-Right Large
    color: '#3B82F6',
  },
  {
    name: 'Salon H',
    coords: [[169, 414], [215, 414], [215, 487], [169, 487]], // Top Right Stack
    color: '#F59E0B',
  },
  {
    name: 'Salon G',
    coords: [[109, 414], [168, 414], [168, 487], [109, 487]], // Mid Right Stack
    color: '#F59E0B',
  },
  {
    name: 'Salon F',
    coords: [[55, 414], [108, 414], [108, 485], [55, 485]], // Bottom Right Stack
    color: '#F59E0B',
  },
  {
    name: 'Pleasanton',
    coords: [[193, 518], [255, 518], [255, 581], [193, 581]], // Far Right Top
    color: '#8B5CF6',
  },
  {
    name: 'Danville',
    coords: [[135, 518], [192, 518], [192, 581], [135, 581]], // Far Right Mid
    color: '#8B5CF6',
  },
  {
    name: 'San Ramon Boardroom',
    coords: [[58, 518], [134, 518], [134, 581], [58, 581]], // Far Right Bottom
    color: '#8B5CF6',
  },
];

const map = {
  order: '2',
  id: 'map-2',
  conferenceId: 'pacificon-2026',
  name: 'Forums',
  url: '/pacificon-forums-2025.jpg',
  origHeight: '256px',
  origHeightNum: 256,
  origWidth: '582px',
  origWidthNum: 582,
  //origAspect: (256 / 582),
  get origAspect() { return this.origHeightNum / this.origWidthNum; },
};

export function ForumsPage() {
  const [bookmarkedSessions, setBookmarkedSessions] = useState<string[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);

  // REMOVE THIS line, as it's outside the component/hooks and causes issues:
  // window.addEventListener('resize', function () { leafletRef.invalidateSize(); }); 

  const handleToggleBookmark = (sessionId: string) => {
    setBookmarkedSessions(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  function wToH(fcalcW: number) {
    return Math.round(fcalcW * map.origAspect);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const setHeight = () => {
      if (!mapRef.current) return;
      const calcW = mapRef.current.offsetWidth;
      const calcH = Math.round(calcW * map.origAspect);
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
    //  // CRITICAL FIX: Invalidate map size after container size changes
    //  if (leafletRef.current) {
    //    leafletRef.current.invalidateSize();
    //  }
    //}
    //handleResize(); // Initial call
    //window.addEventListener('resize', handleResize);
    //return () => window.removeEventListener('resize', handleResize);
    return () => resizObs.disconnect();
  }, []); // Empty dependency array ensures this runs once when mounted

  // Leaflet map initialisation — runs once on mount
  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map instance
    const leafletMap = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -1,
      maxZoom: 1,
      zoomSnap: 0.1,
    });

    // ... (rest of your map initialization code) ...
    // Click handler for finding coordinates while building room polygons
    leafletMap.on('click', (e) => {
      const { lat, lng } = e.latlng;
      console.log(`Clicked: [${lat.toFixed(1)}, ${lng.toFixed(1)}]`);
    });

    const bounds: L.LatLngBoundsExpression = [
      [0, 0],
      //[wToH(map.origWidthNum), map.origWidthNum]
      [map.origHeightNum, map.origWidthNum],
    ];
    L.imageOverlay(map.url, bounds).addTo(leafletMap);
    leafletMap.fitBounds(bounds);

    // The initial setTimeout is usually fine for first load issues:
    // Small delay ensures container has rendered with correct dimensions before fit
    setTimeout(() => leafletMap.invalidateSize(), 100);

    rooms.forEach(room => {
      const polygon = L.polygon(room.coords as [number, number][], {
        color: room.color,
        fillColor: room.color,
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(leafletMap);
      polygon.bindPopup(room.name);
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

  return (
    <div className="block">
      {/* 
        - w-full: fills parent width
        - No padding here — padding shrinks offsetWidth, causing Leaflet to
          miscalculate its viewport and render polygons outside the visible area.
        - Height is set dynamically by the ResizeObserver above.
      */}
      <div className="w-full" ref={mapRef} ></div>
      <ScheduleView sessions={sampleSessions}
        bookmarkedSessions={bookmarkedSessions}
        conference={pacificonData}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
