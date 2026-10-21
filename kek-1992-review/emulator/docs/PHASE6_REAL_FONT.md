# Phase 6 — KEK real bitmap font

Updated: 2026-10-21

## Goal

Replace the last major visual substitute in the KEK profile: Courier/system-font fallback. A historical DECwindows Terminal bitmap is accepted only after the file itself is inspected and its provenance is recorded.

## Current evidence

- OpenVMS/DECwindows system-file inventories explicitly list `TERMINAL10_100DPI.PCF`; this is useful filename evidence but is not assumed to be the ULTRIX filename.
- The August 1992 ULTRIX 4.3 installation guide identifies `UDWFONT15430` as the `X11/DECwindows 100dpi Fonts` subset.
- ULTRIX/UWS 4.3 release notes map `UDWFONT15430` to `/usr/lib/X11/fonts/decwin/100dpi`.
- UWS documentation distinguishes X servers/font paths and also shows a `bitstream-terminal` 100dpi DECterm resource example. The exact foundry must therefore come from the real ULTRIX PCF rather than from a preselected label.

## Media-confirmed comparison target

The following remains the directly media-confirmed **100dpi glyph target**. Phase 6.3 separates this artifact from the unresolved KEK server branch: Xws defaults to 75dpi, while Xwst3d defaults to 100dpi; Xws can also be explicitly moved to 100dpi.

`-DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1`

The supplied ULTRIX 4.3 PCF has now been inspected and matches this XLFD exactly. `AVERAGE_WIDTH=80` means 8.0 pixels in XLFD units.

Its real bitmap metrics are 8×15 pixels (`FONT_ASCENT 12`, `FONT_DESCENT 3`). The earlier inference that XLFD `PIXEL_SIZE=14` implied a 14-pixel cell was incorrect.

## Acceptance layers

The verifier now separates two ideas that were previously too tightly coupled:

### Authentic media candidate

A font may be called an authentic ULTRIX 4.3 media candidate when:

1. it is extracted from `UDWFONT15430` on user-supplied ULTRIX 4.3 media;
2. its original-file SHA-256 is recorded;
3. the PCF parses losslessly and its BDF reconstruction preserves the bitmap;
4. its XLFD and metrics are reported without rewriting them to fit the hypothesis.

### Exact KEK profile match

`HISTORICAL BITMAP ACTIVE` for the current KEK profile remains stricter. It requires the selected profile target, cell metrics, ASCII coverage and SHA-256 to agree. If the real ULTRIX font disproves the provisional target, the profile must be corrected rather than rejecting the real font.

## Rendering rule

A BDF glyph pixel maps to one reconstructed framebuffer pixel. The renderer must not enlarge the glyph to fill the DECterm window. UI enlargement happens only at the presentation layer (100%, 125%, 150%, ...), with image smoothing disabled. For the confirmed `terminal10.pcf`, an 80×24 text grid is 640×360 reconstructed pixels using the parsed 8×15 metrics. If later DECterm source evidence shows extra row leading, that must be modeled separately rather than folded into the font bitmap.

## ISO extraction

For the user's `Ultrix_RISC_4.3_OS.iso`:

```sh
emulator/tools/extract_ultrix_dec_terminal.command \
  "/path/to/Ultrix_RISC_4.3_OS.iso"
```

See `PHASE6_ULTRIX_MEDIA_PIPELINE.md` for the full provenance/extraction procedure.

For an already-mounted/extracted tree:

```sh
python3 emulator/tools/find_dec_terminal_font.py /path/to/tree
```

For one known PCF or compressed PCF:

```sh
emulator/tools/pcf_to_bdf.command /path/to/font.pcf.Z
python3 emulator/tools/inspect_bdf.py /path/to/font.bdf
```

No external `pcf2bdf` program is required.

## What is still unknown

- Exact ULTRIX/UWS installation and X server configuration on the KEK DECstation.
- Exact font path/resource selection when Line Mode Browser was run.
- Exact DECterm decoration geometry.
- Exact monitor model attached to the KEK machine.

Those unknowns remain explicit. The font artifact is no longer provisional; the KEK runtime selection of that artifact still is.


## ULTRIX 4.3 result — gate passed for the font artifact

The extraction run on 2026-10-21 found the exact 100dpi target metadata in `terminal10.pcf`. The historical-font gate for the KEK profile requires exact XLFD target, 8×15 parsed bitmap metrics, complete ASCII 0x20–0x7E coverage, and the verified reconstructed-BDF SHA-256. This verifies the font artifact from the supplied ULTRIX 4.3 medium. It does **not** prove which density the KEK runtime selected. Phase 6.3 leaves that decision unresolved until the graphics option or actual X-server startup configuration is recovered.
