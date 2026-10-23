#!/usr/bin/env python3
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
e=json.loads((ROOT/"evidence"/"ULTRIX43_TERMINAL10_EVIDENCE.json").read_text())
assert e["font_xlfd"] == "-DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1"
assert e["cell_metrics"] == [8,15]
assert e["font_ascent"] == 12 and e["font_descent"] == 3
assert e["pcf_sha256"] == "46cdbd6f8656ddd7704df99f2103274c9ae9ffe1fc829ae57f92f6bb910d89d5"
assert e["reconstructed_bdf_sha256"] == "7cfc76e2e45ebfceb0e8d7fb1632e0710a550bac4dbe14e2ddf7c2bc94e84033"
print("PASS: ULTRIX 4.3 terminal10 media evidence metadata")
