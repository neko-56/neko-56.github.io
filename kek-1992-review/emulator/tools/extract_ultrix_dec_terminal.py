#!/usr/bin/env python3
"""Extract and verify DECwindows Terminal PCF fonts from ULTRIX 4.3 media.

Primary target:
  ULTRIX 4.3 RISC subset UDWFONT15430
  /usr/lib/X11/fonts/decwin/100dpi

The input may be a classic UFS CD image, ISO9660 image, or an already-extracted
media directory. Historical font binaries are never bundled with this project;
all output is derived from media supplied by the user.
"""
from __future__ import annotations

from pathlib import Path
import argparse
import json
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from inspect_bdf import inspect_bdf  # noqa: E402
from pcf_reader import PCFFont, PCFError  # noqa: E402
from ultrix_media import (  # noqa: E402
    SUBSET,
    decompress_unix_compress,
    extract_media_fonts,
    sha256_bytes,
    sha256_file,
)

PCF_MAGIC = b"\x01fcp"


def decode_pcf_file(path: Path) -> bytes:
    raw = path.read_bytes()
    data = decompress_unix_compress(raw, path.name)
    if not data.startswith(PCF_MAGIC):
        raise PCFError(f"{path.name}: decoded data is not PCF")
    return data


def target_score(report: dict, filename: str) -> tuple[int, list[str]]:
    """Rank candidates without turning the provisional DEC XLFD into a fact."""
    x = report.get("xlfd") or {}
    reasons: list[str] = []
    score = 0

    def add(ok: bool, points: int, reason: str) -> None:
        nonlocal score
        if ok:
            score += points
            reasons.append(reason)

    best = report.get("best_match") or {}
    exact_target = (
        best.get("id") == "kek_vrt19_100dpi_little"
        and best.get("status") == "EXACT METADATA MATCH"
    )
    add(exact_target, 1000, "exact ULTRIX 4.3 DEC Terminal 100dpi 10pt XLFD")
    add(str(x.get("family", "")).lower() == "terminal", 30, "family=Terminal")
    add(x.get("resolutionX") == 100 and x.get("resolutionY") == 100, 24, "100dpi")
    add(x.get("pixelSize") == 14, 18, "14px")
    add(x.get("pointSize") == 100, 16, "10pt")
    add(report.get("cell_width_estimate") == 8 and report.get("cell_height_estimate") == 15, 20, "8x15 bitmap metrics")
    add(report.get("ascii_complete") is True, 12, "ASCII complete")
    add(str(x.get("spacing", "")).lower() == "c", 5, "character-cell spacing")
    add(str(x.get("foundry", "")).lower() == "dec", 3, "foundry=DEC (provisional target bonus)")
    add("10" in filename.lower(), 2, "filename suggests 10pt")
    return score, reasons


def inspect_candidates(files: list[Path], out_dir: Path) -> list[dict]:
    reports: list[dict] = []
    bdf_dir = out_dir / "bdf"
    bdf_dir.mkdir(parents=True, exist_ok=True)

    for path in files:
        low = path.name.lower()
        if "terminal" not in low:
            continue
        if not (low.endswith(".pcf") or low.endswith(".pcf.z") or path.read_bytes()[:2] == b"\x1f\x9d"):
            continue

        rec: dict = {
            "source_file": path.name,
            "source_bytes": path.stat().st_size,
            "source_sha256": sha256_file(path),
        }
        try:
            pcf_data = decode_pcf_file(path)
            font = PCFFont(pcf_data, path.name)
            stem = path.name[:-2] if path.name.lower().endswith(".z") else path.name
            stem = stem[:-4] if stem.lower().endswith(".pcf") else stem
            bdf_path = bdf_dir / f"{stem}.bdf"
            bdf_path.write_text(font.to_bdf(), encoding="ascii", errors="backslashreplace")
            report = inspect_bdf(bdf_path)
            score, reasons = target_score(report, path.name)
            rec.update({
                "pcf_sha256": sha256_bytes(pcf_data),
                "pcf_decoded_bytes": len(pcf_data),
                "bdf_file": str(bdf_path.relative_to(out_dir)),
                "bdf_sha256": report.get("sha256"),
                "font": report.get("font"),
                "xlfd": report.get("xlfd"),
                "cell": [report.get("cell_width_estimate"), report.get("cell_height_estimate")],
                "ascii_complete": report.get("ascii_complete"),
                "provisional_target_match": report.get("best_match"),
                "evidence_score": score,
                "score_reasons": reasons,
            })
        except Exception as exc:
            rec["error"] = str(exc)
        reports.append(rec)

    reports.sort(key=lambda r: r.get("evidence_score", -1), reverse=True)
    return reports


def main() -> None:
    ap = argparse.ArgumentParser(
        description="Extract UDWFONT15430 Terminal PCFs from ULTRIX 4.3 RISC media"
    )
    ap.add_argument("media", help="Ultrix_RISC_4.3_OS.iso or extracted distribution directory")
    ap.add_argument("-o", "--output", default="phase6-ultrix-fonts")
    ap.add_argument("--skip-media-hash", action="store_true")
    ns = ap.parse_args()

    source = Path(ns.media).expanduser().resolve()
    out_dir = Path(ns.output).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    original_dir = out_dir / "original"
    original_dir.mkdir(exist_ok=True)

    manifest: dict = {
        "phase": 6,
        "media": str(source),
        "expected_subset": SUBSET,
        "expected_install_dir": "/usr/lib/X11/fonts/decwin/100dpi",
        "media_sha256": None,
        "subset": None,
        "subset_source_sha256": None,
        "subset_tar_sha256": None,
        "candidates": [],
        "best_candidate": None,
    }
    if source.is_file() and not ns.skip_media_hash:
        print("[1/5] Hashing media...")
        manifest["media_sha256"] = sha256_file(source)
        print(f"[1/5] Media SHA-256: {manifest['media_sha256']}")

    extracted_files = extract_media_fonts(source, original_dir, manifest)
    if not extracted_files:
        raise RuntimeError("No Terminal/font-index files found in the 100dpi DECwindows directory")

    print(f"[4/5] Inspecting {len(extracted_files)} extracted files...")
    reports = inspect_candidates(extracted_files, out_dir)
    successful = [r for r in reports if "error" not in r]
    manifest["candidates"] = reports
    manifest["best_candidate"] = successful[0] if successful else None

    report_path = out_dir / "phase6-font-report.json"
    report_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print("[5/5] Done")
    print(f"Report: {report_path}")

    if successful:
        best = successful[0]
        print(f"Best: {best.get('source_file')}")
        print(f"FONT: {best.get('font')}")
        print(f"Cell: {best.get('cell')}")
        print(f"Score: {best.get('evidence_score')} — {', '.join(best.get('score_reasons', []))}")
        print(f"BDF: {out_dir / best.get('bdf_file', '')}")
    elif reports:
        print(f"No readable Terminal PCF candidates were found ({len(reports)} candidate files had decode errors).")
    else:
        print("No Terminal PCF candidates were found.")


if __name__ == "__main__":
    main()
