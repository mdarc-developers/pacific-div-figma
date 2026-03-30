import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { MapImage } from "@/types/conference";
import { conferenceModules } from "@/lib/conferenceData";

// Root of the Vite project — images live under public/ here
const PROJECT_ROOT = resolve(__dirname, "../../");

/**
 * Returns { width, height } for a PNG, JPEG, or SVG file buffer.
 * For SVG, dimensions are read from the viewBox attribute (preferred) or
 * from the width/height attributes (fallback), returned as rounded integers.
 * Skips non-image formats (e.g. PDF) by returning null.
 */
function getImageDimensions(
  buf: Buffer,
): { width: number; height: number } | null {
  // PNG: magic bytes 0-7, IHDR chunk starts at byte 8.
  // Width  is at bytes 16-19 (big-endian uint32).
  // Height is at bytes 20-23 (big-endian uint32).
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
    };
  }

  // JPEG: starts with 0xFF 0xD8.
  // Scan for SOF markers (0xFFC0–0xFFC3, 0xFFC5–0xFFC7, 0xFFC9–0xFFCB,
  // 0xFFCD–0xFFCF) which encode height (2 bytes) then width (2 bytes)
  // at offsets +3 and +5 from the marker start.
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset < buf.length - 1) {
      if (buf[offset] !== 0xff) break;
      const marker = buf[offset + 1];
      // SOF markers that encode dimensions
      const isSOF =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf);
      if (isSOF) {
        return {
          height: buf.readUInt16BE(offset + 5),
          width: buf.readUInt16BE(offset + 7),
        };
      }
      // Move to next marker: skip marker (2 bytes) + segment length (2 bytes,
      // includes the 2 length bytes themselves but not the 0xFF 0xXX marker).
      const segmentLength = buf.readUInt16BE(offset + 2);
      offset += 2 + segmentLength;
    }
  }

  // SVG: text-based format; look for an <svg> opening tag in the first 2 kB.
  // The tag can be multi-line (Inkscape style), so [^>]* handles embedded newlines.
  // Prefer viewBox (native coordinate space) over width/height attributes.
  const header = buf.toString("utf8", 0, Math.min(buf.length, 2048));
  const svgTagMatch = /<svg\b[^>]*>/i.exec(header);
  if (svgTagMatch) {
    const tag = svgTagMatch[0];
    // viewBox="minX minY width height"
    const vbMatch = /viewBox\s*=\s*["']([^"']*)["']/i.exec(tag);
    if (vbMatch) {
      const parts = vbMatch[1].trim().split(/[\s,]+/);
      if (parts.length === 4) {
        const w = parseFloat(parts[2]);
        const h = parseFloat(parts[3]);
        if (isFinite(w) && isFinite(h) && w > 0 && h > 0) {
          return { width: Math.round(w), height: Math.round(h) };
        }
      }
    }
    // Fall back to plain-number width/height attributes (no unit suffix).
    // Use a negative lookbehind to avoid matching compound attributes like stroke-width.
    const wMatch = /(?<![a-z-])width\s*=\s*["']([0-9.]+)["']/i.exec(tag);
    const hMatch = /(?<![a-z-])height\s*=\s*["']([0-9.]+)["']/i.exec(tag);
    if (wMatch && hMatch) {
      const w = parseFloat(wMatch[1]);
      const h = parseFloat(hMatch[1]);
      if (isFinite(w) && isFinite(h) && w > 0 && h > 0) {
        return { width: Math.round(w), height: Math.round(h) };
      }
    }
  }

  // Unsupported format (e.g. PDF)
  return null;
}

interface ConferenceModule {
  conferenceMaps?: MapImage[];
}

const allConferenceMaps: { label: string; maps: MapImage[] }[] = Object.entries(
  conferenceModules,
).map(([path, module]) => {
  const label = path.split("/").pop()?.replace(".ts", "") ?? "";
  return { label, maps: (module as ConferenceModule).conferenceMaps ?? [] };
});

describe("MapImage declared dimensions match actual image file dimensions", () => {
  for (const { label, maps } of allConferenceMaps) {
    const mapsWithDimensions = maps.filter(
      (m) => m.origWidthNum !== undefined || m.origHeightNum !== undefined,
    );

    if (mapsWithDimensions.length === 0) continue;

    describe(label, () => {
      for (const map of mapsWithDimensions) {
        it(`${map.name ?? map.id} (${map.url})`, () => {
          const filePath = resolve(
            PROJECT_ROOT,
            "public",
            map.url.replace(/^\//, ""),
          );
          const buf = readFileSync(filePath);

          const actual = getImageDimensions(buf);
          if (actual === null) {
            // Non-image format (e.g. PDF) — dimension measurement is not
            // supported; skip with a notice rather than fail.
            console.warn(
              `[mapImageDimensions] Unsupported format for dimension check (skipping): ${filePath}`,
            );
            return;
          }

          if (map.origWidthNum !== undefined) {
            expect(
              map.origWidthNum,
              `${label} / ${map.id}: origWidthNum ${map.origWidthNum} does not match actual image width ${actual.width} for ${map.url}`,
            ).toBe(actual.width);
          }

          if (map.origHeightNum !== undefined) {
            expect(
              map.origHeightNum,
              `${label} / ${map.id}: origHeightNum ${map.origHeightNum} does not match actual image height ${actual.height} for ${map.url}`,
            ).toBe(actual.height);
          }
        });
      }
    });
  }
});
