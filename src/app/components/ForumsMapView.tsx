import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapImage, Room } from "@/types/conference";

interface ForumsMapViewProps {
  forumMap: MapImage;
  forumRooms: Room[];
  highlightForumRoomName: string | null | undefined;
}

export function ForumsMapView({
  forumMap,
  forumRooms,
  highlightForumRoomName,
}: ForumsMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const polygonRefs = useRef<Map<string, L.Polygon>>(new Map());

  function origAspect(h?: number, w?: number) {
    if (!h) throw new Error("forumMap missing origHeightNum");
    else if (!w) throw new Error("forumMap missing origWidthNum");
    return h / w;
  }

  useEffect(() => {
    if (!mapRef.current) return;

    const setHeight = () => {
      if (!mapRef.current) return;
      const calcW = mapRef.current.offsetWidth;
      const calcH = Math.round(
        calcW * origAspect(forumMap.origHeightNum, forumMap.origWidthNum),
      );
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
  }, [forumMap]); // Re-run when forumMap changes so aspect ratio stays correct

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
      keyboard: false,
      dragging: false,
      tapHold: false,
      bounceAtZoomLimits: true,
    });

    // ... (rest of your forumMap initialization code) ...
    // Click handler for finding coordinates while building room polygons
    leafletMap.on("click", (e) => {
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

    forumRooms.forEach((forumRoom) => {
      const polygon = L.polygon(forumRoom.coords as [number, number][], {
        color: forumRoom.color,
        fillColor: forumRoom.color,
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(leafletMap);
      polygon.bindPopup(forumRoom.name);
      polygonRefs.current.set(forumRoom.name, polygon);
      // Your mouseover/mouseout functions with arrow syntax to fix 'this' typing:
      polygon.on("mouseover", () => polygon.setStyle({ fillOpacity: 0.6 }));
      polygon.on("mouseout", () => polygon.setStyle({ fillOpacity: 0.3 }));
    });

    leafletRef.current = leafletMap;

    // Cleanup function when component unmounts
    return () => {
      leafletMap.remove();
      leafletRef.current = null;
      polygonRefs.current.clear();
    };
  }, []); // Empty dependency array ensures this runs once when mounted

  // Highlight and zoom to the room when highlightForumRoomName changes
  useEffect(() => {
    if (polygonRefs.current.size === 0) return;
    polygonRefs.current.forEach((polygon, name) => {
      if (name === highlightForumRoomName) {
        polygon.setStyle({ fillOpacity: 0.7, weight: 4 });
        polygon.openPopup();
        leafletRef.current?.fitBounds(polygon.getBounds(), {
          padding: [20, 20],
        });
      } else {
        polygon.setStyle({ fillOpacity: 0.3, weight: 2 });
      }
    });
  }, [highlightForumRoomName]);

  return (
    /*
     * - w-full: fills parent width
     * - No padding here — padding shrinks offsetWidth, causing Leaflet to
     *   miscalculate its viewport and render polygons outside the visible area.
     * - Height is set dynamically by the ResizeObserver above.
     */
    <div className="w-full" ref={mapRef}></div>
  );
}
