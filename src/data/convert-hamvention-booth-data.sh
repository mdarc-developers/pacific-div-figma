#!/bin/bash
# 20260313 changed from many cut, echo and awk to a single awk

# Usage: ./convert-hamvention-booth-data.sh <building_number> <input.csv> <output.ts>
#
# like ../../public/assets/maps/hamvention-2026-building-3-tesla-coords.csv

BUILDNUM="${1}"
BUILDNAME="${2}"
INPUT="${3:-hamvention-2026-building-3-tesla-coords.csv}"
OUTPUT="${4:-hamvention-2026-booth-building-3-20260313.ts}"

if [[ -z "$BUILDNUM" || -z "$BUILDNAME" || -z "$INPUT" || -z "$OUTPUT" ]]; then
  echo "Usage: $0 <building_number> <building_name> <input.csv> <output.ts>"
  exit 1
fi

SVG_PATH="/assets/maps/hamvention-2026-building-${BUILDNUM}-${BUILDNAME}.svg"
LOCATION_ZONE="building-${BUILDNUM}"

awk -v svg_path="$SVG_PATH" -v zone="$LOCATION_ZONE" '
NR==1 { next }
{
  line = $0

  # booth_num is everything before the first comma
  booth_num = substr(line, 1, index(line, ",") - 1)

  # svgPoints: extract content between first and second double-quote
  start = index(line, "\"") + 1
  rest = substr(line, start)
  end = index(rest, "\"") - 1
  svg_points = substr(rest, 1, end)

  print "    {"
  print "      id: " booth_num ","
  print "      coords: ["

  n = split(svg_points, pairs, " ")
  for (i = 1; i <= n; i++) {
    split(pairs[i], xy, ",")
    x = int(xy[1] + 0.5)
    y = int(xy[2] + 0.5)
    print "        [" x ", " y "],"
  }

  print "      ],"
  print "      locationZone: \"" zone "\","
  print "    },"
}
' "$INPUT" | {
  echo 'import { Booth } from "@/types/conference";'
  echo ''
  echo 'export const mapBooths: [string, Booth[]] = ['
  echo "  \"${SVG_PATH}\","
  echo '  ['
  cat
  echo '  ],'
  echo '];'
} > "$OUTPUT"

echo "Done: $(( $(wc -l < "$INPUT") - 1 )) booths written to $OUTPUT"
