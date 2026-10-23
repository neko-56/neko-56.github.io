#!/usr/bin/env python3
"""Small, read-only ISO-9660 reader used by the ULTRIX font extractor.

The goal is deliberately narrow: enumerate files/directories and read file bytes
without asking the host OS to mount the image.  This is useful for historical CD
images that modern macOS may refuse to attach.

Supported sector layouts:
- ordinary 2048-byte ISO images
- raw 2352-byte Mode-1 images (2048-byte user data at offset 16)
- raw 2352-byte Mode-2/Form-1 style images (2048-byte user data at offset 24)

No image is modified.  Rock Ridge metadata is ignored because the ULTRIX setld
subset names needed by Phase 6 are available from ordinary ISO directory records.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path, PurePosixPath
import io
import mmap


class ISO9660Error(RuntimeError):
    pass


@dataclass(frozen=True)
class SectorLayout:
    physical_size: int
    user_offset: int
    logical_size: int = 2048

    @property
    def label(self) -> str:
        if self.physical_size == 2048:
            return "ISO9660/2048"
        return f"raw-{self.physical_size}/user+{self.user_offset}"


@dataclass(frozen=True)
class ISOEntry:
    path: str
    extent: int
    size: int
    is_dir: bool
    flags: int

    @property
    def name(self) -> str:
        return PurePosixPath(self.path).name


class ISO9660Reader:
    def __init__(self, path: Path):
        self.path = Path(path)
        self._fh = self.path.open("rb")
        self._mm = mmap.mmap(self._fh.fileno(), 0, access=mmap.ACCESS_READ)
        self.layout = self._detect_layout()
        self._pvd = self._read_pvd()
        self.root = self._parse_root_entry()
        self.volume_id = self._decode_text(self._pvd[40:72])
        self.system_id = self._decode_text(self._pvd[8:40])

    def close(self) -> None:
        try:
            self._mm.close()
        finally:
            self._fh.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        self.close()

    @staticmethod
    def _decode_text(data: bytes) -> str:
        return data.decode("ascii", errors="replace").rstrip(" \x00")

    def _sector_slice(self, lba: int) -> bytes:
        layout = self.layout
        start = lba * layout.physical_size + layout.user_offset
        end = start + layout.logical_size
        if start < 0 or end > len(self._mm):
            raise ISO9660Error(f"sector {lba} lies outside image")
        return self._mm[start:end]

    def _detect_layout(self) -> SectorLayout:
        candidates = [
            SectorLayout(2048, 0),
            SectorLayout(2352, 16),
            SectorLayout(2352, 24),
        ]
        for layout in candidates:
            start = 16 * layout.physical_size + layout.user_offset
            end = start + 7
            if end <= len(self._mm) and self._mm[start + 1:start + 6] == b"CD001":
                version = self._mm[start + 6]
                if version == 1:
                    return layout

        # Diagnostic scan: locate a CD001 signature near the normal descriptor area.
        # This makes failure reports useful for unusual dumps without guessing layout.
        scan_end = min(len(self._mm), 256 * 1024)
        hits = []
        pos = 0
        while True:
            pos = self._mm.find(b"CD001", pos, scan_end)
            if pos < 0:
                break
            hits.append(pos)
            pos += 5
            if len(hits) >= 8:
                break
        suffix = f"; CD001 offsets={hits}" if hits else "; no CD001 signature in first 256 KiB"
        raise ISO9660Error("unsupported or non-ISO9660 image layout" + suffix)

    def _read_pvd(self) -> bytes:
        for lba in range(16, 64):
            sec = self._sector_slice(lba)
            if sec[1:6] != b"CD001":
                continue
            dtype = sec[0]
            if dtype == 1:
                return sec
            if dtype == 255:
                break
        raise ISO9660Error("primary volume descriptor not found")

    @staticmethod
    def _both_endian_u32(field: bytes) -> int:
        if len(field) < 8:
            raise ISO9660Error("short both-endian integer")
        le = int.from_bytes(field[:4], "little")
        be = int.from_bytes(field[4:8], "big")
        if le != be:
            raise ISO9660Error(f"ISO endian mismatch: {le} != {be}")
        return le

    def _parse_root_entry(self) -> ISOEntry:
        record = self._pvd[156:190]
        if not record or record[0] < 34:
            raise ISO9660Error("invalid root directory record")
        return self._parse_record(record[: record[0]], parent="", forced_name="/")

    def _parse_record(self, rec: bytes, parent: str, forced_name: str | None = None) -> ISOEntry:
        if len(rec) < 34:
            raise ISO9660Error("short directory record")
        extent = self._both_endian_u32(rec[2:10])
        size = self._both_endian_u32(rec[10:18])
        flags = rec[25]
        name_len = rec[32]
        if 33 + name_len > len(rec):
            raise ISO9660Error("directory record has truncated filename")
        raw_name = rec[33:33 + name_len]
        if forced_name is not None:
            path = forced_name
        else:
            name = self._decode_file_id(raw_name)
            path = f"{parent.rstrip('/')}/{name}" if parent != "/" else f"/{name}"
        return ISOEntry(path=path, extent=extent, size=size, is_dir=bool(flags & 0x02), flags=flags)

    @staticmethod
    def _decode_file_id(raw: bytes) -> str:
        if raw == b"\x00":
            return "."
        if raw == b"\x01":
            return ".."
        name = raw.decode("ascii", errors="replace")
        if ";" in name:
            name = name.split(";", 1)[0]
        if name.endswith("."):
            name = name[:-1]
        return name

    def read_extent(self, extent: int, size: int) -> bytes:
        if size < 0:
            raise ISO9660Error("negative extent size")
        out = bytearray()
        remaining = size
        lba = extent
        while remaining:
            sec = self._sector_slice(lba)
            take = min(remaining, len(sec))
            out.extend(sec[:take])
            remaining -= take
            lba += 1
        return bytes(out)

    def read_entry(self, entry: ISOEntry) -> bytes:
        if entry.is_dir:
            raise IsADirectoryError(entry.path)
        return self.read_extent(entry.extent, entry.size)

    def _directory_entries(self, directory: ISOEntry) -> list[ISOEntry]:
        if not directory.is_dir:
            raise NotADirectoryError(directory.path)
        data = self.read_extent(directory.extent, directory.size)
        entries: list[ISOEntry] = []
        pos = 0
        logical = self.layout.logical_size
        while pos < len(data):
            rec_len = data[pos]
            if rec_len == 0:
                # Padding continues to the next logical block.
                pos = ((pos // logical) + 1) * logical
                continue
            if pos + rec_len > len(data):
                raise ISO9660Error(f"truncated directory record in {directory.path}")
            rec = data[pos:pos + rec_len]
            entry = self._parse_record(rec, parent=directory.path)
            if entry.name not in {".", ".."}:
                entries.append(entry)
            pos += rec_len
        return entries

    def walk(self, max_entries: int = 200000) -> list[ISOEntry]:
        out: list[ISOEntry] = []
        stack = [self.root]
        visited_dirs: set[tuple[int, int]] = set()
        while stack:
            directory = stack.pop()
            key = (directory.extent, directory.size)
            if key in visited_dirs:
                continue
            visited_dirs.add(key)
            children = self._directory_entries(directory)
            for child in children:
                out.append(child)
                if len(out) > max_entries:
                    raise ISO9660Error(f"ISO entry limit exceeded ({max_entries})")
                if child.is_dir:
                    stack.append(child)
        return out

    def find(self, predicate) -> list[ISOEntry]:
        return [entry for entry in self.walk() if predicate(entry)]


def inspect_iso(path: Path) -> dict:
    with ISO9660Reader(path) as iso:
        entries = iso.walk()
        return {
            "layout": iso.layout.label,
            "system_id": iso.system_id,
            "volume_id": iso.volume_id,
            "entry_count": len(entries),
        }


if __name__ == "__main__":
    import argparse, json
    ap = argparse.ArgumentParser()
    ap.add_argument("iso")
    ns = ap.parse_args()
    print(json.dumps(inspect_iso(Path(ns.iso)), indent=2))
