#!/bin/sh
# The order of replacements matters due to overlapping day numbers.
#   If numbers go down use this order. If numbers go up order is reversed.
#   Do not forget the semicolons between s/1/2/g expressions.
# Replaces dates in the hamcation TypeScript files:
#   2026-02-13  →  2027-02-12
#   2026-02-14  →  2027-02-13
#   2026-02-15  →  2027-02-14
#
# Usage:
#   convert-hamcation-session-data.sh < input.ts > output.ts

sed 's/2026-02-13/2027-02-12/g; s/2026-02-14/2027-02-13/g; s/2026-02-15/2027-02-14/g'

#or simply:
# sed '...' < intput.ts > output.ts

