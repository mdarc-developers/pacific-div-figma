#!/bin/sh
# The order of replacements matters due to overlapping day numbers.
#   If numbers go up use this order. If numbers go down order is reversed.
#   Do not forget the semicolons between s/1/2/g expressions.
# Replaces dates in the hamvention TypeScript files:
#   2025-05-16  →  2026-05-15
#   2025-05-17  →  2026-05-16
#   2025-05-18  →  2026-05-17
#
# Usage:
#   convert-hamvention-session-data.sh < input.ts > output.ts

sed 's/2025-05-16/2026-05-15/g; s/2025-05-17/2026-05-16/g; s/2025-05-18/2026-05-17/g'

#or simply:
# sed '...' < intput.ts > output.ts

