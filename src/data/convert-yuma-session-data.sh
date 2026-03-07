#!/bin/sh
# The order of replacements might matter due to overlapping day numbers like 27.
# do not forget the semicolons between s/1/2/g expressions
# Replaces dates in the yuma TypeScript file:
#   2026-02-27  →  2027-02-26
#   2026-02-28  →  2027-02-27
#
# Usage:
#   fix_dates.sh < input.sh > output.ts

sed 's/2026-02-28/2027-02-27/g; s/2026-02-27/2027-02-26/g'

#or simply:
#sed '...' < input.ts > output.ts
#
# python could do it in a similar way:
#
# import sys
# content = sys.stdin.read()
# content = content.replace("2026-02-28", "2027-02-27")
# content = content.replace("2026-02-27", "2027-02-26")
# sys.stdout.write(content)
#
# Run it: python fix_dates.py < input.ts > output.ts
#
# or perl: perl -pe 's/2026-02-28/2027-02-27/g; s/2026-02-27/2027-02-26/g' input.ts > output.ts
#
