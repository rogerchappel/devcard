#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

printf 'Running devcard validation...\n'

npm test
npm run check
npm run build
npm run smoke
npm pack --dry-run >/dev/null

printf 'Validation passed.\n'
