// ExhibitorsMapViewSvg.tsx
// Generic SVG exhibitor-map component.
// Renders an arbitrary SVG floor-plan with interactive booth polygon overlays.
// Supports mouse-wheel zoom, click-drag pan, and touch pinch-to-zoom / drag.
//
// Coordinate model
// ─────────────────
// The hamvention SVG background files share a common Inkscape structure:
//
//   <svg viewBox="0 0 W H">
//     <g transform="translate(-Tx,-Ty)">           ← root group
//       <path … transform="matrix(0,s,s,0,0,0)" /> ← each element
//     </g>
//   </svg>
//
// Booth polygon data (Booth.coords) was extracted from those elements after
// the per-element matrix was applied but *before* the root translate, so each
// coordinate lives in an "intermediate" space:
//
//   intermediate_x  ≈  s × raw_path_y
//   intermediate_y  ≈  s × raw_path_x
//
// To land polygons on top of the green booth outlines in the background SVG
// the component fetches the SVG file, reads W, H, Tx, Ty, and wraps the
// polygons in  <g transform="translate(-Tx,-Ty)">  so they shift into viewBox
// space.
//
// Sanity checks
// ─────────────
// The component computes the bounding box of the supplied booth data at
// runtime and logs console warnings when the data looks misaligned so that
// data problems surface early without breaking the render.
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Exhibitor } from "@/types/conference";

// ── Types ────────────────────────────────────────────────────────────────────

/** Minimal booth polygon type used by this component.
 *  Converted from Booth.coords (x,y pairs) by the caller. */
export interface SvgMapBooth {
  /** Booth number as shown on the floor plan */
  boothNum: number;
  /** Space-separated "x,y" corner pairs in the intermediate coordinate space
   *  (post per-element matrix, pre root-translate). */
  svgPoints: string;
}

export interface ExhibitorsMapViewSvgProps {
  /** Booth polygon data (converted from Booth.coords or SvgBooth.svgPoints) */
  booths: SvgMapBooth[];
  /** URL of the SVG background floor-plan (same URL used as map image) */
  svgUrl: string;
  mapExhibitors: Exhibitor[];
  highlightedExhibitorId: string | undefined;
  onHighlightChange: (id: string | undefined) => void;
}

export interface SvgLayout {
  /** SVG viewBox width  (e.g. 239.6535) */
  vbW: number;
  /** SVG viewBox height (e.g. 248.29472) */
  vbH: number;
  /** Amount to subtract from booth x to reach viewBox space (abs of translate-x) */
  translateX: number;
  /** Amount to subtract from booth y to reach viewBox space (abs of translate-y) */
  translateY: number;
}

interface Tooltip {
  label: string;
  sx: number;
  sy: number;
}

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DragState {
  clientX: number;
  clientY: number;
  vbX: number;
  vbY: number;
  scaleX: number;
  scaleY: number;
}

// ── Module-level SVG layout cache ─────────────────────────────────────────────
// Avoids re-fetching the same SVG file when the user switches between maps or
// the component remounts.  Populated on first successful parse.
const svgLayoutCache = new Map<string, SvgLayout>();

/** Parse corner points from a space-separated "x,y x,y …" string. */
export function parsePoints(svgPoints: string): [number, number][] {
  return svgPoints
    .trim()
    .split(/\s+/)
    .flatMap((pair) => {
      const [x, y] = pair.split(",").map(Number);
      return isNaN(x) || isNaN(y) ? [] : [[x, y] as [number, number]];
    });
}

