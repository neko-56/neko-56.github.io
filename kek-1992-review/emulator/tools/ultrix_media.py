#!/usr/bin/env python3
"""Read-only media access for the KEK Phase 6 ULTRIX font extractor."""
from __future__ import annotations

from contextlib import contextmanager
from pathlib import Path
import hashlib
import io
import platform
import shutil
import subprocess
import tarfile
import tempfile

from iso9660_reader import ISO9660Reader, ISO9660Error
from ufs_reader import UFSReader, UFSError

DENSITY_SPECS = {
    75: {
        "subset": "UDWFONT430",
        "target_dir_fragment": "usr/lib/x11/fonts/decwin/75dpi",
    },
    100: {
        "subset": "UDWFONT15430",
        "target_dir_fragment": "usr/lib/x11/fonts/decwin/100dpi",
    },
}
# Backward-compatible defaults used by the original Phase 6 extractor.
SUBSET = DENSITY_SPECS[100]["subset"]
TARGET_DIR_FRAGMENT = DENSITY_SPECS[100]["target_dir_fragment"]
COMPRESS_MAGIC = b"\x1f\x9d"


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(4 * 1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def run_capture(cmd: list[str]) -> subprocess.CompletedProcess[bytes]:
    return subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)


def format_failure(label: str, cp: subprocess.CompletedProcess[bytes]) -> str:
    err = cp.stderr.decode("utf-8", errors="replace").strip()
    out = cp.stdout.decode("utf-8", errors="replace").strip()
    return f"{label} exit={cp.returncode}: {(err or out or 'no diagnostic output')[:2000]}"


@contextmanager
def media_root(source: Path, diagnostics: list[str] | None = None):
    """Yield a host-mounted/extracted tree as a final fallback."""
    if source.is_dir():
        yield source.resolve()
        return
    if not source.is_file():
        raise FileNotFoundError(source)

    diagnostics = diagnostics if diagnostics is not None else []
    with tempfile.TemporaryDirectory(prefix="kek-ultrix-media-") as td:
        mount = Path(td) / "media"
        mount.mkdir()
        if platform.system() == "Darwin" and shutil.which("hdiutil"):
            cp = run_capture([
                "hdiutil", "attach", "-readonly", "-nobrowse", "-noverify",
                "-mountpoint", str(mount), str(source),
            ])
            if cp.returncode == 0:
                try:
                    yield mount
                finally:
                    detach = run_capture(["hdiutil", "detach", str(mount)])
                    if detach.returncode != 0:
                        diagnostics.append(format_failure("hdiutil detach", detach))
                return
            diagnostics.append(format_failure("hdiutil attach", cp))

        extractor = shutil.which("bsdtar") or shutil.which("tar")
        if extractor:
            cp = run_capture([extractor, "-xf", str(source), "-C", str(mount)])
            if cp.returncode == 0:
                yield mount
                return
            diagnostics.append(format_failure(Path(extractor).name, cp))
        else:
            diagnostics.append("bsdtar/tar not found")

        detail = "\n".join(diagnostics[-4:])
        raise RuntimeError(
            "Could not read media with direct UFS/ISO readers or host tools"
            + (f":\n{detail}" if detail else "")
        )


def decompress_unix_compress(data: bytes, source_name: str) -> bytes:
    if not data.startswith(COMPRESS_MAGIC):
        return data
    with tempfile.TemporaryDirectory(prefix="kek-uncompress-") as td:
        src = Path(td) / "subset.Z"
        src.write_bytes(data)
        commands: list[list[str]] = []
        if shutil.which("gzip"):
            commands.append(["gzip", "-dc", str(src)])
        if shutil.which("uncompress"):
            commands.append(["uncompress", "-c", str(src)])
        for cmd in commands:
            cp = run_capture(cmd)
            if cp.returncode == 0 and cp.stdout:
                return cp.stdout
    raise RuntimeError(
        f"{source_name} is UNIX compress (.Z) data, but gzip/uncompress could not decode it"
    )


def _read_subset(subset_raw: bytes, source_name: str, subset_name: str = SUBSET) -> tuple[bytes, int]:
    subset_tar = decompress_unix_compress(subset_raw, source_name)
    try:
        with tarfile.open(fileobj=io.BytesIO(subset_tar), mode="r:") as tf:
            count = len(tf.getmembers())
    except tarfile.TarError as exc:
        raise RuntimeError(f"Cannot read {subset_name} as setld tar image: {exc}") from exc
    return subset_tar, count


def _normalized_member_name(name: str) -> str:
    return name.lstrip("./").replace("\\", "/").lower()


