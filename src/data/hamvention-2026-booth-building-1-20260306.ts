// Supplemental booth file for Hamvention 2026 — Building 1 (Maxim)
// Booth polygon data is derived from hamvention-2026-building-1-maxim-coords.csv
// which was extracted from the Hamvention PDF exhibitor map.
//
// Booth IDs correspond to actual Hamvention booth numbers (e.g. 1010, 1007, ..., 1912),
// determined by geometric analysis of the polygon positions in the SVG.
// coords: [[y_bottom, x], ...] — y measured from the bottom of the SVG canvas (height 816).
//
// The ExhibitorsMapView renders this map using ExhibitorsMapViewSvg (pure SVG, no Leaflet)
// whenever the map URL matches the SVG_URL below.
//
// To regenerate this file run:
//   npx tsx src/data/extract-hamvention-svgbooth-to-booth.ts \
//     --input public/assets/maps/hamvention-2026-building-1-maxim-coords.csv \
//     --building building-1 \
//     --svg-url /assets/maps/hamvention-2026-building-1-maxim.svg \
//     > src/data/hamvention-2026-booth-building-1-$(date +%Y%m%d).ts

import type { Booth } from "@/types/conference";
import {
  SVG_URL,
  HAMVENTION_BUILDING1_BOOTHS,
} from "@/data/hamvention-2026-svgbooth-20260305";

export const mapBooths: [string, Booth[]] = [
  SVG_URL,
  HAMVENTION_BUILDING1_BOOTHS.map((b) => ({
    id: b.boothNum,
    coords: b.coords,
    locationZone: "building-1",
  })) as Booth[],
];
