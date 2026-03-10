#!/bin/sh
# The order of replacements does not matter due to non-overlapping day numbers.
#   If numbers go up use this order of commands.
#   If numbers go down order is reversed.
#   Do not forget the semicolons between s/1/2/g expressions.
# Replaces dates in the seapac TypeScript files:
#   2025-05-30  →  2026-06-05
#   2025-05-31  →  2026-06-06
#   2025-06-01  →  2026-06-07
#
# Usage:
#   convert-seapac-session-data.sh < input.ts > output.ts

sed 's/2025-05-30/2026-06-05/g; s/2025-05-31/2026-06-06/g; s/2025-06-01/2026-06-07/g'

#or simply:
# sed '...' < intput.ts > output.ts