/** Compute bounding box of all corner points across all booths. */
export function detectBounds(booths: SvgMapBooth[]) {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const booth of booths) {
    for (const [x, y] of parsePoints(booth.svgPoints)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return isFinite(minX) ? { minX, maxX, minY, maxY } : null;
}

/** Fallback layout when SVG fetch/parse fails.
 *  Estimates viewBox and translate purely from the booth data bounding box,
 *  adding a 10 % margin on each side so the building outline is visible. */
export function fallbackLayout(booths: SvgMapBooth[]): SvgLayout {
  const bounds = detectBounds(booths);
  if (!bounds) return { vbW: 100, vbH: 100, translateX: 0, translateY: 0 };
  const { minX, maxX, minY, maxY } = bounds;
  const rangeW = maxX - minX;
  const rangeH = maxY - minY;
  const pad = 0.1; // 10 % padding
  const vbW = rangeW * (1 + 2 * pad);
  const vbH = rangeH * (1 + 2 * pad);
  // Place origin so the booth bounding box starts at (pad*rangeW, pad*rangeH)
  const translateX = minX - rangeW * pad;
  const translateY = minY - rangeH * pad;
  return { vbW, vbH, translateX, translateY };
}

/** Fetch and parse the SVG file to extract viewBox dimensions and root-group
 *  translate.  Populates svgLayoutCache on success. */
async function fetchSvgLayout(url: string): Promise<SvgLayout> {
  const cached = svgLayoutCache.get(url);
  if (cached) return cached;

  const text = await fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
  });

  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const svgEl = doc.querySelector("svg");

  // viewBox="minX minY width height" — we only need width and height
  const vbParts = (svgEl?.getAttribute("viewBox") ?? "")
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  const vbW = vbParts[2] ?? 0;
  const vbH = vbParts[3] ?? 0;

  // Root direct-child group translate: translate(-Tx,-Ty)
  const rootGroup = svgEl?.querySelector(":scope > g");
  const txStr = rootGroup?.getAttribute("transform") ?? "";
  const txMatch = txStr.match(
    /translate\(\s*(-?[0-9.]+)\s*[,\s]+\s*(-?[0-9.]+)\s*\)/,
  );
  // The SVG stores negative values (translate(-244,-130)); we want the
  // magnitude so we can subtract it from booth coords to reach viewBox space.
  const translateX = txMatch ? -parseFloat(txMatch[1]) : 0;
  const translateY = txMatch ? -parseFloat(txMatch[2]) : 0;

  if (vbW <= 0 || vbH <= 0) {
    throw new Error(
      `Could not read valid viewBox from ${url} (got ${vbW}×${vbH})`,
    );
  }

  const layout: SvgLayout = { vbW, vbH, translateX, translateY };
  svgLayoutCache.set(url, layout);
  return layout;
}

