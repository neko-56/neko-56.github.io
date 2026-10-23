#!/bin/bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
if [ "$#" -lt 1 ]; then
  echo "Usage:"
  echo "  $0 /path/to/Ultrix_RISC_4.3_OS.iso [output-directory]"
  echo
  echo "Tip: drag the ISO from Finder into Terminal after this command."
  exit 2
fi
MEDIA="$1"
OUT="${2:-$PWD/phase6-ultrix-fonts}"
exec /usr/bin/env python3 "$HERE/extract_ultrix_dec_terminal.py" "$MEDIA" -o "$OUT"
