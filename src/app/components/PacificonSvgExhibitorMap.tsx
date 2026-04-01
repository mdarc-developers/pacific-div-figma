// PacificonSvgExhibitorMap.tsx
import { useEffect, useRef, useState } from "react";
import {
  SVG_VIEWBOX_WIDTH,
  SVG_VIEWBOX_HEIGHT,
  SVG_MAP_URL,
  PACIFICON_MAP_BOOTHS,
  HALLWAY_LABELS,
  svgFillColor,
  type PacificonMapBooth,
  type SvgHallwayLabel,
} from "@/data/pacificonSvgExhibitorMapData";

const ASPECT_RATIO = SVG_VIEWBOX_HEIGHT / SVG_VIEWBOX_WIDTH;
const STROKE_COLOR = "rgb(0,0,0)";
const STROKE_WIDTH = 25;
const LABEL_FILL = "rgb(0,0,0)";
const FONT_FAMILY = "Arial, sans-serif";

// ─────────────────────────────────────────────────────────────────────────────
// Rendering functions
// Each function is responsible for a single visual layer of the map.
// ─────────────────────────────────────────────────────────────────────────────

/** Renders the coloured fill rectangle and its black outline for one booth. */
function renderBoothShape(booth: PacificonMapBooth): React.ReactNode {
  const fill = svgFillColor(booth.type);
  return (
    <g key={`booth-${booth.id}`}>
      {/* Coloured fill */}
      <rect
        x={booth.svgX}
        y={booth.svgY}
        width={booth.svgW}
        height={booth.svgH}
        fill={fill}
        stroke="none"
      />
      {/* Black outline */}
      <rect
        x={booth.svgX}
        y={booth.svgY}
        width={booth.svgW}
        height={booth.svgH}
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
    </g>
  );
}

/** Renders the default booth label text (e.g. booth number, "NP-5", "T-3"). */
function renderBoothLabel(booth: PacificonMapBooth): React.ReactNode {
  if (
    booth.label === undefined ||
    booth.labelX === undefined ||
    booth.labelY === undefined
  ) {
    return null;
  }
  return (
    <text
      key={`label-${booth.id}`}
      x={booth.labelX}
      y={booth.labelY}
      fontSize={booth.labelFontSize}
      fontWeight={booth.labelFontWeight}
      fill={LABEL_FILL}
      fontFamily={FONT_FAMILY}
      {...(booth.labelTransform ? { transform: booth.labelTransform } : {})}
      {...(booth.labelTextLength != null
        ? {
            textLength: booth.labelTextLength,
            lengthAdjust: "spacingAndGlyphs",
          }
        : {})}
    >
      {booth.label}
    </text>
  );
}

/**
 * Renders an optional hard-coded secondary label for a booth
 * (e.g. the pre-assigned "DATV" label on NP-15).
 */
function renderBoothSecondaryLabel(booth: PacificonMapBooth): React.ReactNode {
  if (
    booth.secondaryLabel === undefined ||
    booth.secondaryLabelX === undefined ||
    booth.secondaryLabelY === undefined
  ) {
    return null;
  }
  return (
    <text
      key={`slabel-${booth.id}`}
      x={booth.secondaryLabelX}
      y={booth.secondaryLabelY}
      fontSize={booth.secondaryLabelFontSize}
      fontWeight={booth.secondaryLabelFontWeight}
      fill={LABEL_FILL}
      fontFamily={FONT_FAMILY}
      {...(booth.secondaryLabelTransform
        ? { transform: booth.secondaryLabelTransform }
        : {})}
      {...(booth.secondaryLabelTextLength != null
        ? {
            textLength: booth.secondaryLabelTextLength,
            lengthAdjust: "spacingAndGlyphs",
          }
        : {})}
    >
      {booth.secondaryLabel}
    </text>
  );
}

/**
 * Renders all text-only hallway / area labels (no coloured fill rectangle).
 * These labels appear over the base SVG without a coloured background.
 */
function renderHallwayLabels(labels: SvgHallwayLabel[]): React.ReactNode {
  return labels.map((lbl, i) => (
    <text
      key={`hlbl-${i}`}
      x={lbl.x}
      y={lbl.y}
      fontSize={lbl.fontSize}
      fontWeight={lbl.fontWeight}
      fill={LABEL_FILL}
      fontFamily={FONT_FAMILY}
      {...(lbl.transform ? { transform: lbl.transform } : {})}
      {...(lbl.textLength != null
        ? { textLength: lbl.textLength, lengthAdjust: "spacingAndGlyphs" }
        : {})}
    >
      {lbl.text}
    </text>
  ));
}

/**
 * Placeholder for future exhibitor name overlay rendering.
 *
 * When ready to activate, iterate over `booths` whose `id` appears in the
 * `svgMapExhibitors` list and render a centred `<text>` element inside each
 * booth rectangle.  The exhibitor name background box (matching booth colour,
 * spanning all assigned booths) should also be drawn here.
 *
 * The `svgMapExhibitors` export already contains the initial assignments
 * (ARRL → booths 4 & 5; DATV → NP-15).  Populate `exhibitorId` on the
 * corresponding PACIFICON_MAP_BOOTHS entries to enable their overlays.
 */
function renderExhibitorOverlays(): React.ReactNode {
  // TODO: Implement exhibitor name overlays centred inside each assigned booth.
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PacificonSvgExhibitorMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const height = containerWidth > 0 ? containerWidth * ASPECT_RATIO : undefined;

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {/*
       * Render the no-booths base SVG as an <image> inside an outer SVG that
       * shares the same viewBox, then draw booth shapes and labels on top.
       */}
      <svg
        viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          display: "block",
          width: "100%",
          height: height !== undefined ? `${height}px` : "auto",
        }}
        aria-label="Pacificon Exhibitor Map"
      >
        {/* Base floor-plan (walls, rooms, legend, doors) */}
        <image
          href={SVG_MAP_URL}
          x={0}
          y={0}
          width={SVG_VIEWBOX_WIDTH}
          height={SVG_VIEWBOX_HEIGHT}
        />

        {/* Coloured booth shapes (fill + outline) */}
        {PACIFICON_MAP_BOOTHS.map((booth) => renderBoothShape(booth))}

        {/* Default booth labels (numbers, NP-x, T-x, etc.) */}
        {PACIFICON_MAP_BOOTHS.map((booth) => renderBoothLabel(booth))}

        {/* Hard-coded secondary labels (e.g. "DATV" on NP-15) */}
        {PACIFICON_MAP_BOOTHS.map((booth) => renderBoothSecondaryLabel(booth))}

        {/* Text-only hallway / area labels */}
        {renderHallwayLabels(HALLWAY_LABELS)}

        {/* Exhibitor name overlays (for assigned booths) */}
        {renderExhibitorOverlays()}
      </svg>
    </div>
  );
}
