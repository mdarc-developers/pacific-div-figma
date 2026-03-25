// PacificonSvgExhibitorMap.tsx
import { useEffect, useRef, useState } from "react";
import {
  SVG_VIEWBOX_WIDTH,
  SVG_VIEWBOX_HEIGHT,
  TABLE_PATHS,
  TABLE_TEXTS,
} from "@/data/pacificonSvgExhibitorMapData";

const ASPECT_RATIO = SVG_VIEWBOX_HEIGHT / SVG_VIEWBOX_WIDTH;

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
       * shares the same viewBox, then draw the table paths and labels on top.
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
          href="/assets/maps/pacificon-no-booths.svg"
          x={0}
          y={0}
          width={SVG_VIEWBOX_WIDTH}
          height={SVG_VIEWBOX_HEIGHT}
        />

        {/* Re-added table/booth fill and outline paths */}
        {TABLE_PATHS.map((p, i) => (
          <path
            key={`tp-${i}`}
            fill={p.fill}
            stroke={p.stroke}
            {...(p.strokeWidth !== undefined && { strokeWidth: p.strokeWidth })}
            d={p.d}
          />
        ))}

        {/* Re-added table/booth text labels */}
        {TABLE_TEXTS.map((t, i) => (
          <text
            key={`tt-${i}`}
            x={t.x}
            y={t.y}
            fontSize={t.fontSize}
            fontWeight={t.fontWeight}
            fill={t.fill}
            fontFamily="Arial, sans-serif"
            {...(t.transform && { transform: t.transform })}
            {...(t.textLength !== null && {
              textLength: t.textLength,
              lengthAdjust: "spacingAndGlyphs",
            })}
          >
            {t.content}
          </text>
        ))}
      </svg>
    </div>
  );
}