def extract_target_members(subset_data: bytes, output_dir: Path, target_dir_fragment: str = TARGET_DIR_FRAGMENT) -> list[Path]:
    extracted: list[Path] = []
    with tarfile.open(fileobj=io.BytesIO(subset_data), mode="r:") as tf:
        for member in tf.getmembers():
            if not member.isfile():
                continue
            norm = _normalized_member_name(member.name)
            if target_dir_fragment not in norm:
                continue
            base = Path(member.name).name
            low = base.lower()
            if "terminal" not in low and low not in {"fonts.dir", "fonts.alias"}:
                continue
            src = tf.extractfile(member)
            if src is None:
                continue
            data = src.read()
            dst = output_dir / base
            if dst.exists() and dst.read_bytes() != data:
                dst = output_dir / f"{len(extracted):03d}-{base}"
            dst.write_bytes(data)
            extracted.append(dst)
    return extracted


def _parent_name(posix_path: str) -> str:
    parts = [p for p in posix_path.replace("\\", "/").split("/") if p]
    return parts[-2].lower() if len(parts) >= 2 else ""


def _relevant_font_name(entry) -> bool:
    low = entry.name.lower()
    return "terminal" in low or low in {"fonts.dir", "fonts.alias"}


def _select_subset(entries, subset_name: str = SUBSET) -> object | None:
    candidates = [
        e for e in entries
        if not e.is_dir
        and e.name.upper().startswith(subset_name)
        and Path(e.name).suffix.lower() not in {".inv", ".ctrl", ".scp", ".image"}
        and _parent_name(e.path) != "instctrl"
    ]
    candidates.sort(key=lambda e: (e.name.upper() == subset_name, e.size), reverse=True)
    return candidates[0] if candidates else None


def _record_subset(manifest: dict, path: str, raw: bytes, tar_data: bytes, count: int) -> None:
    manifest["subset"] = path
    manifest["subset_source_sha256"] = sha256_bytes(raw)
    manifest["subset_tar_sha256"] = sha256_bytes(tar_data)
    manifest["subset_member_count"] = count


def extract_from_ufs(source: Path, original_dir: Path, manifest: dict, *, subset_name: str = SUBSET, target_dir_fragment: str = TARGET_DIR_FRAGMENT, density_label: str = "100dpi") -> list[Path]:
    with UFSReader(source) as ufs:
        entries = ufs.walk()
        manifest["media_access"] = "direct classic UFS1 reader"
        manifest["ufs"] = ufs.summary() | {"entry_count": len(entries)}
        print(
            "[2/5] Direct UFS read: "
            f"{manifest['ufs']['byte_order']}-endian; "
            f"bsize={manifest['ufs']['block_size']}; "
            f"fsize={manifest['ufs']['fragment_size']}; entries={len(entries)}"
        )
        direct = [
            e for e in entries
            if not e.is_dir and target_dir_fragment in e.path.lower().lstrip("/")
            and _relevant_font_name(e)
        ]
        if direct:
            print(f"[3/5] Found expanded {density_label} font directory ({len(direct)} relevant files)")
            out: list[Path] = []
            for entry in direct:
                data = ufs.read_entry(entry)
                dst = original_dir / entry.name
                if dst.exists() and dst.read_bytes() != data:
                    dst = original_dir / f"{len(out):03d}-{entry.name}"
                dst.write_bytes(data)
                out.append(dst)
            manifest["subset"] = "already expanded on UFS media"
            return out

        subset = _select_subset(entries, subset_name)
        if subset is None:
            nearby = [e.path for e in entries if not e.is_dir and "UDWFONT" in e.name.upper()]
            raise RuntimeError(f"{subset_name} subset image not found in UFS tree; nearby={nearby[:30]}")
        print(f"[3/5] Found subset in UFS: {subset.path} ({subset.size} bytes)")
        raw = ufs.read_entry(subset)
        tar_data, count = _read_subset(raw, subset.name, subset_name)
        _record_subset(manifest, subset.path, raw, tar_data, count)
        return extract_target_members(tar_data, original_dir, target_dir_fragment)


def extract_from_iso9660(source: Path, original_dir: Path, manifest: dict, *, subset_name: str = SUBSET, target_dir_fragment: str = TARGET_DIR_FRAGMENT, density_label: str = "100dpi") -> list[Path]:
    with ISO9660Reader(source) as iso:
        entries = iso.walk()
        manifest["media_access"] = "direct ISO9660 reader"
        manifest["iso9660"] = {
            "layout": iso.layout.label,
            "system_id": iso.system_id,
            "volume_id": iso.volume_id,
            "entry_count": len(entries),
        }
        print(
            "[2/5] Direct ISO9660 read: "
            f"{iso.layout.label}; volume={iso.volume_id or '(blank)'}; entries={len(entries)}"
        )
        direct = [
            e for e in entries
            if not e.is_dir and target_dir_fragment in e.path.lower().lstrip("/")
            and _relevant_font_name(e)
        ]
        if direct:
            print(f"[3/5] Found expanded {density_label} font directory ({len(direct)} relevant files)")
            out: list[Path] = []
            for entry in direct:
                data = iso.read_entry(entry)
                dst = original_dir / entry.name
                if dst.exists() and dst.read_bytes() != data:
                    dst = original_dir / f"{len(out):03d}-{entry.name}"
                dst.write_bytes(data)
                out.append(dst)
            manifest["subset"] = "already expanded on ISO media"
            return out

        subset = _select_subset(entries, subset_name)
        if subset is None:
            nearby = [e.path for e in entries if not e.is_dir and "UDWFONT" in e.name.upper()]
            raise RuntimeError(f"{subset_name} subset image not found in ISO9660 tree; nearby={nearby[:30]}")
        print(f"[3/5] Found subset in ISO: {subset.path} ({subset.size} bytes)")
        raw = iso.read_entry(subset)
        tar_data, count = _read_subset(raw, subset.name, subset_name)
        _record_subset(manifest, subset.path, raw, tar_data, count)
        return extract_target_members(tar_data, original_dir, target_dir_fragment)


