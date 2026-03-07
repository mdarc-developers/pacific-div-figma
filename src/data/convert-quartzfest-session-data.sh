#!/bin/sh
# The order of replacements matters due to overlapping day numbers.
#   If numbers go up use this order. If numbers go down order is reversed.
#   Do not forget the semicolons between s/1/2/g expressions.
# Replaces dates in the quartzfest TypeScript files:
#   2026-01-18  →  2027-01-17
#   2026-01-19  →  2027-01-18
#   2026-01-20  →  2027-01-19
#   2026-01-21  →  2027-01-20
#   2026-01-22  →  2027-01-21
#   2026-01-23  →  2027-01-22
#   2026-01-24  →  2027-01-23
#
# Usage:
#   convert-quartzfest-session-data.sh < input.ts > output.ts

sed 's/2026-01-18/2027-01-17/g; s/2026-01-19/2027-01-18/g; s/2026-01-20/2027-01-19/g; s/2026-01-21/2027-01-20/g; s/2026-01-22/2027-01-21/g; s/2026-01-23/2027-01-22/g; s/2026-01-24/2027-01-23/g'

#or simply:
# sed '...' < intput.ts > output.ts

