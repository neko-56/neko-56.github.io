#!/bin/bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 /path/to/font.pcf[.Z|.gz]"
  exit 2
fi
SRC="$1"
BASE="$SRC"
BASE="${BASE%.gz}"
BASE="${BASE%.Z}"
BASE="${BASE%.z}"
OUT="${BASE%.pcf}.bdf"
/usr/bin/env python3 "$HERE/pcf_reader.py" "$SRC" -o "$OUT"
echo "Created: $OUT"
