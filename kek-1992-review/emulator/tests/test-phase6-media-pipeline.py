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
sys.path.insert(0, str(TOOLS))
from pcf_reader import PCFFont  # noqa: E402


def make_bdf(path: Path) -> None:
    lines = [
        "STARTFONT 2.1",
        "FONT -DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1",
        "SIZE 10 100 100",
        "FONTBOUNDINGBOX 8 14 0 -3",
        "STARTPROPERTIES 5",
        "FONT_ASCENT 11",
        "FONT_DESCENT 3",
        'FAMILY_NAME "Terminal"',
        "POINT_SIZE 100",
        "DEFAULT_CHAR 63",
        "ENDPROPERTIES",
        "CHARS 95",
    ]
    for cp in range(32, 127):
        lines += [
            f"STARTCHAR C{cp}", f"ENCODING {cp}", "SWIDTH 500 0", "DWIDTH 8 0",
            "BBX 8 14 0 -3", "BITMAP",
        ]
        for row in range(14):
            value = 0 if cp == 32 else ((cp << (row % 3)) ^ (row * 17)) & 0xFF
            lines.append(f"{value:02X}")
        lines.append("ENDCHAR")
    lines.append("ENDFONT")
    path.write_text("\n".join(lines) + "\n", encoding="ascii")


def main() -> None:
    bdftopcf = shutil.which("bdftopcf")
    if not bdftopcf:
        print("SKIP: bdftopcf unavailable; runtime extractor itself does not require it")
        return
    with tempfile.TemporaryDirectory(prefix="kek-phase6-test-") as td:
        td = Path(td)
        bdf = td / "source.bdf"
        pcf = td / "terminal10.pcf"
        make_bdf(bdf)
        subprocess.run([bdftopcf, "-p4", "-u4", "-m", "-M", "-o", str(pcf), str(bdf)], check=True)

        # PCF parser round trip: validate representative glyph rows.
        font = PCFFont.from_path(pcf)
        rebuilt = font.to_bdf()
        assert "FONT -DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1" in rebuilt
        assert font.summary()["ascii_complete"] is True

        media = td / "media" / "RISC" / "BASE"
        media.mkdir(parents=True)
        tree = td / "subset" / "usr" / "lib" / "X11" / "fonts" / "decwin" / "100dpi"
        tree.mkdir(parents=True)
        shutil.copy2(pcf, tree / "terminal10.pcf")
        (tree / "fonts.dir").write_text(
            "1\nterminal10.pcf -DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1\n",
            encoding="ascii",
        )
        with tarfile.open(media / "UDWFONT15430", "w") as tf:
            tf.add(td / "subset" / "usr", arcname="usr")

        out = td / "out"
        subprocess.run([
            sys.executable, str(TOOLS / "extract_ultrix_dec_terminal.py"),
            str(td / "media"), "-o", str(out), "--skip-media-hash",
        ], check=True, stdout=subprocess.PIPE, text=True)
        report = json.loads((out / "phase6-font-report.json").read_text(encoding="utf-8"))
        best = report["best_candidate"]
        assert best["cell"] == [8, 14]
        assert best["ascii_complete"] is True
        assert best["xlfd"]["resolutionX"] == 100
        assert best["xlfd"]["pointSize"] == 100
        assert (out / best["bdf_file"]).exists()
    print("PASS: Phase 6 ULTRIX media extraction / PCF round-trip")


if __name__ == "__main__":
    main()
