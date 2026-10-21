#!/usr/bin/env python3
from pathlib import Path
import json
import shutil
import subprocess
import sys
import tarfile
import tempfile

BASE = Path(__file__).resolve().parents[1]
TOOLS = BASE / "tools"
ASSET = BASE / "assets/fonts/dec-terminal/dec-terminal-xconsortium-verified.bdf"


def make_100dpi_bdf(src: Path, dst: Path) -> None:
    text = src.read_text(encoding="ascii")
    text = text.replace(
        "-DEC-Terminal-Medium-R-Normal--14-140-75-75-C-80-ISO8859-1",
        "-DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1",
        1,
    )
    text = text.replace("SIZE 14 75 75", "SIZE 10 100 100", 1)
    text = text.replace("POINT_SIZE 140", "POINT_SIZE 100", 1)
    text = text.replace("RESOLUTION_X 75", "RESOLUTION_X 100", 1)
    text = text.replace("RESOLUTION_Y 75", "RESOLUTION_Y 100", 1)
    dst.write_text(text, encoding="ascii")


def add_subset(media: Path, td: Path, subset: str, density: int, bdf: Path, pcf_name: str) -> None:
    bdftopcf = shutil.which("bdftopcf")
    assert bdftopcf
    subset_root = td / f"subset-{density}" / "usr" / "lib" / "X11" / "fonts" / "decwin" / f"{density}dpi"
    subset_root.mkdir(parents=True)
    pcf = subset_root / pcf_name
    subprocess.run([bdftopcf, "-o", str(pcf), str(bdf)], check=True)
    (subset_root / "fonts.dir").write_text(f"1\n{pcf_name} test\n", encoding="ascii")
    with tarfile.open(media / subset, "w") as tf:
        tf.add(td / f"subset-{density}" / "usr", arcname="usr")


def main() -> None:
    if not shutil.which("bdftopcf"):
        print("SKIP: bdftopcf unavailable")
        return
    with tempfile.TemporaryDirectory(prefix="kek-phase6-2-pair-") as tmp:
        td = Path(tmp)
        media = td / "media" / "RISC" / "BASE"
        media.mkdir(parents=True)
        b75 = td / "term14.bdf"
        b100 = td / "terminal10.bdf"
        shutil.copy2(ASSET, b75)
        make_100dpi_bdf(ASSET, b100)
        add_subset(media, td, "UDWFONT430", 75, b75, "terminal14.pcf")
        add_subset(media, td, "UDWFONT15430", 100, b100, "terminal10.pcf")

        out = td / "out"
        subprocess.run([
            sys.executable,
            str(TOOLS / "extract_ultrix_dec_terminal_density_pair.py"),
            str(td / "media"),
            "-o", str(out),
            "--skip-media-hash",
        ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        report = json.loads((out / "phase6-2-font-selection-report.json").read_text(encoding="utf-8"))
        assert report["densities"]["75"]["exact_target"]["provisional_target_match"]["id"] == "kek_75dpi_normal"
        assert report["densities"]["100"]["exact_target"]["provisional_target_match"]["id"] == "kek_vrt19_100dpi_little"
        for result in report["comparisons"].values():
            assert result is not None
            assert result["raster_identical"] is True
            assert result["all_matched"] == 195
            assert result["ascii_matched"] == 95
    print("PASS: Phase 6.2 dual-density extractor and three-way 195-glyph comparison")


if __name__ == "__main__":
    main()
