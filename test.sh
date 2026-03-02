#!/usr/bin/env bash
# Run npm tests from the project root regardless of the current working directory.
# Usage: ./test.sh [vitest options]
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
npm run test -- "$@"
