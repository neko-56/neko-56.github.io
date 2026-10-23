#!/usr/bin/env python3
"""Read-only UFS/FFS reader for historical ULTRIX CD images.

This is intentionally scoped to Phase 6 extraction.  It reads classic UFS1/FFS
images directly, without mounting them on macOS.  The implementation follows the
on-disk geometry used by classic BSD/Sun/ULTRIX UFS: primary superblock at byte
8192, 128-byte UFS1 inodes, root inode 2, 12 direct + 3 indirect pointers, and
512-byte directory-record groups.

The reader supports either byte order and also searches for a small partition
base offset before giving up.  It never writes to the source image.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import mmap
import struct

UFS_MAGIC = 0x00011954
SBLOCK = 8192
SB_MAGIC_OFFSET = 1372
DINODE_SIZE = 128
ROOTINO = 2
NDADDR = 12
NIADDR = 3
IFMT = 0xF000
IFDIR = 0x4000
IFREG = 0x8000
IFLNK = 0xA000


class UFSError(RuntimeError):
    pass


@dataclass(frozen=True)
class Superblock:
    base: int
    endian: str
    sblkno: int
    cblkno: int
    iblkno: int
    dblkno: int
    cgoffset: int
    cgmask: int
    size: int
    dsize: int
    ncg: int
    bsize: int
    fsize: int
    frag: int
    fragshift: int
    fsbtodb: int
    sbsize: int
    nindir: int
    inopb: int
    nspf: int
    csaddr: int
    cssize: int
    cgsize: int
    ntrak: int
    nsect: int
    spc: int
    ncyl: int
    cpg: int
    ipg: int
    fpg: int

    @property
    def byte_order(self) -> str:
        return "little" if self.endian == "<" else "big"


@dataclass(frozen=True)
class Inode:
    number: int
    mode: int
    nlink: int
    size: int
    direct: tuple[int, ...]
    indirect: tuple[int, ...]

    @property
    def is_dir(self) -> bool:
        return (self.mode & IFMT) == IFDIR

    @property
    def is_file(self) -> bool:
        return (self.mode & IFMT) == IFREG

    @property
    def is_symlink(self) -> bool:
        return (self.mode & IFMT) == IFLNK


@dataclass(frozen=True)
class DirEntry:
    inode: int
    name: str
    reclen: int


@dataclass(frozen=True)
class UFSEntry:
    path: str
    inode: int
    size: int
    is_dir: bool

    @property
    def name(self) -> str:
        return self.path.rsplit("/", 1)[-1]


class UFSReader:
    def __init__(self, path: Path):
        self.path = Path(path)
        self._fh = self.path.open("rb")
        self._mm = mmap.mmap(self._fh.fileno(), 0, access=mmap.ACCESS_READ)
        self.sb = self._find_superblock()

    def close(self) -> None:
        try:
            self._mm.close()
        finally:
            self._fh.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        self.close()

    def _u16(self, offset: int) -> int:
        return struct.unpack_from(self.sb.endian + "H", self._mm, offset)[0]

    def _u32(self, offset: int) -> int:
        return struct.unpack_from(self.sb.endian + "I", self._mm, offset)[0]

    def _u64(self, offset: int) -> int:
        return struct.unpack_from(self.sb.endian + "Q", self._mm, offset)[0]

    @staticmethod
    def _decode_superblock(data: mmap.mmap, base: int, endian: str) -> Superblock:
        sb = base + SBLOCK

        def u32(rel: int) -> int:
            return struct.unpack_from(endian + "I", data, sb + rel)[0]

        magic = u32(SB_MAGIC_OFFSET)
        if magic != UFS_MAGIC:
            raise UFSError(f"bad UFS magic 0x{magic:08x}")
        vals = {
            "sblkno": u32(8), "cblkno": u32(12), "iblkno": u32(16), "dblkno": u32(20),
            "cgoffset": u32(24), "cgmask": u32(28), "size": u32(36), "dsize": u32(40),
            "ncg": u32(44), "bsize": u32(48), "fsize": u32(52), "frag": u32(56),
            "fragshift": u32(96), "fsbtodb": u32(100), "sbsize": u32(104),
            "nindir": u32(116), "inopb": u32(120), "nspf": u32(124),
            "csaddr": u32(152), "cssize": u32(156), "cgsize": u32(160),
            "ntrak": u32(164), "nsect": u32(168), "spc": u32(172), "ncyl": u32(176),
            "cpg": u32(180), "ipg": u32(184), "fpg": u32(188),
        }
        return Superblock(base=base, endian=endian, **vals)

    def _plausible(self, sb: Superblock) -> bool:
        if sb.bsize < 4096 or sb.bsize > 65536 or sb.bsize & (sb.bsize - 1):
            return False
        if sb.fsize < 512 or sb.fsize > sb.bsize or sb.fsize & (sb.fsize - 1):
            return False
        if sb.frag != sb.bsize // sb.fsize or sb.frag not in {1, 2, 4, 8}:
            return False
        if sb.inopb not in {sb.bsize // DINODE_SIZE, 0}:
            return False
        if sb.ipg <= 0 or sb.fpg <= 0 or sb.ncg <= 0:
            return False
        if sb.nindir not in {sb.bsize // 4, 0}:
            return False
        fs_bytes = sb.size * sb.fsize
        if fs_bytes <= 0 or sb.base + fs_bytes > len(self._mm) + sb.bsize:
            return False
        return True

    def _find_superblock(self) -> Superblock:
        # A normal ULTRIX CD filesystem starts at byte 0.  Search a bounded set
        # of 512-byte-aligned partition bases as a compatibility fallback.
        max_base = min(max(0, len(self._mm) - SBLOCK - SB_MAGIC_OFFSET - 4), 4 * 1024 * 1024)
        candidates = [0] + [x for x in range(512, max_base + 1, 512)]
        for base in candidates:
            pos = base + SBLOCK + SB_MAGIC_OFFSET
            raw = self._mm[pos:pos + 4]
            if len(raw) < 4:
                break
            for endian in ("<", ">"):
                if struct.unpack(endian + "I", raw)[0] != UFS_MAGIC:
                    continue
                try:
                    sb = self._decode_superblock(self._mm, base, endian)
                except (UFSError, struct.error):
                    continue
                if self._plausible(sb):
                    return sb
        raise UFSError(
            "classic UFS1 superblock not found in first 4 MiB "
            f"(expected magic 0x{UFS_MAGIC:08x} at superblock+{SB_MAGIC_OFFSET})"
        )

    def _cgstart(self, cg: int) -> int:
        sb = self.sb
        # cgstart = cgbase + cgoffset * (cg & ~cgmask)
        mask32 = (~sb.cgmask) & 0xFFFFFFFF
        return sb.fpg * cg + sb.cgoffset * (cg & mask32)

    def _inode_offset(self, ino: int) -> int:
        sb = self.sb
        if ino < 0:
            raise UFSError("negative inode")
        inopb = sb.inopb or (sb.bsize // DINODE_SIZE)
        cg = ino // sb.ipg
        if cg >= sb.ncg:
            raise UFSError(f"inode {ino} cylinder group outside filesystem")
        cgimin = self._cgstart(cg) + sb.iblkno
        block_index = (ino % sb.ipg) // inopb
        fsb = cgimin + block_index * sb.frag
        off = sb.base + fsb * sb.fsize + (ino % inopb) * DINODE_SIZE
        if off < 0 or off + DINODE_SIZE > len(self._mm):
            raise UFSError(f"inode {ino} lies outside image")
        return off

    def read_inode(self, ino: int) -> Inode:
        off = self._inode_offset(ino)
        e = self.sb.endian
        mode, nlink = struct.unpack_from(e + "HH", self._mm, off)
        size = struct.unpack_from(e + "Q", self._mm, off + 8)[0]
        direct = struct.unpack_from(e + "12I", self._mm, off + 40)
        indirect = struct.unpack_from(e + "3I", self._mm, off + 88)
        return Inode(ino, mode, nlink, size, tuple(direct), tuple(indirect))

    def _read_fsb(self, fsb: int, size: int | None = None) -> bytes:
        if fsb == 0:
            return b"\0" * (size or self.sb.bsize)
        length = self.sb.bsize if size is None else size
        off = self.sb.base + fsb * self.sb.fsize
        end = off + length
        if off < 0 or end > len(self._mm):
            raise UFSError(f"filesystem block {fsb} outside image")
        return self._mm[off:end]

    def _indirect_entries(self, fsb: int) -> tuple[int, ...]:
        data = self._read_fsb(fsb)
        count = self.sb.nindir or (self.sb.bsize // 4)
        return struct.unpack_from(self.sb.endian + f"{count}I", data, 0)

    def _block_pointer(self, inode: Inode, lbn: int) -> int:
        if lbn < NDADDR:
            return inode.direct[lbn]
        nindir = self.sb.nindir or (self.sb.bsize // 4)
        idx = lbn - NDADDR
        if idx < nindir:
            root = inode.indirect[0]
            if root == 0:
                return 0
            return self._indirect_entries(root)[idx]
        idx -= nindir
        if idx < nindir * nindir:
            root = inode.indirect[1]
            if root == 0:
                return 0
            first = idx // nindir
            second = idx % nindir
            p1 = self._indirect_entries(root)[first]
            return 0 if p1 == 0 else self._indirect_entries(p1)[second]
        idx -= nindir * nindir
        if idx < nindir * nindir * nindir:
            root = inode.indirect[2]
            if root == 0:
                return 0
            first = idx // (nindir * nindir)
            rem = idx % (nindir * nindir)
            second = rem // nindir
            third = rem % nindir
            p1 = self._indirect_entries(root)[first]
            if p1 == 0:
                return 0
            p2 = self._indirect_entries(p1)[second]
            return 0 if p2 == 0 else self._indirect_entries(p2)[third]
        raise UFSError(f"logical block {lbn} exceeds triple-indirect range")

    def read_inode_data(self, inode: Inode) -> bytes:
        if inode.size > len(self._mm):
            raise UFSError(f"inode {inode.number} has implausible size {inode.size}")
        out = bytearray()
        remaining = inode.size
        lbn = 0
        while remaining > 0:
            take = min(remaining, self.sb.bsize)
            ptr = self._block_pointer(inode, lbn)
            if ptr == 0:
                out.extend(b"\0" * take)
            else:
                # For the final short allocation a fragment pointer still maps
                # to fsb*fsize; reading only the requested bytes is sufficient.
                out.extend(self._read_fsb(ptr, take))
            remaining -= take
            lbn += 1
        return bytes(out)

    def read_file(self, ino: int) -> bytes:
        inode = self.read_inode(ino)
        if inode.is_dir:
            raise IsADirectoryError(ino)
        return self.read_inode_data(inode)

    def list_dir(self, ino: int) -> list[DirEntry]:
        inode = self.read_inode(ino)
        if not inode.is_dir:
            raise NotADirectoryError(ino)
        data = self.read_inode_data(inode)
        e = self.sb.endian
        out: list[DirEntry] = []
        pos = 0
        while pos + 8 <= len(data):
            # Directories are divided into 512-byte records; all space in each
            # group is covered by d_reclen values.
            block_remaining = 512 - (pos % 512)
            if block_remaining < 8:
                pos += block_remaining
                continue
            d_ino = struct.unpack_from(e + "I", data, pos)[0]
            reclen = struct.unpack_from(e + "H", data, pos + 4)[0]
            if reclen == 0:
                pos += block_remaining
                continue
            if reclen < 8 or reclen > block_remaining or pos + reclen > len(data):
                raise UFSError(f"bad directory record length {reclen} in inode {ino} at {pos}")

            # ULTRIX struct direct uses a 16-bit d_namlen at +6.  Some related
            # UFS variants use d_type/+6 and 8-bit d_namlen/+7, so accept both.
            namlen16 = struct.unpack_from(e + "H", data, pos + 6)[0]
            if namlen16 <= 255 and 8 + namlen16 <= reclen:
                namlen = namlen16
                name_off = pos + 8
            else:
                namlen = data[pos + 7]
                name_off = pos + 8
            raw = data[name_off:name_off + namlen]
            name = raw.decode("latin-1", errors="replace")
            if d_ino and name and name not in {".", ".."}:
                out.append(DirEntry(d_ino, name, reclen))
            pos += reclen
        return out

    def walk(self, max_entries: int = 200000) -> list[UFSEntry]:
        root = self.read_inode(ROOTINO)
        if not root.is_dir:
            raise UFSError(f"root inode {ROOTINO} is not a directory (mode=0{root.mode:o})")
        out: list[UFSEntry] = []
        stack: list[tuple[str, int]] = [("", ROOTINO)]
        visited_dirs: set[int] = set()
        while stack:
            parent, ino = stack.pop()
            if ino in visited_dirs:
                continue
            visited_dirs.add(ino)
            for d in self.list_dir(ino):
                child = self.read_inode(d.inode)
                path = f"{parent}/{d.name}" if parent else f"/{d.name}"
                entry = UFSEntry(path, d.inode, child.size, child.is_dir)
                out.append(entry)
                if len(out) > max_entries:
                    raise UFSError(f"UFS entry limit exceeded ({max_entries})")
                if child.is_dir:
                    stack.append((path, d.inode))
        return out

    def read_entry(self, entry: UFSEntry) -> bytes:
        if entry.is_dir:
            raise IsADirectoryError(entry.path)
        return self.read_file(entry.inode)

    def summary(self) -> dict:
        sb = self.sb
        return {
            "format": "classic UFS1/FFS",
            "partition_base": sb.base,
            "byte_order": sb.byte_order,
            "block_size": sb.bsize,
            "fragment_size": sb.fsize,
            "fragments_per_block": sb.frag,
            "cylinder_groups": sb.ncg,
            "inodes_per_group": sb.ipg,
            "fragments_per_group": sb.fpg,
            "filesystem_bytes": sb.size * sb.fsize,
        }


if __name__ == "__main__":
    import argparse, json
    ap = argparse.ArgumentParser()
    ap.add_argument("image")
    ns = ap.parse_args()
    with UFSReader(Path(ns.image)) as ufs:
        info = ufs.summary()
        entries = ufs.walk()
        info["entry_count"] = len(entries)
        info["udwfont"] = [e.path for e in entries if "UDWFONT" in e.name.upper()][:50]
        print(json.dumps(info, indent=2))
