// Supplemental booth file for Hamvention 2026 — Building 1 (Maxim)
// Booth polygon data is derived from hamvention-2026-building-1-maxim-coords.csv
// which was extracted from the Hamvention PDF exhibitor map.
//
// Booth IDs (1–108) are sequential extraction numbers assigned to each polygon in the SVG.
// coords: [[y_bottom, x], ...] — y measured from the bottom of the SVG canvas (height 816).
//
// The ExhibitorsMapView renders this map using HamventionSvgExhibitorMap (pure SVG, no Leaflet)
// whenever the map URL matches the SVG_URL below.

import { Booth } from "@/types/conference";
import {
  SVG_URL,
  HAMVENTION_BUILDING1_BOOTHS,
} from "@/data/hamventionSvgExhibitorMapData";

export const mapBooths: [string, Booth[]] = [
  SVG_URL,
  HAMVENTION_BUILDING1_BOOTHS.map((b) => ({
    id: b.boothNum,
    coords: b.coords,
    locationZone: "building-1",
  })),
];
