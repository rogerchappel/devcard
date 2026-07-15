#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

npm run build >/dev/null

rm -rf .tmp/devcard-demo
mkdir -p .tmp/devcard-demo

node bin/devcard.js generate \
  --config fixtures/basic/devcard.json \
  --output .tmp/devcard-demo/README.generated.md \
  --validate safe

test -s .tmp/devcard-demo/README.generated.md
grep -q "Forge Example" .tmp/devcard-demo/README.generated.md
grep -q "## Validation" .tmp/devcard-demo/README.generated.md

printf 'Generated demo profile README: .tmp/devcard-demo/README.generated.md\n'
