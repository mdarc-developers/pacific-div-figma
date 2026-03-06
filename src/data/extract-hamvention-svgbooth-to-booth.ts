// extract-hamvention-svgbooth-to-booth.ts
//
// Tool: converts SvgBooth[] data (from extract-booth-from-svg.html) into
//       a ready-to-check-in Booth[] TypeScript source module.
//
// Usage (run as a script):
//   npx tsx src/data/extract-hamvention-svgbooth-to-booth.ts \
//     [-i | --input ]  <csv-file>   CSV produced by extract-booth-from-svg.html
//     --building <zone>             location zone label (e.g. "building-1")
//     --svg-url <url>               SVG asset URL (e.g. /assets/maps/foo.svg)
//     [-v | --verbose]              print debug info to stderr
//
// Output is written to stdout; redirect to a dated data file:
//   npx tsx src/data/extract-hamvention-svgbooth-to-booth.ts \
//     --input  public/assets/maps/hamvention-2026-building-1-maxim-coords.csv \
//     --building building-1 \
//     --svg-url /assets/maps/hamvention-2026-building-1-maxim.svg \
//     > src/data/hamvention-2026-booth-building-1-$(date +%Y%m%d).ts
//
// The generated file exports `mapBooths: [string, Booth[]]` — the same shape
// used by the conferenceData loader in src/lib/conferenceData.ts.
//
// must change import and several hard coded variables at the bottom

import { readFileSync } from "node:fs";
import type { Booth } from "@/types/conference";

/** Shape of a row in the CSV produced by extract-booth-from-svg.html. */
export interface SvgBooth {
  /** Booth number as shown on the exhibitor map */
  boothNum: number;
  /** Center x coordinate in SVG space (for label placement) */
  cx: number;
  /** Center y coordinate in SVG space (for label placement) */
  cy: number;
  /** Polygon corner points in SVG coordinate space ("x,y ..."), y measured from top */
  svgPoints: string;
  /** Polygon corners in Booth[] format [[y_bottom, x], ...], y measured from bottom */
  coords: [number, number][];
}

/**
 * Convert an array of SVG booth records into the Booth[] format used by the
 * Leaflet map overlay and the exhibitor data layer.
 *
 * @param svgBooths     Source data extracted from an SVG floor-plan.
 * @param locationZone  Human-readable zone label stored on every Booth record.
 */
export function convertSvgBoothsToBooth(
  svgBooths: SvgBooth[],
  locationZone: string,
): Booth[] {
  return svgBooths.map((b) => ({
    id: b.boothNum,
    coords: b.coords,
    locationZone,
  }));
}

// ── CSV helpers ───────────────────────────────────────────────────────────────

/** Parse one CSV line, respecting double-quoted fields (RFC 4180). */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let j = i + 1;
      let field = "";
      while (j < line.length) {
        if (line[j] === '"' && line[j + 1] === '"') {
          field += '"';
          j += 2;
        } else if (line[j] === '"') {
          j++;
          break;
        } else {
          field += line[j++];
        }
      }
      fields.push(field);
      i = j;
      if (i < line.length && line[i] === ",") i++;
    } else {
      let j = i;
      while (j < line.length && line[j] !== ",") j++;
      fields.push(line.slice(i, j));
      i = j + 1;
    }
  }
  return fields;
}

/**
 * Parse the CSV produced by extract-booth-from-svg.html into SvgBooth[].
 * Expected columns: booth_num, path_id, center_svg_x, center_svg_y, svgPoints, coords
 */
function parseSvgBoothsFromCSV(
  csvContent: string,
  verbose: boolean,
): SvgBooth[] {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error("CSV file is empty or has no data rows.");
  }
  const header = parseCSVLine(lines[0]).map((h) => h.trim());
  if (verbose) {
    process.stderr.write(`[verbose] CSV columns: ${header.join(", ")}\n`);
  }
  const col = (name: string): number => {
    const idx = header.indexOf(name);
    if (idx === -1) throw new Error(`Missing CSV column: "${name}"`);
    return idx;
  };
  const boothNumIdx = col("booth_num");
  const cxIdx = col("center_svg_x");
  const cyIdx = col("center_svg_y");
  const svgPointsIdx = col("svgPoints");
  const coordsIdx = col("coords");

  const booths: SvgBooth[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const fields = parseCSVLine(line);
    const boothNum = parseInt(fields[boothNumIdx], 10);
    const cx = parseFloat(fields[cxIdx]);
    const cy = parseFloat(fields[cyIdx]);
    const svgPoints = fields[svgPointsIdx];
    let coords: [number, number][];
    try {
      coords = JSON.parse(fields[coordsIdx]) as [number, number][];
    } catch {
      throw new Error(
        `Row ${i}: invalid JSON in coords column: ${fields[coordsIdx]}`,
      );
    }
    booths.push({ boothNum, cx, cy, svgPoints, coords });
    if (verbose) {
      process.stderr.write(
        `[verbose]   row ${i}: boothNum=${boothNum}, cx=${cx}, cy=${cy}, ` +
          `pts="${svgPoints.slice(0, 30)}...", coords[0]=${JSON.stringify(coords[0])}\n`,
      );
    }
  }
  return booths;
}

