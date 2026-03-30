#!/usr/bin/env bash
# testlog-to-convention.sh — split test-results/testoutput.txt by convention name.
#
# Reads conventions from src/data/*-20??.ts filenames.
# Steps through each line of testoutput.txt, prepends the line number,
# and writes the line to the first matching testoutput-{convention}-YYYYMMDD.txt.
# Lines not matching any convention go to testoutput-other-YYYYMMDD.txt.
#
# Usage: bash scripts/testlog-to-convention.sh
#        (run from the project root or from within scripts/)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INPUT="$PROJECT_ROOT/test-results/testoutput.txt"
OUTPUT_DIR="$PROJECT_ROOT/test-results"
DATE="$(date +%Y%m%d)"

# Build conventions array from src/data/*-20??.ts filenames
conventions=()
for f in "$PROJECT_ROOT"/src/data/*-20??.ts; do
  base="$(basename "$f" .ts)"
  conventions+=("$base")
done

if [[ ${#conventions[@]} -eq 0 ]]; then
  echo "ERROR: No convention files found in $PROJECT_ROOT/src/data/" >&2
  exit 1
fi

if [[ ! -f "$INPUT" ]]; then
  echo "ERROR: $INPUT not found. Run 'npm run testsave' first." >&2
  exit 1
fi

# Truncate output files before processing
for convention in "${conventions[@]}"; do
  : > "$OUTPUT_DIR/testoutput-${convention}-${DATE}.txt"
done
: > "$OUTPUT_DIR/testoutput-other-${DATE}.txt"

# Process each line: prepend line number, route to first matching convention
line_num=0
while IFS= read -r line || [[ -n "$line" ]]; do
  line_num=$((line_num + 1))
  matched=false
  for convention in "${conventions[@]}"; do
    if echo "$line" | grep -qiF "$convention"; then
      echo "${line_num}: ${line}" >> "$OUTPUT_DIR/testoutput-${convention}-${DATE}.txt"
      matched=true
      break
    fi
  done
  if ! $matched; then
    echo "${line_num}: ${line}" >> "$OUTPUT_DIR/testoutput-other-${DATE}.txt"
  fi
done < "$INPUT"

# Print summary
echo "Processed $line_num lines from $INPUT"
for convention in "${conventions[@]}"; do
  count=$(wc -l < "$OUTPUT_DIR/testoutput-${convention}-${DATE}.txt")
  echo "  Written: testoutput-${convention}-${DATE}.txt ($count lines)"
done
other_count=$(wc -l < "$OUTPUT_DIR/testoutput-other-${DATE}.txt")
echo "  Written: testoutput-other-${DATE}.txt ($other_count lines)"
