#!/bin/bash
set -e
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 /path/to/font.pcf[.gz]"
  exit 2
fi
SRC="$1"
if ! command -v pcf2bdf >/dev/null 2>&1; then
  echo "pcf2bdf is not installed."
  echo "Install a PCF-to-BDF converter on this Mac, then run this script again."
  exit 3
fi
TMP="$SRC"
CLEANUP=""
if [[ "$SRC" == *.gz ]]; then
  TMP="$(mktemp /tmp/kek-font.XXXXXX.pcf)"
  gzip -dc "$SRC" > "$TMP"
  CLEANUP="$TMP"
fi
BASE="${SRC%.gz}"
OUT="${BASE%.pcf}.bdf"
pcf2bdf "$TMP" > "$OUT"
[ -n "$CLEANUP" ] && rm -f "$CLEANUP"
echo "Created: $OUT"
