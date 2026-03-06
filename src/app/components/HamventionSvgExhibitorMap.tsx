// HamventionSvgExhibitorMap.tsx
// Renders the Hamvention Building 1 exhibitor map using the extracted SVG directly.
// Booth polygons from the CSV data are overlaid as interactive SVG elements.
import React, { useState } from "react";
import {
  HAMVENTION_BUILDING1_BOOTHS,
  SVG_WIDTH,
  SVG_HEIGHT,
  SVG_URL,
  type SvgBooth,
} from "@/data/hamventionSvgExhibitorMapData";
import type { Exhibitor } from "@/types/conference";

interface HamventionSvgExhibitorMapProps {
  mapExhibitors: Exhibitor[];
  highlightedExhibitorId: string | undefined;
  onHighlightChange: (id: string | undefined) => void;
}

interface Tooltip {
  label: string;
  sx: number;
  sy: number;
}

export function HamventionSvgExhibitorMap({
  mapExhibitors,
  highlightedExhibitorId,
  onHighlightChange,
}: HamventionSvgExhibitorMapProps) {
  const [tip, setTip] = useState<Tooltip | null>(null);

  // Build booth-number → exhibitor lookup
  const boothToExhibitor = new Map<number, Exhibitor>();
  for (const ex of mapExhibitors) {
    for (const loc of ex.location) {
      boothToExhibitor.set(loc, ex);
    }
  }

  const handleMouseEnter = (
    booth: SvgBooth,
    e: React.MouseEvent<SVGPolygonElement>,
  ) => {
    const r = (e.currentTarget as Element)
      .closest<SVGSVGElement>("svg")
      ?.getBoundingClientRect();
    if (!r) return;
    const ex = boothToExhibitor.get(booth.boothNum);
    const label = ex
      ? `${ex.boothName || String(booth.boothNum)} · ${ex.name}`
      : `Booth ${booth.boothNum}`;
    setTip({ label, sx: e.clientX - r.left + 10, sy: e.clientY - r.top - 32 });
  };

  const handleClick = (booth: SvgBooth) => {
    const ex = boothToExhibitor.get(booth.boothNum);
    if (!ex) return;
    onHighlightChange(
      highlightedExhibitorId === ex.id ? undefined : ex.id,
    );
  };

  return (
    <div style={{ position: "relative", fontFamily: "Arial, sans-serif" }}>
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        width="100%"
        style={{
          display: "block",
          border: "1px solid #bbb",
          background: "white",
          borderRadius: 2,
        }}
        xmlns="http://www.w3.org/2000/svg"
        onMouseLeave={() => setTip(null)}
      >
        {/* Building layout SVG as background */}
        <image
          href={SVG_URL}
          x={0}
          y={0}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
        />

        {/* Booth polygon overlays */}
        {HAMVENTION_BUILDING1_BOOTHS.map((booth) => {
          const ex = boothToExhibitor.get(booth.boothNum);
          const isHighlighted = ex !== undefined && ex.id === highlightedExhibitorId;
          const hasExhibitor = ex !== undefined;
          return (
            <polygon
              key={booth.boothNum}
              points={booth.svgPoints}
              fill={isHighlighted ? "#f59e0b" : "white"}
              fillOpacity={isHighlighted ? 0.55 : 0}
              stroke={hasExhibitor ? "#1e40af" : "#aaa"}
              strokeWidth={isHighlighted ? 2 : hasExhibitor ? 1.2 : 0.6}
              strokeOpacity={hasExhibitor ? 0.7 : 0.3}
              style={{ cursor: hasExhibitor ? "pointer" : "default" }}
              onMouseEnter={(e) => handleMouseEnter(booth, e)}
              onMouseLeave={() => setTip(null)}
              onMouseOver={(e) => {
                if (!isHighlighted)
                  (e.currentTarget as SVGPolygonElement).setAttribute(
                    "fill-opacity",
                    "0.35",
                  );
              }}
              onMouseOut={(e) => {
                if (!isHighlighted)
                  (e.currentTarget as SVGPolygonElement).setAttribute(
                    "fill-opacity",
                    "0",
                  );
              }}
              onClick={() => handleClick(booth)}
            />
          );
        })}
      </svg>

      {tip && (
        <div
          style={{
            position: "absolute",
            left: tip.sx,
            top: tip.sy,
            background: "rgba(10,20,40,0.88)",
            color: "#fff",
            padding: "3px 8px",
            borderRadius: 3,
            fontSize: 11,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 20,
          }}
        >
          {tip.label}
        </div>
      )}
    </div>
  );
}
