#!/bin/bash
set -u

ROOT="$(cd "$(dirname "$0")" && pwd)"
PY="$ROOT/emulator/tools/extract_ultrix_dec_terminal_density_pair.py"

say_dialog() {
  local message="$1"
  local title="${2:-KEK Phase 6}"
  if command -v osascript >/dev/null 2>&1; then
    /usr/bin/osascript -e "display dialog $(printf '%q' "$message" | sed "s/^/'/;s/$/'/") with title $(printf '%q' "$title" | sed "s/^/'/;s/$/'/") buttons {\"OK\"} default button \"OK\"" >/dev/null 2>&1 || true
  fi
}

choose_iso() {
  /usr/bin/osascript <<'APPLESCRIPT'
try
  set f to choose file with prompt "Ultrix_RISC_4.3_OS.iso を選択してください" of type {"iso", "public.iso-image"}
  return POSIX path of f
on error number -128
  return ""
end try
APPLESCRIPT
}

if [ ! -f "$PY" ]; then
  echo "ERROR: extractor not found: $PY"
  read -r -p "Returnで終了..." _
  exit 1
fi

ISO="${1:-}"
if [ -z "$ISO" ]; then
  if command -v osascript >/dev/null 2>&1; then
    ISO="$(choose_iso)"
  else
    echo "ISO path is required."
    exit 2
  fi
fi

if [ -z "$ISO" ]; then
  echo "Canceled."
  exit 0
fi

if [ ! -f "$ISO" ]; then
  echo "ERROR: file not found: $ISO"
  read -r -p "Returnで終了..." _
  exit 1
fi

BASE="${HOME}/Desktop"
if [ ! -d "$BASE" ]; then BASE="$HOME"; fi
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BASE/KEK-Phase6-2-ULTRIX-font-selection-$STAMP"
ZIP="$BASE/KEK-Phase6-2-ULTRIX-font-selection-$STAMP.zip"
LOG="$OUT/extraction.log"
mkdir -p "$OUT"

{
  echo "KEK Phase 6.2 - ULTRIX 4.3 DEC Terminal 75dpi/100dpi extractor"
  echo "ISO: $ISO"
  echo "Output: $OUT"
  echo
  /usr/bin/env python3 "$PY" "$ISO" -o "$OUT"
} 2>&1 | tee "$LOG"
STATUS=${PIPESTATUS[0]}

if [ "$STATUS" -ne 0 ]; then
  echo
  echo "FAILED. Log: $LOG"
  if command -v open >/dev/null 2>&1; then open -R "$LOG" >/dev/null 2>&1 || true; fi
  if command -v osascript >/dev/null 2>&1; then
    /usr/bin/osascript -e 'display dialog "抽出に失敗しました。Finderで extraction.log を表示します。その小さなlogだけ送ってください。" with title "KEK Phase 6" buttons {"OK"} default button "OK"' >/dev/null 2>&1 || true
  fi
  read -r -p "Returnで終了..." _
  exit "$STATUS"
fi

# Add a compact handoff note so the user knows exactly what to upload.
cat > "$OUT/SEND_THIS_RESULT.txt" <<TXT
KEK Phase 6.2 75dpi/100dpi extraction result

Please send only this ZIP back to ChatGPT:
$(basename "$ZIP")

The original 229.8 MB ULTRIX ISO is NOT needed.
Important files inside:
- phase6-2-font-selection-report.json
- 75dpi/      (UDWFONT430 evidence and converted BDF)
- 100dpi/     (UDWFONT15430 evidence and converted BDF)
- extraction.log
TXT

# Create a small result ZIP. Prefer ditto on macOS; fall back to zip.
if command -v ditto >/dev/null 2>&1; then
  /usr/bin/ditto -c -k --sequesterRsrc --keepParent "$OUT" "$ZIP"
elif command -v zip >/dev/null 2>&1; then
  (cd "$(dirname "$OUT")" && /usr/bin/zip -qry "$ZIP" "$(basename "$OUT")")
else
  echo "WARNING: Could not create ZIP automatically; result folder is $OUT"
fi

echo
echo "SUCCESS"
echo "Result folder: $OUT"
if [ -f "$ZIP" ]; then
  echo "Upload only this file: $ZIP"
  if command -v open >/dev/null 2>&1; then open -R "$ZIP" >/dev/null 2>&1 || true; fi
  if command -v osascript >/dev/null 2>&1; then
    /usr/bin/osascript -e 'display dialog "抽出が完了しました。Finderで結果ZIPを表示します。元のULTRIX ISOは送らず、この小さいZIPだけChatGPTへ送ってください。" with title "KEK Phase 6" buttons {"OK"} default button "OK"' >/dev/null 2>&1 || true
  fi
else
  if command -v open >/dev/null 2>&1; then open "$OUT" >/dev/null 2>&1 || true; fi
fi

read -r -p "Returnで終了..." _
