import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapImage, Booth, Exhibitor } from "@/types/conference";

interface ExhibitorsMapViewProps {
  exhibitorsMap: MapImage | undefined;
  exhibitorBooths: Booth[];
  mapExhibitors: Exhibitor[];
  highlightedExhibitorId: string | undefined;
  onHighlightChange: (id: string | undefined) => void;
}

export function ExhibitorsMapView({
  exhibitorsMap,
  exhibitorBooths,
  mapExhibitors,
  highlightedExhibitorId,
  onHighlightChange,
}: ExhibitorsMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const polygonsRef = useRef<Map<number, L.Polygon>>(new Map());
  const highlightedExhibitorIdRef = useRef<string | undefined>(undefined);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [pdfHeight, setPdfHeight] = useState<number>(0);

  const boothToName = useMemo(() => {
    const map = new Map<number, Exhibitor>();
    for (const ex of mapExhibitors) {
      for (const boo in ex.location) {
        map.set(ex.location[boo], ex);
      }
    }
    return map;
  }, [mapExhibitors]);

  function origAspect(h?: number, w?: number) {
    if (!h) throw new Error("exhibitorsMap missing origHeightNum");
    else if (!w) throw new Error("exhibitorsMap missing origWidthNum");
    return h / w;
  }

  useEffect(() => {
    if (!mapRef.current || !exhibitorsMap) return;

    const setHeight = () => {
      if (!mapRef.current) return;
      const calcW = mapRef.current.offsetWidth;
      const calcH = Math.round(
        calcW *
          origAspect(exhibitorsMap.origHeightNum, exhibitorsMap.origWidthNum),
      );
      mapRef.current.style.height = `${calcH}px`;
      leafletRef.current?.invalidateSize();
    };

    // ResizeObserver is more reliable than window resize for element-level changes
    const resizObs = new ResizeObserver(setHeight);
    resizObs.observe(mapRef.current);

    setHeight(); // Set correct height on first mount

    return () => resizObs.disconnect();
  }, [exhibitorsMap]);

  // Auto-height for PDF iframe: measures wrapper width and applies aspect-ratio height
  useEffect(() => {
    const el = pdfRef.current;
    if (!el || !exhibitorsMap?.url.endsWith(".pdf")) return;
    const updateHeight = () => {
      const w = el.offsetWidth;
      const h =
        exhibitorsMap.origHeightNum && exhibitorsMap.origWidthNum
          ? Math.round(
              w * (exhibitorsMap.origHeightNum / exhibitorsMap.origWidthNum),
            )
          : Math.round(w * (11 / 8.5)); // A4/Letter fallback
      setPdfHeight(h);
    };
    const obs = new ResizeObserver(updateHeight);
    obs.observe(el);
    updateHeight();
    return () => obs.disconnect();
  }, [exhibitorsMap]);

  // Leaflet exhibitorsMap initialisation — runs once on mount
  useEffect(() => {
    if (!mapRef.current || !exhibitorsMap) return;

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
    leafletMap.on("click", (e) => {
      const { lat, lng } = e.latlng;
      console.log(`Clicked: [${lat.toFixed(1)}, ${lng.toFixed(1)}]`);
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

    polygonsRef.current.clear();
    let found: Exhibitor | undefined;
    exhibitorBooths.forEach((exhibitorBooth) => {
      const polygon = L.polygon(exhibitorBooth.coords as [number, number][], {
        color: "#fff",
        fillColor: "#fff",
        fillOpacity: 0.0,
        weight: 2,
      }).addTo(leafletMap);
      polygonsRef.current.set(exhibitorBooth.id, polygon);
      //console.log(exhibitorBooth.id.toString());
      found = boothToName.get(exhibitorBooth.id);
      if (found) {
        //console.log(exhibitorBooth.id.toString() + " " + found);
        polygon.bindPopup(found.boothName + "<br/>" + found.name);
        const exhibitorId = found.id;
        polygon.on("click", () =>
          onHighlightChange(
            highlightedExhibitorIdRef.current === exhibitorId
              ? undefined
              : exhibitorId,
          ),
        );
      } else {
        //console.log(exhibitorBooth.id.toString());
        polygon.bindPopup(exhibitorBooth.id.toString());
      }
      // Your mouseover/mouseout functions with arrow syntax to fix 'this' typing:
      polygon.on("mouseover", () => polygon.setStyle({ fillOpacity: 0.6 }));
      polygon.on("mouseout", () => {
        const currentHighlight = highlightedExhibitorIdRef.current;
        const ex = boothToName.get(exhibitorBooth.id);
        const isHighlighted = ex !== undefined && ex.id === currentHighlight;
        polygon.setStyle({ fillOpacity: isHighlighted ? 0.6 : 0.0 });
      });
    });

    leafletRef.current = leafletMap;

    // Cleanup function when component unmounts
    return () => {
      leafletMap.remove();
      leafletRef.current = null;
      polygonsRef.current.clear();
    };
  }, [exhibitorsMap]);

  // Sync highlighted exhibitor → polygon fill style
  useEffect(() => {
    highlightedExhibitorIdRef.current = highlightedExhibitorId;
    polygonsRef.current.forEach((polygon, boothId) => {
      const exhibitor = boothToName.get(boothId);
      const isHighlighted =
        exhibitor !== undefined && exhibitor.id === highlightedExhibitorId;
      polygon.setStyle({
        fillColor: isHighlighted ? "#f59e0b" : "#fff",
        fillOpacity: isHighlighted ? 0.6 : 0.0,
      });
    });
  }, [highlightedExhibitorId, boothToName]);

  if (!exhibitorsMap) return null;

  const endsWithPdf = exhibitorsMap.url.endsWith(".pdf");
  if (endsWithPdf) {
    return (
      <>
        <div className="w-full" ref={pdfRef}>
          <iframe
            title="Exhibitors Map"
            src={exhibitorsMap.url}
            className="w-full"
            style={{ height: pdfHeight > 0 ? `${pdfHeight}px` : "100vh" }}
          >
            Your browser does not support iframes.{" "}
            <a href={exhibitorsMap.url}>Download the PDF</a> instead.
          </iframe>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
          {exhibitorsMap.name}
        </p>
      </>
    );
  }

  return (
    <>
      {/*
        //  <ImageWithFallback
        //    src={exhibitorsMap.url}
        //    alt={exhibitorsMap.name}
        //    className="w-full h-auto max-w-full"
        //  />
      */}
      <div className="w-full" ref={mapRef}></div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
        {exhibitorsMap.name}
      </p>
    </>
  );
}
