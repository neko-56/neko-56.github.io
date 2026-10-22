#!/usr/bin/env python3
"""Verify the GitHub Pages DEC Terminal bitmap asset.

The public asset is intentionally not required to carry the ULTRIX 100-dpi
metadata.  Equivalence is evaluated in the terminal's physical 8 x 15 cell:
each BDF glyph is placed relative to the common baseline and the resulting
1-bit cell raster is compared by encoding.

Usage:
  python3 tools/verify_dec_terminal_equivalence.py
  python3 tools/verify_dec_terminal_equivalence.py --historical /path/terminal10.bdf
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "assets/fonts/dec-terminal/dec-terminal-xconsortium-verified.bdf"
EVIDENCE = ROOT / "evidence/DEC_TERMINAL_GLYPH_EQUIVALENCE.json"
CELL_W = 8
CELL_H = 15
BASELINE = 12
PUBLIC_TERM14_SHA256 = "b93ab33ead159d11a4e503ab71c72b7b51802a35de27d5a326ab4648f448f081"
PUBLIC_TERM14_SIZE = 22065


def parse_bdf(path: Path) -> dict:
    lines = path.read_text(encoding="utf-8").replace("\r", "").splitlines()
    font = {"name": "", "ascent": 0, "descent": 0, "glyphs": {}}
    glyph = None
    in_props = False
    in_bitmap = False
    for line in lines:
        if line.startswith("FONT "):
            font["name"] = line[5:].strip()
        elif line.startswith("STARTPROPERTIES"):
            in_props = True
        elif line == "ENDPROPERTIES":
            in_props = False
        elif in_props and line.startswith("FONT_ASCENT "):
            font["ascent"] = int(line.split()[1])
        elif in_props and line.startswith("FONT_DESCENT "):
            font["descent"] = int(line.split()[1])
        elif line.startswith("STARTCHAR "):
            glyph = {
                "name": line[10:].strip(), "encoding": -1,
                "dwidth": (0, 0), "bbx": (0, 0, 0, 0), "bitmap": []
            }
            in_bitmap = False
        elif glyph is not None and line.startswith("ENCODING "):
            glyph["encoding"] = int(line.split()[1])
        elif glyph is not None and line.startswith("DWIDTH "):
            glyph["dwidth"] = tuple(map(int, line.split()[1:3]))
        elif glyph is not None and line.startswith("BBX "):
            glyph["bbx"] = tuple(map(int, line.split()[1:5]))
        elif glyph is not None and line == "BITMAP":
            glyph["bitmap"] = []
            in_bitmap = True
        elif glyph is not None and line == "ENDCHAR":
            if glyph["encoding"] >= 0:
                font["glyphs"][glyph["encoding"]] = glyph
            glyph = None
            in_bitmap = False
        elif glyph is not None and in_bitmap and re.fullmatch(r"[0-9A-Fa-f]+", line):
            glyph["bitmap"].append(line.upper())
    return font


def glyph_cell(font: dict, glyph: dict) -> tuple[str, ...]:
    rows = [["0"] * CELL_W for _ in range(CELL_H)]
    width, height, xoff, yoff = glyph["bbx"]
    top = BASELINE - (height + yoff)
    for row_index, hex_row in enumerate(glyph["bitmap"][:height]):
        bits = "".join(f"{int(ch, 16):04b}" for ch in hex_row)
        for col in range(min(width, len(bits))):
            if bits[col] != "1":
                continue
            x = xoff + col
            y = top + row_index
            if 0 <= x < CELL_W and 0 <= y < CELL_H:
                rows[y][x] = "1"
    return tuple("".join(row) for row in rows)


def raster_digest(font: dict, encodings: list[int]) -> str:
    records = []
    for cp in encodings:
        glyph = font["glyphs"].get(cp)
        if glyph is None:
            records.append(f"{cp}:MISSING")
            continue
        records.append(f"{cp}:" + "/".join(glyph_cell(font, glyph)))
    return hashlib.sha256("\n".join(records).encode("ascii")).hexdigest()


def file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def compare_fonts(a: dict, b: dict) -> dict:
    encodings = sorted(set(a["glyphs"]) | set(b["glyphs"]))
    mismatches = []
    for cp in encodings:
        ga, gb = a["glyphs"].get(cp), b["glyphs"].get(cp)
        if ga is None or gb is None or glyph_cell(a, ga) != glyph_cell(b, gb):
            mismatches.append(cp)
    ascii_codes = list(range(32, 127))
    ascii_mismatches = [
        cp for cp in ascii_codes
        if cp not in a["glyphs"] or cp not in b["glyphs"] or
        glyph_cell(a, a["glyphs"][cp]) != glyph_cell(b, b["glyphs"][cp])
    ]
    return {
        "all_total": len(encodings),
        "all_matched": len(encodings) - len(mismatches),
        "all_mismatches": mismatches,
        "ascii_total": len(ascii_codes),
        "ascii_matched": len(ascii_codes) - len(ascii_mismatches),
        "ascii_mismatches": ascii_mismatches,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--historical", type=Path, help="ULTRIX-extracted terminal10.bdf")
    args = parser.parse_args()

    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    asset = parse_bdf(ASSET)
    expected = evidence["bundled_asset"]
    asset_sha = file_sha256(ASSET)
    assert asset_sha == expected["sha256"], (asset_sha, expected["sha256"])
    assert asset_sha == PUBLIC_TERM14_SHA256, asset_sha
    assert ASSET.stat().st_size == PUBLIC_TERM14_SIZE, ASSET.stat().st_size
    assert expected.get("byte_exact_public_artifact") is True
    assert len(asset["glyphs"]) == 195
    assert asset["ascent"] == 12 and asset["descent"] == 3
    assert all(asset["glyphs"][cp]["dwidth"][0] == 8 for cp in range(32, 127))

    all_codes = sorted(asset["glyphs"])
    all_digest = raster_digest(asset, all_codes)
    ascii_digest = raster_digest(asset, list(range(32, 127)))
    assert all_digest == expected["canonical_all_glyphs_sha256"], all_digest
    assert ascii_digest == expected["canonical_ascii_sha256"], ascii_digest

    print(f"PASS public term14 byte identity: {ASSET.stat().st_size} bytes; SHA-256 {asset_sha}")
    print(f"PASS glyphs: {len(all_codes)}; ASCII: 95")
    print(f"PASS 8x15 raster digest (195): {all_digest}")
    print(f"PASS 8x15 raster digest (ASCII): {ascii_digest}")

    if args.historical:
        historical = parse_bdf(args.historical)
        result = compare_fonts(historical, asset)
        print(json.dumps(result, indent=2))
        if result["all_mismatches"] or result["ascii_mismatches"]:
            raise SystemExit("FAIL: raster mismatch")
        print("PASS: historical ULTRIX target and bundled public-lineage asset are 195/195 raster-equivalent")


if __name__ == "__main__":
    main()
