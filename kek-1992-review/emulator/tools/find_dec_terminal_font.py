#!/usr/bin/env python3
"""Inventory DECwindows Terminal PCF/BDF candidates in an extracted media tree.

Unlike the earlier helper, this version does not require pcf2bdf.  PCF and
classic .pcf.Z files are parsed locally by pcf_reader.py and reconstructed to a
temporary BDF only for the common Phase-6 verifier.
"""
from __future__ import annotations

from pathlib import Path
import argparse
import hashlib
import json
import sys
import tempfile

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from pcf_reader import PCFFont  # noqa: E402
from inspect_bdf import inspect_bdf  # noqa: E402


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def inspect_any(path: Path) -> dict:
    low = path.name.lower()
    if low.endswith(".bdf"):
        return inspect_bdf(path)
    font = PCFFont.from_path(path)
    with tempfile.TemporaryDirectory(prefix="kek-pcf-") as td:
        bdf = Path(td) / "font.bdf"
        bdf.write_text(font.to_bdf(), encoding="ascii", errors="backslashreplace")
        return inspect_bdf(bdf)


def candidate_score(report: dict, path: Path) -> int:
    x = report.get("xlfd") or {}
    score = 0
    best = report.get("best_match") or {}
    if best.get("id") == "kek_vrt19_100dpi_little" and best.get("status") == "EXACT METADATA MATCH": score += 1000
    if str(x.get("family", "")).lower() == "terminal": score += 30
    if x.get("resolutionX") == 100 and x.get("resolutionY") == 100: score += 24
    if x.get("pixelSize") == 14: score += 18
    if x.get("pointSize") == 100: score += 16
    if [report.get("cell_width_estimate"), report.get("cell_height_estimate")] == [8, 15]: score += 20
    if report.get("ascii_complete") is True: score += 12
    if str(x.get("foundry", "")).lower() == "dec": score += 3
    if "10" in path.name.lower(): score += 2
    return score


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("root", help="mounted/extracted ULTRIX or DECwindows tree")
    ap.add_argument("-o", "--output", default="dec-terminal-font-inventory.json")
    ns = ap.parse_args()
    base = Path(ns.root).expanduser().resolve()
    files = []

    for p in base.rglob("*"):
        if not p.is_file() or "terminal" not in p.name.lower():
            continue
        low = p.name.lower()
        if not (low.endswith(".pcf") or low.endswith(".pcf.z") or low.endswith(".pcf.gz") or low.endswith(".bdf")):
            continue
        rec = {"path": str(p), "name": p.name, "bytes": p.stat().st_size, "sha256": sha256(p)}
        try:
            rep = inspect_any(p)
            rec.update({
                "font": rep.get("font"),
                "xlfd": rep.get("xlfd"),
                "cell": [rep.get("cell_width_estimate"), rep.get("cell_height_estimate")],
                "ascii_complete": rep.get("ascii_complete"),
                "provisional_target_match": rep.get("best_match"),
                "evidence_score": candidate_score(rep, p),
            })
        except Exception as exc:
            rec["inspection_error"] = str(exc)
            rec["evidence_score"] = -1
        files.append(rec)

    files.sort(key=lambda r: r.get("evidence_score", -1), reverse=True)
    result = {
        "root": str(base),
        "target_media_hints": {
            "ULTRIX_4.3_100dpi_subset": "UDWFONT15430",
            "ULTRIX_4.3_install_dir": "/usr/lib/X11/fonts/decwin/100dpi",
            "ULTRIX_4.5_100dpi_subset": "UDWFONT15450",
            "OpenVMS_DECwindows_filename_reference": "TERMINAL10_100DPI.PCF",
        },
        "note": "ULTRIX 4.3 media inspection confirmed terminal10.pcf as the exact DEC Terminal Normal 100dpi 10pt XLFD target; ranking now prioritizes exact metadata match.",
        "candidates": files,
        "best_candidate": files[0] if files else None,
    }
    Path(ns.output).write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    print(ns.output)
    if files:
        print("best:", files[0].get("path"))
        print("FONT:", files[0].get("font"))
        print("score:", files[0].get("evidence_score"))
    else:
        print("no Terminal PCF/BDF candidates found")


if __name__ == "__main__":
    main()
