// PacificonSvgExhibitorMap.tsx
import { useEffect, useRef, useState } from "react";

// Dimensions from the viewBox of public/assets/maps/pacificon-no-booths.svg
const SVG_ORIGINAL_WIDTH = 27940;
const SVG_ORIGINAL_HEIGHT = 43180;
const ASPECT_RATIO = SVG_ORIGINAL_HEIGHT / SVG_ORIGINAL_WIDTH;

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
      <img
        src="/assets/maps/pacificon-no-booths.svg"
        alt="Pacificon Exhibitor Map"
        style={{
          display: "block",
          width: "100%",
          height: height !== undefined ? `${height}px` : "auto",
        }}
      />
    </div>
  );
}
