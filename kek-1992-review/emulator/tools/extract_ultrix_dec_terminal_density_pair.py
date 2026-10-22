#!/usr/bin/env python3
"""Extract ULTRIX 4.3 DEC Terminal 75dpi and 100dpi font paths together.

This Phase 6.2 helper resolves a historical ambiguity without redistributing
ULTRIX font binaries.  It reads user-supplied media, extracts:

  UDWFONT430   -> /usr/lib/X11/fonts/decwin/75dpi
  UDWFONT15430 -> /usr/lib/X11/fonts/decwin/100dpi

It then converts Terminal PCFs to BDF, identifies the exact DEC Terminal
75dpi/14pt and 100dpi/10pt targets when present, and compares their normalized
8x15 glyph rasters with the separately licensed public term14 asset bundled by
this reconstruction.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))

from extract_ultrix_dec_terminal import inspect_candidates  # noqa: E402
from ultrix_media import DENSITY_SPECS, extract_media_fonts, sha256_file  # noqa: E402
from verify_dec_terminal_equivalence import (  # noqa: E402
    ASSET,
    compare_fonts,
    file_sha256,
    parse_bdf,
)

TARGET_ID = {75: "kek_75dpi_normal", 100: "kek_vrt19_100dpi_little"}


def exact_candidate(reports: list[dict], target_id: str) -> dict | None:
    for rec in reports:
        match = rec.get("provisional_target_match") or {}
        if match.get("id") == target_id and match.get("status") == "EXACT METADATA MATCH":
            return rec
    return None


def extract_density(source: Path, out_dir: Path, density: int) -> dict:
    spec = DENSITY_SPECS[density]
    density_dir = out_dir / f"{density}dpi"
    original_dir = density_dir / "original"
    original_dir.mkdir(parents=True, exist_ok=True)
    manifest: dict = {
        "density": density,
        "expected_subset": spec["subset"],
        "expected_install_dir": "/" + spec["target_dir_fragment"],
        "subset": None,
        "subset_source_sha256": None,
        "subset_tar_sha256": None,
    }
    files = extract_media_fonts(
        source,
        original_dir,
        manifest,
        subset_name=spec["subset"],
        target_dir_fragment=spec["target_dir_fragment"],
        density_label=f"{density}dpi",
    )
    reports = inspect_candidates(files, density_dir)
    manifest["candidates"] = reports
    manifest["exact_target"] = exact_candidate(reports, TARGET_ID[density])
    return manifest


def bdf_path(out_dir: Path, rec: dict | None, density: int) -> Path | None:
    if not rec or not rec.get("bdf_file"):
        return None
    return out_dir / f"{density}dpi" / rec["bdf_file"]


def comparison(a_path: Path | None, b_path: Path | None) -> dict | None:
    if not a_path or not b_path or not a_path.exists() or not b_path.exists():
        return None
    result = compare_fonts(parse_bdf(a_path), parse_bdf(b_path))
    return {
        **result,
        "left": str(a_path),
        "right": str(b_path),
        "raster_identical": not result["all_mismatches"] and not result["ascii_mismatches"],
    }


def main() -> None:
    ap = argparse.ArgumentParser(
        description="Extract and compare ULTRIX 4.3 DEC Terminal 75dpi + 100dpi paths"
    )
    ap.add_argument("media", help="Ultrix_RISC_4.3_OS.iso or extracted distribution directory")
    ap.add_argument("-o", "--output", default="phase6-2-ultrix-font-selection")
    ap.add_argument("--skip-media-hash", action="store_true")
    ns = ap.parse_args()

    source = Path(ns.media).expanduser().resolve()
    out_dir = Path(ns.output).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    report: dict = {
        "phase": "6.2",
        "purpose": "Resolve Xws 75dpi default vs explicit 100dpi DECterm font path",
        "media": str(source),
        "media_sha256": None,
        "public_term14": {
            "path": str(ASSET),
            "sha256": file_sha256(ASSET),
        },
        "densities": {},
        "comparisons": {},
    }
    if source.is_file() and not ns.skip_media_hash:
        print("[1/4] Hashing media...")
        report["media_sha256"] = sha256_file(source)

    for density in (75, 100):
        print(f"[2/4] Extracting {density}dpi path...")
        try:
            report["densities"][str(density)] = extract_density(source, out_dir, density)
        except Exception as exc:
            report["densities"][str(density)] = {
                "density": density,
                "expected_subset": DENSITY_SPECS[density]["subset"],
                "error": str(exc),
                "exact_target": None,
                "candidates": [],
            }
            print(f"OPEN {density}dpi extraction: {exc}")

    p75 = bdf_path(out_dir, report["densities"]["75"].get("exact_target"), 75)
    p100 = bdf_path(out_dir, report["densities"]["100"].get("exact_target"), 100)
    print("[3/4] Comparing normalized 8x15 glyph rasters...")
    report["comparisons"] = {
        "ultrix_75_vs_ultrix_100": comparison(p75, p100),
        "ultrix_75_vs_public_term14": comparison(p75, ASSET),
        "ultrix_100_vs_public_term14": comparison(p100, ASSET),
    }

    out = out_dir / "phase6-2-font-selection-report.json"
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[4/4] Report: {out}")

    for density in (75, 100):
        exact = report["densities"][str(density)].get("exact_target")
        if exact:
            print(f"PASS {density}dpi exact target: {exact.get('font')}")
        else:
            print(f"OPEN {density}dpi exact target not found")
    for name, result in report["comparisons"].items():
        if result is not None:
            state = "PASS" if result["raster_identical"] else "MISMATCH"
            print(f"{state} {name}: {result['all_matched']}/{result['all_total']}, ASCII {result['ascii_matched']}/{result['ascii_total']}")


if __name__ == "__main__":
    main()
