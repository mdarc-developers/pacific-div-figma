// HamventionSvgExhibitorMap.tsx
// Renders the Hamvention Building 1 exhibitor map using the extracted SVG directly.
// Booth polygons from the CSV data are overlaid as interactive SVG elements.
// Supports mouse-wheel zoom, click-drag pan, and touch pinch-to-zoom / drag.
import React, { useRef, useState } from "react";
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

const MIN_VB_WIDTH = SVG_WIDTH / 10; // maximum 10× zoom
const ZOOM_FACTOR_IN = 0.75;
const ZOOM_FACTOR_OUT = 1 / ZOOM_FACTOR_IN;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function constrainVb(vb: ViewBox): ViewBox {
  const w = clamp(vb.w, MIN_VB_WIDTH, SVG_WIDTH);
  const h = (w / SVG_WIDTH) * SVG_HEIGHT;
  const x = clamp(vb.x, 0, SVG_WIDTH - w);
  const y = clamp(vb.y, 0, SVG_HEIGHT - h);
  return { x, y, w, h };
}

export function HamventionSvgExhibitorMap({
  mapExhibitors,
  highlightedExhibitorId,
  onHighlightChange,
}: HamventionSvgExhibitorMapProps) {
  const [tip, setTip] = useState<Tooltip | null>(null);
  const [vb, setVb] = useState<ViewBox>({
    x: 0,
    y: 0,
    w: SVG_WIDTH,
    h: SVG_HEIGHT,
  });
  const [isPanning, setIsPanning] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const pinchDistRef = useRef<number | null>(null);
  // Keep a ref that always reflects the latest vb for use inside event handlers
  const vbRef = useRef<ViewBox>(vb);

  function applyVb(next: ViewBox) {
    const constrained = constrainVb(next);
    vbRef.current = constrained;
    setVb(constrained);
  }

  function zoomAround(factor: number, svgCx: number, svgCy: number) {
    const prev = vbRef.current;
    const newW = clamp(prev.w * factor, MIN_VB_WIDTH, SVG_WIDTH);
    const newH = (newW / SVG_WIDTH) * SVG_HEIGHT;
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

  // Build booth-number → exhibitor lookup
  const boothToExhibitor = new Map<number, Exhibitor>();
  for (const ex of mapExhibitors) {
    for (const loc of ex.location) {
      boothToExhibitor.set(loc, ex);
    }
  }

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
    booth: SvgBooth,
    e: React.MouseEvent<SVGPolygonElement>,
  ) => {
    if (dragRef.current) return; // suppress tooltip while panning
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
    if (dragRef.current) return; // ignore click at end of drag
    const ex = boothToExhibitor.get(booth.boothNum);
    if (!ex) return;
    onHighlightChange(
      highlightedExhibitorId === ex.id ? undefined : ex.id,
    );
  };

  const handleZoomIn = () => {
    const cur = vbRef.current;
    zoomAround(ZOOM_FACTOR_IN, cur.x + cur.w / 2, cur.y + cur.h / 2);
  };
  const handleZoomOut = () => {
    const cur = vbRef.current;
    zoomAround(ZOOM_FACTOR_OUT, cur.x + cur.w / 2, cur.y + cur.h / 2);
  };
  const handleResetZoom = () =>
    applyVb({ x: 0, y: 0, w: SVG_WIDTH, h: SVG_HEIGHT });

  const handleSvgMouseLeave = () => {
    setTip(null);
    stopMouseDrag();
  };

  const isZoomed = vb.w < SVG_WIDTH;

  return (
    <div style={{ position: "relative", fontFamily: "Arial, sans-serif" }}>
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
            ...(isZoomed ? [{ label: "⊙", title: "Reset zoom", onClick: handleResetZoom }] : []),
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
