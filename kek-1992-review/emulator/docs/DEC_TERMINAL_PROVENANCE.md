# DEC Terminal glyph provenance for GitHub Pages

## Purpose

The public GitHub Pages build renders the historical terminal glyphs without a
local ULTRIX installation, system font, or browser font antialiasing. It bundles
the public DEC/X Consortium BDF and draws its 1-bit glyph pixels directly into
the Canvas framebuffer.

## Media-confirmed raster target — verification source only, not redistributed

ULTRIX 4.3 RISC media subset `UDWFONT15430` contains `terminal10.pcf`:

- XLFD: `-DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1`
- product: `DECterm Fonts V2.2, 11-Nov-1991`
- 195 encoded glyphs
- full cell: 8 × 15 pixels
- ascent 12 / descent 3 / advance 8
- PCF SHA-256: `46cdbd6f8656ddd7704df99f2103274c9ae9ffe1fc829ae57f92f6bb910d89d5`
- verification BDF SHA-256: `7cfc76e2e45ebfceb0e8d7fb1632e0710a550bac4dbe14e2ddf7c2bc94e84033`

The ULTRIX PCF/BDF bytes are not shipped in this repository.


## Runtime-selection evidence (Phase 6.2, corrected by Phase 6.3)

The media-confirmed 100dpi artifact does not by itself prove the KEK runtime
path. ULTRIX/UWS documentation gives `Xws` a 75dpi default font path, while
`Xwst3d` uses 100dpi by default. DECterm Little Font maps 75dpi to 14pt and
100dpi to 10pt. An `Xws` session can also be explicitly moved to 100dpi with
server-density options such as `-fd 100 -dpi 100`.

Phase 6.3 removes the earlier assumption that the KEK DECstation necessarily
followed the Xws branch. DEC's contemporary price list includes both PX 2D and
PXG 3D DECstation 5000/125 + VRT19 packages, and the surviving graphics option
has not been identified.

The public `term14.bdf` therefore has a useful dual status: its XLFD metadata
represents the 75dpi/14pt Xws branch, while its 8×15 glyph raster is
independently verified 195/195 identical to the extracted 100dpi `terminal10`
artifact. KEK-specific graphics and X-server startup evidence remains unknown.

## Public X Consortium artifact

Bundled file:
`assets/fonts/dec-terminal/dec-terminal-xconsortium-verified.bdf`

Pinned public source:
`https://sources.debian.org/data/main/x/xfonts-75dpi/1%3A1.0.3/font-bitstream-75dpi/term14.bdf`

Published/bundled identity:

- XLFD: `-DEC-Terminal-Medium-R-Normal--14-140-75-75-C-80-ISO8859-1`
- product: `DECterm Fonts V2.2, 11-Nov-1991`
- glyphs: 195
- bytes: 22,065
- lines: 2,952
- SHA-256: `b93ab33ead159d11a4e503ab71c72b7b51802a35de27d5a326ab4648f448f081`

The bundled BDF is byte-for-byte identical to the pinned public Debian artifact,
not merely a visually similar or locally normalized substitute.

## Full 195-glyph equivalence result

The ULTRIX PCF→BDF reconstruction stores glyphs in the complete 8×15 terminal
cell, whereas the public BDF stores each glyph in its minimal occupied BBX. The
comparison therefore converts set bits to baseline-relative `(x,y)` positions,
removes blank padding, and orders glyphs by `ENCODING`.

Results:

- ASCII encodings 32–126: **95 / 95 exact**
- complete encoded set: **195 / 195 exact**

As an independent whole-file check, rebuilding the public BDF representation
from the normalized ULTRIX glyphs produces 22,065 bytes / 2,952 lines and the
same SHA-256 `b93ab33ead159d11a4e503ab71c72b7b51802a35de27d5a326ab4648f448f081`. The previously observed three-byte difference was solely
one trailing ASCII space on each of the three COMMENT-only license separator
lines.

Canonical 8×15 raster digests used by the existing runtime verifier remain:

- all 195 glyphs: `53bf93238adf6eac91e560c46815998aebc4ad40f6b5b16de4f6f22eb81ab236`
- ASCII 95: `518a5600502b02de61816b2de8f8e9695a645cbe7e0bdc7adb43bd77e79d84c7`

## Distribution model

The public BDF contains the DEC/X Consortium grant covering use, copying,
modification, publication, distribution, sublicensing and sale. The notice is
retained in the bundled BDF and mirrored in `LICENSES/DEC-X-CONSORTIUM.txt`.
This is a technical provenance record, not legal advice.

The GitHub Pages distribution therefore ships only the public BDF. The ULTRIX
font remains verification evidence represented by fingerprints and comparison
records.
