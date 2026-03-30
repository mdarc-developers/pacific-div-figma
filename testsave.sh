#!/usr/bin/env bash
# Run npm tests and save results to test-results/testoutput.txt with timestamps.
# Usage: ./testsave.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

mkdir -p test-results

date --utc > test-results/testoutput.txt
hostname >> test-results/testoutput.txt

npm test >> test-results/testoutput.txt 2>&1
VITEST_EXIT=$?

date --utc >> test-results/testoutput.txt

exit $VITEST_EXIT
