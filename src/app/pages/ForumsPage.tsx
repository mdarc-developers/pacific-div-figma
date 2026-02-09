import { useState, useEffect, useRef } from 'react';
import { ScheduleView } from '@/app/components/ScheduleView';
import { pacificonData, sampleSessions } from '@/data/pacificon-sample';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define your room polygons here (omitted for brevity)
const rooms = [
  // ... (your rooms data) ...
  // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
  {
    name: 'Salon 2',
    coords: [[5, 5], [75, 5], [75, 150], [5, 150]], // Bottom Left
    color: '#10B981',
  },
  {
    name: 'Salon E',
    coords: [[55, 305], [215, 305], [215, 508], [55, 508]], // Center-Right Large
    color: '#3B82F6',
  },
  {
    name: 'Salon H',
    coords: [[162, 510], [215, 510], [215, 580], [162, 580]], // Top Right Stack
    color: '#F59E0B',
  },
  {
    name: 'Salon G',
    coords: [[110, 510], [160, 510], [160, 580], [110, 580]], // Mid Right Stack
    color: '#F59E0B',
  },
  {
    name: 'Salon F',
    coords: [[55, 510], [108, 510], [108, 580], [55, 580]], // Bottom Right Stack
    color: '#F59E0B',
  },
  {
    name: 'Pleasanton',
    coords: [[185, 630], [250, 630], [250, 715], [185, 715]], // Far Right Top
    color: '#8B5CF6',
  },
  {
    name: 'Danville',
    coords: [[125, 630], [180, 630], [180, 715], [125, 715]], // Far Right Mid
    color: '#8B5CF6',
  },
  {
    name: 'San Ramon Boardroom',
    coords: [[55, 630], [120, 630], [120, 715], [55, 715]], // Far Right Bottom
    color: '#8B5CF6',
  },
];

export function ForumsPage() {
  const [bookmarkedSessions, setBookmarkedSessions] = useState<string[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);

  // REMOVE THIS line, as it's outside the component/hooks and causes issues:
  // window.addEventListener('resize', function () { leafletRef.invalidateSize(); }); 

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
    origAspect: (256 / 582),
  }

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
    const handleResize = () => {
      const calcW = mapRef.current!.offsetWidth;
      const calcH = wToH(calcW);
      mapRef.current!.style.height = `${calcH}px`;

      // CRITICAL FIX: Invalidate map size after container size changes
      if (leafletRef.current) {
        leafletRef.current.invalidateSize();
      }
    }
    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array ensures this runs once when mounted

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map instance
    const leafletMap = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -0.5,
      maxZoom: 0.5
    });

    // ... (rest of your map initialization code) ...
    leafletMap.on('click', (e) => {
      const { lat, lng } = e.latlng;
      console.log(`[${lat.toFixed(1)}, ${lng.toFixed(1)}]`);
    });

    const bounds: L.LatLngBoundsExpression = [[0, 0], [wToH(map.origWidthNum), map.origWidthNum]];
    L.imageOverlay(map.url, bounds).addTo(leafletMap);
    leafletMap.fitBounds(bounds);

    // The initial setTimeout is usually fine for first load issues:
    setTimeout(() => {
      leafletMap.invalidateSize();
    }, 100);

    rooms.forEach(room => {
      const polygon = L.polygon(room.coords, {
        color: room.color,
        fillColor: room.color,
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(leafletMap);
      polygon.bindPopup(room.name);
      // Your mouseover/mouseout functions with arrow syntax to fix 'this' typing:
      polygon.on('mouseover', () => { polygon.setStyle({ fillOpacity: 0.6 }); });
      polygon.on('mouseout', () => { polygon.setStyle({ fillOpacity: 0.3 }); });
    });

    leafletRef.current = leafletMap;

    // Cleanup function when component unmounts
    return () => {
      leafletMap.remove();
      leafletRef.current = null;
    }
  }, []); // Empty dependency array ensures this runs once when mounted

  return (
    <div className="block">
      <div className="w-full p-8"
        ref={mapRef}
      >
      </div>
      <ScheduleView sessions={sampleSessions}
        bookmarkedSessions={bookmarkedSessions}
        conference={pacificonData}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
