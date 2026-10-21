#!/usr/bin/env python3
"""Minimal dependency-free X11 PCF reader and BDF exporter.

This is intentionally scoped to the tables needed for historical DECwindows
bitmap-font verification: properties, metrics, bitmaps, encodings, scalable
widths, and glyph names.  It accepts the PCF byte/bit/padding variants emitted
by bdftopcf and preserves the glyph bitmap at one logical pixel per source bit.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import argparse
import gzip
import json
import shutil
import struct
import subprocess
import tempfile

PCF_MAGIC = 0x70636601
PCF_PROPERTIES = 1 << 0
PCF_METRICS = 1 << 2
PCF_BITMAPS = 1 << 3
PCF_BDF_ENCODINGS = 1 << 5
PCF_SWIDTHS = 1 << 6
PCF_GLYPH_NAMES = 1 << 7
PCF_COMPRESSED_METRICS = 0x00000100
PCF_BYTE_MASK = 1 << 2
PCF_BIT_MASK = 1 << 3
PCF_SCAN_UNIT_MASK = 3 << 4
PCF_GLYPH_PAD_MASK = 3


def _decompress_unix_compress(data: bytes, source_name: str) -> bytes:
    """Decode classic UNIX compress data using stock gzip/uncompress when present."""
    with tempfile.TemporaryDirectory(prefix="pcf-uncompress-") as td:
        src = Path(td) / "font.Z"
        src.write_bytes(data)
        commands = []
        if shutil.which("gzip"):
            commands.append(["gzip", "-dc", str(src)])
        if shutil.which("uncompress"):
            commands.append(["uncompress", "-c", str(src)])
        for cmd in commands:
            cp = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
            if cp.returncode == 0 and cp.stdout:
                return cp.stdout
    raise PCFError(f"{source_name}: UNIX compress data requires gzip or uncompress")


class PCFError(ValueError):
    pass


@dataclass
class Metric:
    left: int
    right: int
    width: int
    ascent: int
    descent: int
    attributes: int = 0

    @property
    def bitmap_width(self) -> int:
        return max(0, self.right - self.left)

    @property
    def bitmap_height(self) -> int:
        return max(0, self.ascent + self.descent)


@dataclass
class Glyph:
    index: int
    encoding: int | None
    name: str
    metric: Metric
    rows: list[bytes]
    swidth: int | None = None


class PCFFont:
    def __init__(self, data: bytes, source_name: str = "font.pcf"):
        self.data = data
        self.source_name = source_name
        self.tables: dict[int, tuple[int, int, int]] = {}
        self.properties: dict[str, str | int] = {}
        self.metrics: list[Metric] = []
        self.encodings: dict[int, int] = {}
        self.swidths: list[int] = []
        self.glyph_names: list[str] = []
        self.bitmap_rows: list[list[bytes]] = []
        self._parse()

    @classmethod
    def from_path(cls, path: Path | str) -> "PCFFont":
        p = Path(path)
        raw = p.read_bytes()
        if raw.startswith(b"\x1f\x8b"):
            raw = gzip.decompress(raw)
        elif raw.startswith(b"\x1f\x9d"):
            raw = _decompress_unix_compress(raw, p.name)
        return cls(raw, p.name)

    @staticmethod
    def _table_endian(fmt: int) -> str:
        return ">" if fmt & PCF_BYTE_MASK else "<"

    @staticmethod
    def _u32(data: bytes, pos: int, endian: str) -> int:
        return struct.unpack_from(endian + "I", data, pos)[0]

    @staticmethod
    def _i32(data: bytes, pos: int, endian: str) -> int:
        return struct.unpack_from(endian + "i", data, pos)[0]

    @staticmethod
    def _u16(data: bytes, pos: int, endian: str) -> int:
        return struct.unpack_from(endian + "H", data, pos)[0]

    @staticmethod
    def _i16(data: bytes, pos: int, endian: str) -> int:
        return struct.unpack_from(endian + "h", data, pos)[0]

    @staticmethod
    def _cstring(pool: bytes, offset: int) -> str:
        if offset < 0 or offset >= len(pool):
            return ""
        end = pool.find(b"\0", offset)
        if end < 0:
            end = len(pool)
        return pool[offset:end].decode("latin-1", "replace")

    def _parse(self) -> None:
        if len(self.data) < 8:
            raise PCFError("PCF file is too short")
        magic, count = struct.unpack_from("<II", self.data, 0)
        if magic != PCF_MAGIC:
            raise PCFError(f"not a PCF file (magic=0x{magic:08x})")
        if count > 64 or 8 + count * 16 > len(self.data):
            raise PCFError("invalid PCF table directory")
        for i in range(count):
            typ, fmt, size, offset = struct.unpack_from("<IIII", self.data, 8 + i * 16)
            if offset >= len(self.data):
                raise PCFError(f"table 0x{typ:x} starts past EOF")
            # Some historical writers report a padded nominal size for the
            # final accelerator table.  Bound reads by the next table/EOF.
            self.tables[typ] = (fmt, size, offset)

        if PCF_PROPERTIES in self.tables:
            self.properties = self._parse_properties()
        if PCF_METRICS not in self.tables or PCF_BITMAPS not in self.tables:
            raise PCFError("PCF lacks required metrics/bitmap tables")
        self.metrics = self._parse_metrics(PCF_METRICS)
        if PCF_BDF_ENCODINGS in self.tables:
            self.encodings = self._parse_encodings()
        if PCF_SWIDTHS in self.tables:
            self.swidths = self._parse_swidths()
        if PCF_GLYPH_NAMES in self.tables:
            self.glyph_names = self._parse_glyph_names()
        self.bitmap_rows = self._parse_bitmaps()
        if len(self.bitmap_rows) != len(self.metrics):
            raise PCFError("bitmap/metrics glyph count mismatch")

    def _table(self, typ: int) -> tuple[int, bytes]:
        fmt, size, offset = self.tables[typ]
        actual_fmt = struct.unpack_from("<I", self.data, offset)[0]
        if actual_fmt != fmt:
            raise PCFError(f"table 0x{typ:x} format mismatch")
        later = [off for _fmt, _size, off in self.tables.values() if off > offset]
        physical_end = min(later) if later else len(self.data)
        end = min(offset + size, physical_end, len(self.data))
        return fmt, self.data[offset:end]

    def _parse_properties(self) -> dict[str, str | int]:
        fmt, t = self._table(PCF_PROPERTIES)
        endian = self._table_endian(fmt)
        pos = 4
        nprops = self._u32(t, pos, endian); pos += 4
        raw = []
        for _ in range(nprops):
            if pos + 9 > len(t):
                raise PCFError("truncated PCF properties")
            name_off = self._i32(t, pos, endian)
            is_string = t[pos + 4] != 0
            value = self._i32(t, pos + 5, endian)
            raw.append((name_off, is_string, value))
            pos += 9
        pos += (-nprops) & 3
        if pos + 4 > len(t):
            raise PCFError("missing PCF property string pool")
        string_size = self._u32(t, pos, endian); pos += 4
        pool = t[pos:pos + string_size]
        result: dict[str, str | int] = {}
        for name_off, is_string, value in raw:
            name = self._cstring(pool, name_off)
            result[name] = self._cstring(pool, value) if is_string else value
        return result

    def _parse_metrics(self, typ: int) -> list[Metric]:
        fmt, t = self._table(typ)
        endian = self._table_endian(fmt)
        pos = 4
        out: list[Metric] = []
        if (fmt & 0xFFFFFF00) == PCF_COMPRESSED_METRICS:
            count = self._u16(t, pos, endian); pos += 2
            if pos + count * 5 > len(t):
                raise PCFError("truncated compressed PCF metrics")
            for _ in range(count):
                a = [t[pos + i] - 0x80 for i in range(5)]
                pos += 5
                out.append(Metric(*a, 0))
        else:
            count = self._u32(t, pos, endian); pos += 4
            if pos + count * 12 > len(t):
                raise PCFError("truncated PCF metrics")
            for _ in range(count):
                left, right, width, ascent, descent = struct.unpack_from(endian + "hhhhh", t, pos)
                attrs = self._u16(t, pos + 10, endian)
                pos += 12
                out.append(Metric(left, right, width, ascent, descent, attrs))
        return out

    def _parse_encodings(self) -> dict[int, int]:
        fmt, t = self._table(PCF_BDF_ENCODINGS)
        endian = self._table_endian(fmt)
        pos = 4
        if pos + 10 > len(t):
            raise PCFError("truncated PCF encoding table")
        min2, max2, min1, max1, _default = struct.unpack_from(endian + "HHHHH", t, pos)
        pos += 10
        cols = max2 - min2 + 1
        rows = max1 - min1 + 1
        if cols <= 0 or rows <= 0 or cols * rows > 1_000_000:
            raise PCFError("invalid PCF encoding ranges")
        result: dict[int, int] = {}
        for b1 in range(min1, max1 + 1):
            for b2 in range(min2, max2 + 1):
                if pos + 2 > len(t):
                    raise PCFError("truncated PCF encoding indexes")
                glyph_index = self._u16(t, pos, endian); pos += 2
                if glyph_index != 0xFFFF:
                    code = b2 if min1 == 0 and max1 == 0 else (b1 << 8) | b2
                    result[code] = glyph_index
        return result

    def _parse_swidths(self) -> list[int]:
        fmt, t = self._table(PCF_SWIDTHS)
        endian = self._table_endian(fmt)
        count = self._u32(t, 4, endian)
        pos = 8
        if pos + count * 4 > len(t):
            raise PCFError("truncated PCF scalable widths")
        return [self._i32(t, pos + i * 4, endian) for i in range(count)]

    def _parse_glyph_names(self) -> list[str]:
        fmt, t = self._table(PCF_GLYPH_NAMES)
        endian = self._table_endian(fmt)
        count = self._u32(t, 4, endian)
        pos = 8
        if pos + count * 4 + 4 > len(t):
            raise PCFError("truncated PCF glyph-name table")
        offsets = [self._u32(t, pos + i * 4, endian) for i in range(count)]
        pos += count * 4
        string_size = self._u32(t, pos, endian); pos += 4
        pool = t[pos:pos + string_size]
        return [self._cstring(pool, off) for off in offsets]

    @staticmethod
    def _reverse_bits8(v: int) -> int:
        v = ((v & 0x55) << 1) | ((v >> 1) & 0x55)
        v = ((v & 0x33) << 2) | ((v >> 2) & 0x33)
        return ((v & 0x0F) << 4) | ((v >> 4) & 0x0F)

    @classmethod
    def _normalize_bitmap(cls, raw: bytes, fmt: int) -> bytes:
        # Normalize to MSB-first bits and MSB-first bytes, matching BDF rows.
        bit_msb = bool(fmt & PCF_BIT_MASK)
        byte_msb = bool(fmt & PCF_BYTE_MASK)
        scan_unit = 1 << ((fmt & PCF_SCAN_UNIT_MASK) >> 4)
        data = bytearray(raw)
        if not bit_msb:
            for i, value in enumerate(data):
                data[i] = cls._reverse_bits8(value)
        if bit_msb != byte_msb and scan_unit > 1:
            for i in range(0, len(data), scan_unit):
                data[i:i + scan_unit] = reversed(data[i:i + scan_unit])
        return bytes(data)

    def _parse_bitmaps(self) -> list[list[bytes]]:
        fmt, t = self._table(PCF_BITMAPS)
        endian = self._table_endian(fmt)
        count = self._u32(t, 4, endian)
        pos = 8
        if count != len(self.metrics):
            raise PCFError(f"PCF bitmap count {count} != metrics count {len(self.metrics)}")
        if pos + count * 4 + 16 > len(t):
            raise PCFError("truncated PCF bitmap table")
        offsets = [self._u32(t, pos + i * 4, endian) for i in range(count)]
        pos += count * 4
        sizes = [self._u32(t, pos + i * 4, endian) for i in range(4)]
        pos += 16
        bitmap_data = t[pos:pos + sizes[fmt & PCF_GLYPH_PAD_MASK]]
        pad = 1 << (fmt & PCF_GLYPH_PAD_MASK)
        result: list[list[bytes]] = []
        for i, metric in enumerate(self.metrics):
            width = metric.bitmap_width
            height = metric.bitmap_height
            useful = (width + 7) // 8
            stride = ((useful + pad - 1) // pad) * pad if useful else 0
            start = offsets[i]
            end = start + stride * height
            if end > len(bitmap_data):
                raise PCFError(f"glyph {i} bitmap extends past bitmap table")
            # Byte swapping is scoped to each glyph image.  Applying scan-unit
            # swaps to the whole bitmap table can move bytes across glyph
            # boundaries when glyph padding is smaller than the scan unit.
            glyph_data = self._normalize_bitmap(bitmap_data[start:end], fmt)
            rows = []
            for row in range(height):
                row_data = glyph_data[row * stride:row * stride + useful]
                rows.append(row_data)
            result.append(rows)
        return result

    @property
    def font_name(self) -> str:
        value = self.properties.get("FONT")
        if isinstance(value, str) and value:
            return value
        return "-unknown-unknown-medium-r-normal--0-0-0-0-c-0-iso8859-1"

    def glyphs(self) -> list[Glyph]:
        by_index: dict[int, int] = {}
        for encoding, idx in sorted(self.encodings.items()):
            by_index.setdefault(idx, encoding)
        out = []
        for idx, metric in enumerate(self.metrics):
            name = self.glyph_names[idx] if idx < len(self.glyph_names) and self.glyph_names[idx] else f"glyph{idx}"
            out.append(Glyph(
                index=idx,
                encoding=by_index.get(idx),
                name=name,
                metric=metric,
                rows=self.bitmap_rows[idx],
                swidth=self.swidths[idx] if idx < len(self.swidths) else None,
            ))
        return out

    @staticmethod
    def _quote(value: str) -> str:
        return '"' + value.replace('\\', '\\\\').replace('"', '\\"') + '"'

    def to_bdf(self) -> str:
        glyphs = [g for g in self.glyphs() if g.encoding is not None]
        ascent = int(self.properties.get("FONT_ASCENT", max((m.ascent for m in self.metrics), default=0)))
        descent = int(self.properties.get("FONT_DESCENT", max((m.descent for m in self.metrics), default=0)))
        min_left = min((m.left for m in self.metrics), default=0)
        max_right = max((m.right for m in self.metrics), default=0)
        bbox_w = max(0, max_right - min_left)
        bbox_h = max(0, ascent + descent)
        bbox_y = -descent

        xlfd = self.font_name
        xparts = xlfd.split("-") if xlfd.startswith("-") else []
        def xint(index: int, default: int) -> int:
            try:
                return int(xparts[index])
            except (ValueError, IndexError):
                return default
        point = int(self.properties.get("POINT_SIZE", xint(8, 100)))
        res_x = int(self.properties.get("RESOLUTION_X", xint(9, 75)))
        res_y = int(self.properties.get("RESOLUTION_Y", xint(10, res_x)))

        props: list[tuple[str, str | int]] = [
            ("FONT_ASCENT", ascent),
            ("FONT_DESCENT", descent),
        ]
        for key in ("FAMILY_NAME", "WEIGHT_NAME", "SLANT", "SETWIDTH_NAME", "ADD_STYLE_NAME", "FOUNDRY", "COPYRIGHT"):
            value = self.properties.get(key)
            if isinstance(value, str) and value:
                props.append((key, value))
        if "DEFAULT_CHAR" in self.properties:
            props.append(("DEFAULT_CHAR", int(self.properties["DEFAULT_CHAR"])))

        lines = [
            "STARTFONT 2.1",
            f"COMMENT Losslessly reconstructed from PCF source {self.source_name}",
            f"FONT {xlfd}",
            f"SIZE {max(1, round(point / 10))} {res_x} {res_y}",
            f"FONTBOUNDINGBOX {bbox_w} {bbox_h} {min_left} {bbox_y}",
            f"STARTPROPERTIES {len(props)}",
        ]
        for key, value in props:
            lines.append(f"{key} {self._quote(value) if isinstance(value, str) else value}")
        lines += ["ENDPROPERTIES", f"CHARS {len(glyphs)}"]

        for g in glyphs:
            m = g.metric
            bbx_w = m.bitmap_width
            bbx_h = m.bitmap_height
            lines.append(f"STARTCHAR {g.name}")
            lines.append(f"ENCODING {g.encoding}")
            if g.swidth is not None:
                lines.append(f"SWIDTH {g.swidth} 0")
            else:
                lines.append(f"SWIDTH {max(0, m.width) * 1000} 0")
            lines.append(f"DWIDTH {m.width} 0")
            lines.append(f"BBX {bbx_w} {bbx_h} {m.left} {-m.descent}")
            lines.append("BITMAP")
            for row in g.rows:
                lines.append(row.hex().upper() if row else "00")
            lines.append("ENDCHAR")
        lines.append("ENDFONT")
        return "\n".join(lines) + "\n"

    def summary(self) -> dict:
        encoded = self.encodings
        ascii_complete = all(cp in encoded for cp in range(32, 127))
        widths = [m.width for m in self.metrics]
        heights = [m.bitmap_height for m in self.metrics]
        return {
            "source": self.source_name,
            "font": self.font_name,
            "properties": self.properties,
            "glyph_count": len(self.metrics),
            "encoded_count": len(encoded),
            "ascii_complete": ascii_complete,
            "cell_width_max": max(widths, default=0),
            "bitmap_height_max": max(heights, default=0),
        }


def main() -> None:
    ap = argparse.ArgumentParser(description="Inspect or convert an X11 PCF bitmap font without pcf2bdf")
    ap.add_argument("pcf")
    ap.add_argument("-o", "--output", help="write reconstructed BDF here")
    ap.add_argument("--json", action="store_true", help="print PCF summary as JSON")
    ns = ap.parse_args()
    font = PCFFont.from_path(ns.pcf)
    if ns.output:
        Path(ns.output).write_text(font.to_bdf(), encoding="ascii", errors="backslashreplace")
        print(ns.output)
    if ns.json or not ns.output:
        print(json.dumps(font.summary(), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
