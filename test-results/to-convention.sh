#!/usr/bin/env bash
# to-convention.sh — split test-results/testoutput.txt by convention name.
#
# For each convention in the list, grep testoutput.txt (case-insensitive) and
# write matching lines to testoutput-{convention}-YYYYMMDD.txt in this same
# directory.
#
# Usage: bash test-results/to-convention.sh
#        (or run from within test-results/: ./to-convention.sh)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT="$SCRIPT_DIR/testoutput.txt"
DATE="$(date +%Y%m%d)"

conventions=(
  quartzfest
  hamcation
  yuma
  hamvention
  seapac
  huntsville
  pacificon
)

if [[ ! -f "$INPUT" ]]; then
  echo "ERROR: $INPUT not found. Run 'npm run testsave' first." >&2
  exit 1
fi

for convention in "${conventions[@]}"; do
  output="$SCRIPT_DIR/testoutput-${convention}-${DATE}.txt"
  grep -Eis "$convention" "$INPUT" > "$output" || true
  echo "Written: $output ($(wc -l < "$output") lines)"
done
