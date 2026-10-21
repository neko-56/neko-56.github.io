# DECterm historical font targets — Phase 6.3 evidence model

Updated: 2026-10-21

The reconstruction retains two DEC Terminal targets because the KEK runtime
server branch is unresolved while their glyph raster has already been shown to
be equivalent.

## A. Xws branch — 75dpi Little Font

`-DEC-Terminal-Medium-R-Normal--14-140-75-75-C-80-ISO8859-1`

- 75 dpi
- 14 point
- 14-pixel XLFD pixel size
- character-cell spacing, average width 80 (= 8 pixels)
- DECterm Little Font at the documented Xws default font density
- ULTRIX 4.3 subset: `UDWFONT430`

This is a **server-branch target**, not a confirmed KEK-machine default.

## B. 100dpi / Xwst3d branch and media-confirmed glyph reference

`-DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1`

- 100 dpi
- 10 point
- real ULTRIX 4.3 artifact: `UDWFONT15430/terminal10.pcf`
- full cell 8×15
- ascent 12 / descent 3
- advance 8

ULTRIX/UWS documents `Xwst3d` as 100dpi by default. An `Xws` session may also
select 100dpi explicitly using `-fd 100 -dpi 100`. The exact KEK server line is
not available.

## Why neither branch is ranked first

Digital's 30-Dec-1991 systems price list includes:

- `PM322-KN`: DECstation 5000/125 + PX 2D + VRT19;
- `PM323-KN`: DECstation 5000/125 + PXG 3D + VRT19.

The surviving machine is confirmed as a DECstation 5000/125, but its graphics
option has not been identified. Therefore Phase 6.3 stores both branches and
waits for physical module evidence or the actual `/etc/ttys` X-server command.

## Public rendering asset

GitHub Pages bundles the public X Consortium-lineage `term14.bdf`:

- XLFD matches target A (75dpi/14pt)
- 22,065 bytes / 2,952 lines
- SHA-256 `b93ab33ead159d11a4e503ab71c72b7b51802a35de27d5a326ab4648f448f081`
- normalized 8×15 raster vs target B: 195/195 identical, ASCII 95/95 identical

Therefore the current public bitmap has both:

- **metadata alignment** with the Xws/75dpi branch; and
- **raster equivalence** with the directly media-confirmed 100dpi artifact.

No ULTRIX-extracted font bytes are redistributed.

## Rendering geometry

The verified common glyph cell is 8×15, so 80×24 text cells occupy exactly
640×360 reconstructed pixels. Window-manager/DECterm chrome is outside this
plane and must not rescale it.
