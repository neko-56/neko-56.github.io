#!/bin/bash
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$HERE/historical-source-downloads"
mkdir -p "$OUT"

fetch(){
  local url="$1" out="$2"
  echo "==> $out"
  curl -L --fail --retry 2 --connect-timeout 20 -A "Mozilla/5.0 historical research" "$url" -o "$OUT/$out" || {
    echo "FAILED: $url"; rm -f "$OUT/$out"; return 0;
  }
}

# Near-contemporary 1992 documentation used by the emulator.
fetch "https://www.w3.org/History/19921103-hypertext/hypertext/WWW/News/9204.html" "W3_News_1992-04.html"
fetch "https://www.w3.org/History/19921103-hypertext/hypertext/WWW/News/9209.html" "W3_News_1992-09.html"
fetch "https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/QuickGuide.html" "LMB_QuickGuide_1992-11-03.html"
fetch "https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/Commands.html" "LMB_Commands_1992-11-03.html"
fetch "https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Internals.html" "LMB_Internals_1992-11-03.html"
fetch "https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/Customisation.html" "LMB_Customisation_1992-11-03.html"

# Later source lineage. DO NOT label these as Morita's 1992 executable.
fetch "https://www.w3.org/History/1992/WWWLineMode_2.11.tar.Z" "LATER_REFERENCE_WWWLineMode_2.11.tar.Z"
fetch "https://www.w3.org/History/1992/WWWLineMode_2.12.tar.Z" "LATER_REFERENCE_WWWLineMode_2.12.tar.Z"
fetch "https://www.w3.org/History/1992/WWWLineModeDefaults.tar.Z" "LATER_REFERENCE_WWWLineModeDefaults.tar.Z"

cat > "$OUT/README.txt" <<'EOF'
IMPORTANT:
WWWLineMode_2.11 / 2.12 are kept for later source-lineage comparison.
They are NOT treated as the exact browser source used on 1992-09-30.
See ../docs/SOURCE_VERSION_POLICY.md.
EOF

echo "Saved under: $OUT"