// ── TypeScript code generator ─────────────────────────────────────────────────

function generateBoothTsCode(
  svgUrl: string,
  booths: Booth[],
  sourceName: string,
): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const boothsJson = JSON.stringify(booths, null, 2);
  return `\
// Auto-generated by extract-hamvention-svgbooth-to-booth.ts on ${date}
// Source: ${sourceName}
// Do not edit by hand — re-run the tool to regenerate.

import type { Booth } from "@/types/conference";

export const mapBooths: [string, Booth[]] = [
  "${svgUrl}",
  ${boothsJson} as Booth[],
];
`;
}

// ── CLI entry-point ──────────────────────────────────────────────────────────
// When this file is executed directly (e.g. via `npx tsx`), it reads a CSV
// file of booth data and prints a ready-to-use TypeScript module to stdout.
// Redirect the output to a dated data file and check it in.
//
// Detect whether this module is the direct entry point.
// Compare the pathname of import.meta.url (e.g. /path/to/file.ts) against
// process.argv[1] (the script path supplied by Node.js / tsx).
// Using new URL() instead of fileURLToPath avoids a node:url dependency that
// breaks when this module is bundled for the browser.
const isMain =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv.length > 1 &&
  new URL(import.meta.url).pathname === process.argv[1];

if (isMain) {
  const args = process.argv.slice(2);
  let inputFile = "";
  let building = "";
  let svgUrl = "";
  let verbose = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-v" || a === "--verbose") {
      verbose = true;
    } else if (a === "--input" && args[i + 1]) {
      inputFile = args[++i];
    } else if (a === "--building" && args[i + 1]) {
      building = args[++i];
    } else if (a === "--svg-url" && args[i + 1]) {
      svgUrl = args[++i];
    } else if (!a.startsWith("-")) {
      // Positional args: input, building, svg-url (in that order)
      if (!inputFile) inputFile = a;
      else if (!building) building = a;
      else if (!svgUrl) svgUrl = a;
    }
  }

  if (!inputFile || !building || !svgUrl) {
    process.stderr.write(
      `Usage: npx tsx src/data/extract-hamvention-svgbooth-to-booth.ts \\\n` +
        `  -i, --input <csv-file> --building <zone> --svg-url <url> [-v]\n\n` +
        `  --input <csv-file>   CSV produced by extract-booth-from-svg.html\n` +
        `  --building <zone>    Location zone label (e.g. "building-1")\n` +
        `  --svg-url <url>      SVG asset URL (e.g. /assets/maps/foo.svg)\n` +
        `  -v, --verbose        Print debug info to stderr\n`,
    );
    process.exit(1);
  }

  if (verbose) {
    process.stderr.write(`[verbose] input:    ${inputFile}\n`);
    process.stderr.write(`[verbose] building: ${building}\n`);
    process.stderr.write(`[verbose] svg-url:  ${svgUrl}\n`);
  }

  const csvContent = readFileSync(inputFile, "utf8");
  if (verbose) {
    process.stderr.write(
      `[verbose] Read ${csvContent.length} bytes from ${inputFile}\n`,
    );
  }

  const svgBooths = parseSvgBoothsFromCSV(csvContent, verbose);
  if (verbose) {
    process.stderr.write(`[verbose] Parsed ${svgBooths.length} booths\n`);
  }

  const booths = convertSvgBoothsToBooth(svgBooths, building);
  if (verbose) {
    process.stderr.write(
      `[verbose] Converted to ${booths.length} Booth records\n`,
    );
  }

  const sourceName = inputFile.split("/").pop() ?? inputFile;
  const code = generateBoothTsCode(svgUrl, booths, sourceName);
  process.stdout.write(code);
}
