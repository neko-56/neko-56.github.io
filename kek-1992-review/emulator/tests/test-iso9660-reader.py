#!/usr/bin/env python3
from pathlib import Path
import tempfile
import sys

BASE = Path(__file__).resolve().parents[1]
TOOLS = BASE / "tools"
sys.path.insert(0, str(TOOLS))
from iso9660_reader import ISO9660Reader  # noqa: E402

SECTOR = 2048


def both16(n: int) -> bytes:
    return n.to_bytes(2, "little") + n.to_bytes(2, "big")


def both32(n: int) -> bytes:
    return n.to_bytes(4, "little") + n.to_bytes(4, "big")


def dir_record(extent: int, size: int, name: bytes, is_dir: bool) -> bytes:
    pad = 1 if len(name) % 2 == 0 else 0
    length = 33 + len(name) + pad
    r = bytearray(length)
    r[0] = length
    r[1] = 0
    r[2:10] = both32(extent)
    r[10:18] = both32(size)
    r[18:25] = bytes([126, 10, 21, 1, 0, 0, 0])
    r[25] = 2 if is_dir else 0
    r[26] = 0
    r[27] = 0
    r[28:32] = both16(1)
    r[32] = len(name)
    r[33:33 + len(name)] = name
    return bytes(r)


def pack_dir(records: list[bytes]) -> bytes:
    data = b"".join(records)
    if len(data) > SECTOR:
        raise ValueError("test directory too large")
    return data + b"\0" * (SECTOR - len(data))


def make_iso(path: Path) -> bytes:
    total = 32
    img = bytearray(total * SECTOR)

    pvd = bytearray(SECTOR)
    pvd[0:7] = b"\x01CD001\x01"
    pvd[8:40] = b"PYTEST".ljust(32, b" ")
    pvd[40:72] = b"ULTRIX43_TEST".ljust(32, b" ")
    pvd[80:88] = both32(total)
    pvd[120:124] = both16(1)
    pvd[124:128] = both16(1)
    pvd[128:132] = both16(SECTOR)
    root = dir_record(20, SECTOR, b"\x00", True)
    pvd[156:156 + len(root)] = root
    img[16 * SECTOR:17 * SECTOR] = pvd

    term = bytearray(SECTOR)
    term[0:7] = b"\xffCD001\x01"
    img[17 * SECTOR:18 * SECTOR] = term

    root_dir = pack_dir([
        dir_record(20, SECTOR, b"\x00", True),
        dir_record(20, SECTOR, b"\x01", True),
        dir_record(21, SECTOR, b"RISC", True),
    ])
    risc_dir = pack_dir([
        dir_record(21, SECTOR, b"\x00", True),
        dir_record(20, SECTOR, b"\x01", True),
        dir_record(22, SECTOR, b"BASE", True),
    ])
    payload = b"ULTRIX setld subset placeholder\n"
    base_dir = pack_dir([
        dir_record(22, SECTOR, b"\x00", True),
        dir_record(21, SECTOR, b"\x01", True),
        dir_record(23, len(payload), b"UDWFONT15430;1", False),
    ])
    img[20 * SECTOR:21 * SECTOR] = root_dir
    img[21 * SECTOR:22 * SECTOR] = risc_dir
    img[22 * SECTOR:23 * SECTOR] = base_dir
    img[23 * SECTOR:23 * SECTOR + len(payload)] = payload
    path.write_bytes(img)
    return bytes(img)


def raw2352(iso: bytes, user_offset: int) -> bytes:
    out = bytearray()
    for pos in range(0, len(iso), SECTOR):
        sector = iso[pos:pos + SECTOR]
        out += b"\0" * user_offset
        out += sector
        out += b"\0" * (2352 - user_offset - SECTOR)
    return bytes(out)


def verify(path: Path, expected_layout: str) -> None:
    with ISO9660Reader(path) as iso:
        assert iso.layout.label == expected_layout, (iso.layout.label, expected_layout)
        assert iso.volume_id == "ULTRIX43_TEST"
        entries = iso.walk()
        subset = [e for e in entries if e.name.upper() == "UDWFONT15430"]
        assert len(subset) == 1, [e.path for e in entries]
        assert subset[0].path == "/RISC/BASE/UDWFONT15430"
        assert iso.read_entry(subset[0]) == b"ULTRIX setld subset placeholder\n"


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="kek-iso9660-test-") as td:
        td = Path(td)
        normal = td / "normal.iso"
        iso = make_iso(normal)
        verify(normal, "ISO9660/2048")

        raw16 = td / "raw16.iso"
        raw16.write_bytes(raw2352(iso, 16))
        verify(raw16, "raw-2352/user+16")

        raw24 = td / "raw24.iso"
        raw24.write_bytes(raw2352(iso, 24))
        verify(raw24, "raw-2352/user+24")
    print("PASS: direct ISO9660 reader (2048/raw2352 layouts)")


if __name__ == "__main__":
    main()
