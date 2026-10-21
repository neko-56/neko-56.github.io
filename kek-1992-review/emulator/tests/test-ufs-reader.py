#!/usr/bin/env python3
from pathlib import Path
import io
import struct
import tarfile
import tempfile
import sys

BASE = Path(__file__).resolve().parents[1]
TOOLS = BASE / "tools"
sys.path.insert(0, str(TOOLS))
from ufs_reader import UFSReader, UFS_MAGIC  # noqa: E402

BSIZE = 4096
FSIZE = 512
FRAG = 8
IMG_BYTES = 4 * 1024 * 1024
IBLKNO = 32
INOPB = BSIZE // 128
IPG = 64
FPG = IMG_BYTES // FSIZE


def p32(img, off, value):
    struct.pack_into("<I", img, off, value)


def write_inode(img, ino, mode, size, direct):
    off = IBLKNO * FSIZE + ino * 128
    struct.pack_into("<HH", img, off, mode, 1)
    struct.pack_into("<Q", img, off + 8, size)
    vals = list(direct) + [0] * (12 - len(direct))
    struct.pack_into("<12I", img, off + 40, *vals)
    struct.pack_into("<3I", img, off + 88, 0, 0, 0)


def dirent(ino, name, reclen=None):
    raw = name.encode("ascii")
    need = (8 + len(raw) + 1 + 3) & ~3
    rec = reclen or need
    b = bytearray(rec)
    struct.pack_into("<IHH", b, 0, ino, rec, len(raw))
    b[8:8+len(raw)] = raw
    b[8+len(raw)] = 0
    return bytes(b)


def directory(entries):
    chunks = []
    used = 0
    for i, (ino, name) in enumerate(entries):
        if i == len(entries)-1:
            rec = 512-used
            chunks.append(dirent(ino, name, rec))
            used = 512
        else:
            c = dirent(ino, name)
            chunks.append(c)
            used += len(c)
    return b"".join(chunks)


def make_subset_tar():
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w") as tf:
        data = b"dummy-pcf-for-reader-test\n"
        ti = tarfile.TarInfo("usr/lib/X11/fonts/decwin/100dpi/terminal10.pcf")
        ti.size = len(data)
        tf.addfile(ti, io.BytesIO(data))
        idx = b"1\nterminal10.pcf -DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1\n"
        ti = tarfile.TarInfo("usr/lib/X11/fonts/decwin/100dpi/fonts.dir")
        ti.size = len(idx)
        tf.addfile(ti, io.BytesIO(idx))
    return buf.getvalue()


def make_image(path: Path):
    img = bytearray(IMG_BYTES)
    sb = 8192
    # Classic FFS geometry fields used by the reader.
    fields = {
        8: 16, 12: 24, 16: IBLKNO, 20: 40,
        24: 0, 28: 0xFFFFFFFF, 36: FPG, 40: FPG-100,
        44: 1, 48: BSIZE, 52: FSIZE, 56: FRAG,
        96: 3, 100: 0, 104: 1376, 116: BSIZE//4,
        120: INOPB, 124: 1, 152: 48, 156: 16,
        160: BSIZE, 164: 1, 168: 1, 172: 1, 176: 1,
        180: 1, 184: IPG, 188: FPG,
    }
    for rel, value in fields.items():
        p32(img, sb + rel, value)
    p32(img, sb + 1372, UFS_MAGIC)

    # Directories.
    root_fsb, risc_fsb, base_fsb = 64, 72, 80
    root = directory([(2, "."), (2, ".."), (3, "RISC")])
    risc = directory([(3, "."), (2, ".."), (4, "BASE")])
    base = directory([(4, "."), (3, ".."), (5, "UDWFONT15430")])
    img[root_fsb*FSIZE:root_fsb*FSIZE+512] = root
    img[risc_fsb*FSIZE:risc_fsb*FSIZE+512] = risc
    img[base_fsb*FSIZE:base_fsb*FSIZE+512] = base
    write_inode(img, 2, 0o040755, 512, [root_fsb])
    write_inode(img, 3, 0o040755, 512, [risc_fsb])
    write_inode(img, 4, 0o040755, 512, [base_fsb])

    subset = make_subset_tar()
    blocks = []
    next_fsb = 96
    pos = 0
    while pos < len(subset):
        blocks.append(next_fsb)
        chunk = subset[pos:pos+BSIZE]
        img[next_fsb*FSIZE:next_fsb*FSIZE+len(chunk)] = chunk
        next_fsb += FRAG
        pos += BSIZE
    assert len(blocks) <= 12
    write_inode(img, 5, 0o100644, len(subset), blocks)
    path.write_bytes(img)
    return subset


def main():
    with tempfile.TemporaryDirectory(prefix="kek-ufs-test-") as td:
        image = Path(td) / "ultrix-ufs.iso"
        expected = make_image(image)
        with UFSReader(image) as ufs:
            assert ufs.sb.byte_order == "little"
            assert ufs.sb.bsize == BSIZE
            entries = ufs.walk()
            matches = [e for e in entries if e.name == "UDWFONT15430"]
            assert len(matches) == 1, [e.path for e in entries]
            assert matches[0].path == "/RISC/BASE/UDWFONT15430"
            assert ufs.read_entry(matches[0]) == expected
    print("PASS: classic ULTRIX UFS reader / path walk / file extraction")


if __name__ == "__main__":
    main()