def _find_subset_images(root: Path, subset_name: str = SUBSET) -> list[Path]:
    candidates: list[Path] = []
    for p in root.rglob("*"):
        if not p.is_file() or not p.name.upper().startswith(subset_name):
            continue
        if p.parent.name.lower() == "instctrl" or p.suffix.lower() in {".inv", ".ctrl", ".scp", ".image"}:
            continue
        candidates.append(p)
    return sorted(candidates, key=lambda p: (p.name.upper() == subset_name, p.stat().st_size), reverse=True)


def _locate_direct_font_dir(root: Path, target_dir_fragment: str = TARGET_DIR_FRAGMENT) -> Path | None:
    density_dir = Path(target_dir_fragment).name
    for p in root.rglob(density_dir):
        if p.is_dir() and p.as_posix().lower().endswith(target_dir_fragment):
            return p
    return None


def _extract_from_tree(root: Path, original_dir: Path, manifest: dict, *, subset_name: str = SUBSET, target_dir_fragment: str = TARGET_DIR_FRAGMENT) -> list[Path]:
    direct = _locate_direct_font_dir(root, target_dir_fragment)
    out: list[Path] = []
    if direct:
        print(f"[3/5] Found already-expanded font directory: {direct}")
        for p in direct.iterdir():
            if p.is_file() and ("terminal" in p.name.lower() or p.name.lower() in {"fonts.dir", "fonts.alias"}):
                dst = original_dir / p.name
                shutil.copy2(p, dst)
                out.append(dst)
        manifest["subset"] = "already expanded on media"
        return out

    subsets = _find_subset_images(root, subset_name)
    if not subsets:
        nearby = [str(p.relative_to(root)) for p in root.rglob("*") if p.is_file() and "UDWFONT" in p.name.upper()]
        raise RuntimeError(f"{subset_name} subset image not found; nearby={nearby[:20]}")
    subset = subsets[0]
    print(f"[3/5] Found subset: {subset.relative_to(root)}")
    raw = subset.read_bytes()
    tar_data, count = _read_subset(raw, subset.name, subset_name)
    _record_subset(manifest, str(subset.relative_to(root)), raw, tar_data, count)
    return extract_target_members(tar_data, original_dir, target_dir_fragment)


def extract_media_fonts(source: Path, original_dir: Path, manifest: dict, *, subset_name: str = SUBSET, target_dir_fragment: str = TARGET_DIR_FRAGMENT, density_label: str = "100dpi") -> list[Path]:
    """Detect media filesystem and return extracted Terminal/font-index files.

    Defaults preserve the Phase 6 100dpi behavior.  Phase 6.2 can pass the
    75dpi UDWFONT430 specification without duplicating the media reader.
    """
    if source.is_dir():
        manifest["media_access"] = "extracted directory"
        return _extract_from_tree(source, original_dir, manifest, subset_name=subset_name, target_dir_fragment=target_dir_fragment)

    direct_ufs_error: str | None = None
    direct_iso_error: str | None = None
    try:
        return extract_from_ufs(source, original_dir, manifest, subset_name=subset_name, target_dir_fragment=target_dir_fragment, density_label=density_label)
    except UFSError as exc:
        direct_ufs_error = str(exc)
        print(f"[2/5] Direct UFS reader did not recognize media: {exc}")
    except RuntimeError:
        raise

    try:
        return extract_from_iso9660(source, original_dir, manifest, subset_name=subset_name, target_dir_fragment=target_dir_fragment, density_label=density_label)
    except ISO9660Error as exc:
        direct_iso_error = str(exc)
        print(f"[2/5] Direct ISO9660 reader did not recognize media: {exc}")
    except RuntimeError:
        raise

    diagnostics: list[str] = []
    with media_root(source, diagnostics) as root:
        manifest["media_access"] = "host-mounted/extracted directory"
        if direct_ufs_error:
            manifest["direct_ufs_error"] = direct_ufs_error
        if direct_iso_error:
            manifest["direct_iso_error"] = direct_iso_error
        if diagnostics:
            manifest["host_tool_diagnostics"] = diagnostics
        print(f"[2/5] Media root: {root}")
        return _extract_from_tree(root, original_dir, manifest, subset_name=subset_name, target_dir_fragment=target_dir_fragment)
