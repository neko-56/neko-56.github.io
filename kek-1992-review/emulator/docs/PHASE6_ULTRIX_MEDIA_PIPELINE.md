# Phase 6 — ULTRIX 4.3 media pipeline

Updated: 2026-10-21

## Purpose

Use an actual ULTRIX 4.3 RISC distribution image as the provenance source for the KEK DECwindows bitmap-font candidate.  The project does not redistribute the ULTRIX-extracted target binary. v0.20 separately bundles an X Consortium-licensed DEC Terminal V2.2 raster verified equivalent to the target; see `DEC_TERMINAL_PROVENANCE.md`.

Primary media target:

- ULTRIX/UWS 4.3 RISC (August 1992)
- setld subset: `UDWFONT15430`
- documented install directory: `/usr/lib/X11/fonts/decwin/100dpi`

The 4.3 release notes give `UDWFONT15430` a total size of about 3773.710 KB and map this subset to the DECwindows 100dpi server-font directory.

## One-command extraction on macOS

```sh
emulator/tools/extract_ultrix_dec_terminal.command \
  "/path/to/Ultrix_RISC_4.3_OS.iso"
```

The default output directory is `./phase6-ultrix-fonts`.

The script performs these stages:

1. SHA-256 the media image for provenance.
2. Try the bundled **classic UFS1/FFS reader first**. ULTRIX CDs may use a Sun/old-UFS-style filesystem that current macOS does not mount.
3. If it is not UFS, try the bundled ISO9660 reader (2048-byte ISO and common raw-2352 layouts).
4. Only if both direct readers reject the image, try read-only `hdiutil` and `bsdtar`/`tar`, preserving their stderr in the failure log.
5. Locate the `UDWFONT15430` setld subset image.
6. Detect and decompress classic UNIX `compress` data when present.
7. Read the subset as a tar image without installing ULTRIX.
8. Extract only Terminal/font-index files under `/usr/lib/X11/fonts/decwin/100dpi`.
9. Decode PCF directly with the bundled dependency-free parser; external `pcf2bdf` is not required.
10. Reconstruct BDF one source bitmap bit to one BDF bitmap pixel.
11. Record source PCF hash, decoded PCF hash, BDF hash, XLFD, cell metrics and ASCII coverage.
12. Rank candidates and write `phase6-font-report.json`.

## Why the exact foundry is not pre-decided

Earlier Phase-5/6 work used this as the first provisional candidate:

`-DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1`

That remains a useful comparison target, but it is not allowed to override the actual PCF metadata from ULTRIX 4.3.  Contemporary UWS documentation also shows a `bitstream-terminal` 100dpi resource pattern for DECterm Big Font.  Therefore the font file from `UDWFONT15430` is the stronger evidence for foundry/family metadata.

`C-80` is intentional: XLFD `AVERAGE_WIDTH` is measured in tenths of a pixel, so an 8-pixel character-cell width is encoded as 80.

## Output interpretation

The best candidate is not automatically declared to be the exact KEK font.  Three separate questions remain:

1. Is it authentic to ULTRIX/UWS 4.3 media? — established by extraction provenance and hashes.
2. Is it the DECterm 100dpi 10pt candidate? — established by XLFD and the actual 8×15 metrics.
3. Was this exact font selected on the KEK workstation? — still requires evidence about that machine's X server/font path/DECterm resources.

This separation prevents a plausible media font from being promoted into an unsupported historical certainty.

## v0.18 media-format correction

The first local run of v0.17 reached the media-open stage and failed because both `hdiutil` and `tar` rejected the image. Historical ULTRIX CD usage notes show that ULTRIX CD images may be UFS rather than ISO9660. v0.18 therefore treats the filename extension `.iso` only as a container/name hint and detects the filesystem from on-disk structures. The source image remains read-only throughout.


## Phase 6.2 dual-density extension

The original Phase 6 command intentionally targeted `UDWFONT15430` / 100dpi because that was the media-verification question at the time. Phase 6.2 adds `tools/extract_ultrix_dec_terminal_density_pair.py`, which uses the same UFS/ISO readers twice:

- `UDWFONT430` → `/usr/lib/X11/fonts/decwin/75dpi`
- `UDWFONT15430` → `/usr/lib/X11/fonts/decwin/100dpi`

It then identifies the exact 75dpi/14pt and 100dpi/10pt DEC Terminal targets and compares both to the bundled public term14 using baseline-relative 8×15 raster normalization. The legacy 100dpi-only command remains for reproducibility.
