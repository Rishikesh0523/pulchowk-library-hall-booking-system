#!/usr/bin/env bash
# Re-render every .mmd file in this folder to PNG + SVG.
# Usage: ./render.sh
set -euo pipefail

cd "$(dirname "$0")"

for f in *.mmd; do
  base="${f%.mmd}"
  echo ">> $f"
  npx -y -p @mermaid-js/mermaid-cli mmdc -i "$f" -o "${base}.png" -b white -w 1600 -t neutral
  npx -y -p @mermaid-js/mermaid-cli mmdc -i "$f" -o "${base}.svg" -b white          -t neutral
done

echo ""
echo "Done. Rendered:"
ls -la *.png *.svg
