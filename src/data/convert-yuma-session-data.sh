#!/bin/sh
# The order of replacements might matter due to overlapping 27 day numbers.
# Replaces dates in the yuma TypeScript file:
#   2026-02-27  →  2027-02-26
#   2026-02-28  →  2027-02-27
#
# Usage:
#   cat input.ts | sh fix_dates.sh > output.ts

sed 's/2026-02-28/2027-02-27/g; s/2026-02-27/2027-02-26/g'

#or simply:
#sed 's/2026-02-28/2027-02-27/g; s/2026-02-27/2027-02-26/g' yuma-2027-session-x.ts > yuma-2027-session-20260302.ts
#
# python could do it in a similar way:
#
# import sys
# content = sys.stdin.read()
# content = content.replace("2026-02-28", "2027-02-27")
# content = content.replace("2026-02-27", "2027-02-26")
# sys.stdout.write(content)
#
# Run it: python fix_dates.py < yuma-2027-session-x.ts > yuma-2027-session-20260302.ts
#
# or perl: perl -pe 's/2026-02-28/2027-02-27/g; s/2026-02-27/2027-02-26/g' yuma-2027-session-x.ts > yuma-2027-session-20260302.ts
#
