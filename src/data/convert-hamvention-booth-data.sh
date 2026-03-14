#!/bin/bash
# 20260313
# Usage: ./convert-hamvention-booth-data.sh input.csv output.ts
#
# like ../../public/assets/maps/hamvention-2026-building-1-maxim-coords.csv

INPUT="${1:-hamvention-2026-building-2-tesla-coords.csv}"
OUTPUT="${2:-hamvention-2026-booth-building-2-20260313.ts}"

{
  echo 'import { Booth } from "@/types/conference";'
  echo ''
  echo 'export const mapBooths: [string, Booth[]] = ['
  echo '  "/assets/maps/hamvention-2026-building-2-tesla.svg",'
  echo '  ['

  tail -n +2 "$INPUT" | while IFS= read -r line; do
    booth_num=$(echo "$line" | cut -d',' -f1)
    # svgPoints is the 5th column, quoted: extract content between first pair of quotes
    svg_points=$(echo "$line" | grep -oP '(?<=")[^"]+(?=",")')

    echo '    {'
    echo "      id: ${booth_num},"
    echo '      coords: ['

    for pair in $svg_points; do
      x=$(echo "$pair" | cut -d',' -f1 | awk '{printf "%d", int($1 + 0.5)}')
      y=$(echo "$pair" | cut -d',' -f2 | awk '{printf "%d", int($1 + 0.5)}')
      echo "        [${x}, ${y}],"
    done

    echo '      ],'
    echo '      locationZone: "building-2",'
    echo '    },'
  done

  echo '  ],'
  echo '];'
} > "$OUTPUT"

echo "Done: $(tail -n +2 "$INPUT" | wc -l) booths written to $OUTPUT"