// ── Constants ────────────────────────────────────────────────────────────────
const ZOOM_FACTOR_IN = 0.75;
const ZOOM_FACTOR_OUT = 1 / ZOOM_FACTOR_IN;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ExhibitorsMapViewSvg({
  booths,
  svgUrl,
  mapExhibitors,
  highlightedExhibitorId,
  onHighlightChange,
}: ExhibitorsMapViewSvgProps) {
  // ── SVG layout (fetched async from the SVG file) ────────────────────────
  const [svgLayout, setSvgLayout] = useState<SvgLayout | null>(
    () => svgLayoutCache.get(svgUrl) ?? null,
  );

  useEffect(() => {
    let cancelled = false;
    const cached = svgLayoutCache.get(svgUrl);
    if (cached) {
      setSvgLayout(cached);
      return;
    }
    fetchSvgLayout(svgUrl)
      .then((layout) => {
        if (!cancelled) setSvgLayout(layout);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn(
          `[ExhibitorsMapViewSvg] Failed to parse SVG layout for ${svgUrl}:`,
          err,
          "— falling back to booth-data bounding box.",
        );
        setSvgLayout(fallbackLayout(booths));
      });
    return () => {
      cancelled = true;
    };
  }, [svgUrl, booths]);

  // ── Bounding-box detection & sanity checks ──────────────────────────────
  // Runs whenever booth data or the parsed layout changes.  Emits warnings
  // when the data looks misaligned so problems surface during development
  // without crashing the render.
  const detectedBounds = useMemo(() => {
    const bounds = detectBounds(booths);
    if (!bounds || !svgLayout) return bounds;

    const { minX, maxX, minY, maxY } = bounds;
    const { vbW, vbH, translateX, translateY } = svgLayout;

    // Booth corners in viewBox space after applying the parsed translate
    const vbMinX = minX - translateX;
    const vbMaxX = maxX - translateX;
    const vbMinY = minY - translateY;
    const vbMaxY = maxY - translateY;

    const tolerance = 1; // 1 SVG unit tolerance for rounding
    const outsideViewBox =
      vbMinX < -tolerance ||
      vbMaxX > vbW + tolerance ||
      vbMinY < -tolerance ||
      vbMaxY > vbH + tolerance;

    // Centering-estimate of the translate for comparison
    const detectedTX = (minX + maxX) / 2 - vbW / 2;
    const detectedTY = (minY + maxY) / 2 - vbH / 2;
    const txDiff = Math.abs(detectedTX - translateX);
    const tyDiff = Math.abs(detectedTY - translateY);
    const significantDiff = txDiff > vbW * 0.1 || tyDiff > vbH * 0.1;

    const dataRangeW = (maxX - minX).toFixed(1);
    const dataRangeH = (maxY - minY).toFixed(1);

    if (outsideViewBox) {
      console.warn(
        `[ExhibitorsMapViewSvg] ${svgUrl}: booth polygons extend outside SVG ` +
          `viewBox ${vbW.toFixed(2)}×${vbH.toFixed(2)}. ` +
          `After translate they land at ` +
          `x[${vbMinX.toFixed(1)},${vbMaxX.toFixed(1)}] ` +
          `y[${vbMinY.toFixed(1)},${vbMaxY.toFixed(1)}]. ` +
          `Detected data range ${dataRangeW}×${dataRangeH}. ` +
          `Data may be inaccurate or need regeneration.`,
      );
    } else if (significantDiff) {
      console.warn(
        `[ExhibitorsMapViewSvg] ${svgUrl}: centering-estimated translate ` +
          `(${detectedTX.toFixed(2)},${detectedTY.toFixed(2)}) differs from ` +
          `SVG-parsed translate (${translateX},${translateY}) by >10 % of ` +
          `viewBox size. Detected data range ${dataRangeW}×${dataRangeH}. ` +
          `Data may be inaccurate or need regeneration.`,
      );
    }

    return bounds;
  }, [booths, svgLayout, svgUrl]);

  // Suppress the unused-variable lint warning: detectedBounds is used for its
  // console.warn side-effect inside useMemo, not in the render output.
  void detectedBounds;

  // ── Derived viewBox dimensions ──────────────────────────────────────────
  const vbW = svgLayout?.vbW ?? 1;
  const vbH = svgLayout?.vbH ?? 1;
  const translateX = svgLayout?.translateX ?? 0;
  const translateY = svgLayout?.translateY ?? 0;
  const minVbWidth = vbW / 10; // maximum 10× zoom

  // ── ViewBox state ───────────────────────────────────────────────────────
  function constrainVb(vb: ViewBox): ViewBox {
    const w = clamp(vb.w, minVbWidth, vbW);
    const h = (w / vbW) * vbH;
    const x = clamp(vb.x, 0, vbW - w);
    const y = clamp(vb.y, 0, vbH - h);
    return { x, y, w, h };
  }

  const [tip, setTip] = useState<Tooltip | null>(null);
  const [vb, setVb] = useState<ViewBox>({ x: 0, y: 0, w: vbW, h: vbH });
  const [isPanning, setIsPanning] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const pinchDistRef = useRef<number | null>(null);
  const hasDraggedRef = useRef(false);
  const vbRef = useRef<ViewBox>(vb);

  // Reset viewBox whenever the SVG layout changes (new building selected)
  useEffect(() => {
    const next = { x: 0, y: 0, w: vbW, h: vbH };
    vbRef.current = next;
    setVb(next);
  }, [vbW, vbH]);

  function applyVb(next: ViewBox) {
    const constrained = constrainVb(next);
    vbRef.current = constrained;
    setVb(constrained);
  }

  function zoomAround(factor: number, svgCx: number, svgCy: number) {
    const prev = vbRef.current;
    const newW = clamp(prev.w * factor, minVbWidth, vbW);
    const newH = (newW / vbW) * vbH;
    applyVb({
      x: svgCx - (svgCx - prev.x) * (newW / prev.w),
      y: svgCy - (svgCy - prev.y) * (newH / prev.h),
      w: newW,
      h: newH,
    });
  }

  function clientToSvgCoords(clientX: number, clientY: number) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const cur = vbRef.current;
    return {
      x: cur.x + (clientX - rect.left) * (cur.w / rect.width),
      y: cur.y + (clientY - rect.top) * (cur.h / rect.height),
    };
  }

  // ── Booth → exhibitor lookup ──────────────────────────────────────────────
  const boothToExhibitor = useMemo(() => {
    const m = new Map<number, Exhibitor>();
    for (const ex of mapExhibitors) {
      for (const loc of ex.location) m.set(loc, ex);
    }
    return m;
  }, [mapExhibitors]);

  // ── Mouse wheel zoom ────────────────────────────────────────────────────────
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const { x: svgX, y: svgY } = clientToSvgCoords(e.clientX, e.clientY);
    zoomAround(e.deltaY < 0 ? ZOOM_FACTOR_IN : ZOOM_FACTOR_OUT, svgX, svgY);
    setTip(null);
  };

  // ── Mouse drag pan ──────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cur = vbRef.current;
    dragRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      vbX: cur.x,
      vbY: cur.y,
      scaleX: cur.w / rect.width,
      scaleY: cur.h / rect.height,
    };
    setIsPanning(true);
    setTip(null);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const ds = dragRef.current;
    if (!ds) return;
    hasDraggedRef.current = true;
    const dx = (e.clientX - ds.clientX) * ds.scaleX;
    const dy = (e.clientY - ds.clientY) * ds.scaleY;
    const cur = vbRef.current;
    applyVb({ ...cur, x: ds.vbX - dx, y: ds.vbY - dy });
  };

  const stopMouseDrag = () => {
    dragRef.current = null;
    setIsPanning(false);
  };

  // ── Touch drag + pinch-to-zoom ──────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDistRef.current = Math.hypot(dx, dy);
      dragRef.current = null;
    } else if (e.touches.length === 1) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cur = vbRef.current;
      dragRef.current = {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        vbX: cur.x,
        vbY: cur.y,
        scaleX: cur.w / rect.width,
        scaleY: cur.h / rect.height,
      };
      pinchDistRef.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (e.touches.length === 2 && pinchDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const factor = pinchDistRef.current / newDist;
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const { x: svgX, y: svgY } = clientToSvgCoords(cx, cy);
      zoomAround(factor, svgX, svgY);
      pinchDistRef.current = newDist;
    } else if (e.touches.length === 1) {
      const ds = dragRef.current;
      if (!ds) return;
      const dx = (e.touches[0].clientX - ds.clientX) * ds.scaleX;
      const dy = (e.touches[0].clientY - ds.clientY) * ds.scaleY;
      const cur = vbRef.current;
      applyVb({ ...cur, x: ds.vbX - dx, y: ds.vbY - dy });
    }
  };

  const handleTouchEnd = () => {
    dragRef.current = null;
    pinchDistRef.current = null;
  };

  // ── Tooltip ─────────────────────────────────────────────────────────────────
  const handleMouseEnter = (
    booth: SvgMapBooth,
    e: React.MouseEvent<SVGPolygonElement>,
  ) => {
    if (dragRef.current) return;
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

  const handleClick = (booth: SvgMapBooth) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    const ex = boothToExhibitor.get(booth.boothNum);
    if (!ex) return;
    onHighlightChange(highlightedExhibitorId === ex.id ? undefined : ex.id);
  };

  const handleZoomIn = () => {
    const cur = vbRef.current;
    zoomAround(ZOOM_FACTOR_IN, cur.x + cur.w / 2, cur.y + cur.h / 2);
  };
  const handleZoomOut = () => {
    const cur = vbRef.current;
    zoomAround(ZOOM_FACTOR_OUT, cur.x + cur.w / 2, cur.y + cur.h / 2);
  };
  const handleResetZoom = () => applyVb({ x: 0, y: 0, w: vbW, h: vbH });

  const handleSvgMouseLeave = () => {
    setTip(null);
    stopMouseDrag();
  };

  const isZoomed = vb.w < vbW;

  return (
    <div
      style={{
        position: "relative",
        zIndex: 0,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Zoom control buttons */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {(
          [
            { label: "+", title: "Zoom in", onClick: handleZoomIn },
            { label: "−", title: "Zoom out", onClick: handleZoomOut },
            ...(isZoomed
              ? [{ label: "⊙", title: "Reset zoom", onClick: handleResetZoom }]
              : []),
          ] as { label: string; title: string; onClick: () => void }[]
        ).map(({ label, title, onClick }) => (
          <button
            key={title}
            title={title}
            aria-label={title}
            onClick={onClick}
            style={{
              width: 28,
              height: 28,
              lineHeight: "28px",
              textAlign: "center",
              fontSize: 16,
              fontWeight: "bold",
              background: "rgba(255,255,255,0.9)",
              border: "1px solid #999",
              borderRadius: 4,
              cursor: "pointer",
              padding: 0,
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        width="100%"
        style={{
          display: "block",
          // Aspect ratio is driven by the actual SVG viewBox read from the file,
          // so the background image is never stretched or skewed.
          aspectRatio: `${vbW} / ${vbH}`,
          border: "1px solid #bbb",
          background: "white",
          borderRadius: 2,
          cursor: isPanning ? "grabbing" : "grab",
          touchAction: "none",
        }}
        xmlns="http://www.w3.org/2000/svg"
        onMouseLeave={handleSvgMouseLeave}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopMouseDrag}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background floor-plan SVG.
            The <image> dimensions exactly match the outer viewBox (vbW × vbH),
            which equals the background SVG's own viewBox — so preserveAspectRatio
            "none" causes no distortion: there is nothing to stretch. */}
        <image
          href={svgUrl}
          x={0}
          y={0}
          width={vbW}
          height={vbH}
          preserveAspectRatio="none"
        />

        {/* Booth polygon overlays.
            The <g> translate shifts polygons from intermediate coordinate space
            (post per-element matrix, pre root-translate) into SVG viewBox space,
            so each blue outline lands exactly on top of the corresponding green
            booth shape in the background image.
            Overlays are hidden until the SVG layout is parsed so that the first
            paint shows a correctly-positioned background rather than a flash of
            misaligned polygons. */}
        {svgLayout && (
          <g transform={`translate(${-translateX}, ${-translateY})`}>
            {booths.map((booth) => {
              const ex = boothToExhibitor.get(booth.boothNum);
              const isHighlighted =
                ex !== undefined && ex.id === highlightedExhibitorId;
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
                  vectorEffect="non-scaling-stroke"
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
          </g>
        )}
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
