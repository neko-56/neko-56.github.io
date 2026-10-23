# Historical font reconstruction — v0.52

## Reconstruction rule

The project does not choose fonts by visual resemblance alone. Each display
profile follows the standard machine / OS / terminal environment that can be
documented for that profile. The exact per-user settings used on 30 September
1992 may still be unknown; that does not prevent reconstructing the documented
standard environment.

Where a historical bitmap source is available, glyphs are rendered into the
Canvas framebuffer as discrete pixels. Where only a documented standard font
name is known, the profile records that standard and does not silently claim an
unrelated fallback to be the exact historical raster.

## Machine / environment font matrix

| Profile | Historical basis | v0.52 rendering source | Status |
|---|---|---|---|
| KEK DECstation 5000/125 + DECterm | DECterm Fonts V2.2; 8×15 Terminal raster verified against ULTRIX 4.3 | pinned public DEC/X Consortium `term14.bdf`; SHA verified; direct bitmap Canvas rendering | **anchored** |
| CERN 2013 IBM RISC System/6000 reference | Meyrin reconstruction made from the IBM System/6000 display; 9×14 glyph design | pinned Meyrin web font, loaded automatically and rasterized to the emulated cell grid | **anchored reconstruction** |
| Sun-4 / X11 comparison | X11 sample implementation standard `fixed` bitmap family | pinned 6×13 X11 BDF; direct bitmap Canvas rendering | **standard environment** |
| NeXT + X11/xterm | X11 `fixed` family is the standard X11 baseline | same pinned X11 6×13 BDF | **standard environment** |
| NeXTSTEP Terminal.app | NeXT documentation records Ohlfs 10pt as the Terminal default | profile records Ohlfs 10pt; no unrelated font is labelled as exact Ohlfs | **standard setting known; exact redistributable raster not pinned** |
| IBM 3270-class comparison | x3270 includes its own 14pt 3270 bitmap for close IBM 3278/3279 display representation | complete local x3270 4.1ga10 `3270.bdf`; 431 glyphs, 9×14 / `3270cg`; SHA-256 + structure validated; STARTCHAR-name mapping; direct bitmap Canvas rendering | **anchored comparison source** |
| PRIAM VAX host | VAX host identity alone does not specify the attached terminal or its glyph generator | no fabricated “VAX font” | **terminal-dependent** |
| Morita 1992 terminal — hardware not identified | Line Mode Browser/browser class known; exact terminal hardware not established | neutral comparison surface only | **identity not asserted** |

## DEC / KEK

The DECterm path is the strongest historical glyph match in the project.
Contemporary DECwindows documentation supports 80×24 as a normal terminal
configuration and documents density-dependent DEC Terminal font selection.
The public DEC/X Consortium `term14.bdf` raster is verified 195/195 glyphs
identical to the ULTRIX 4.3 `terminal10.pcf` target after normalization.

The v0.49 “do not distribute/load the DEC font” rule was a regression and is
withdrawn. See `DEC_TERMINAL_PROVENANCE.md`.

## IBM RISC System/6000 / CERN 2013 reference

CERN's 2013 reconstruction team had an old IBM RISC System/6000/AIX machine
running the original Line Mode Browser. Meyrin reconstructed the terminal
glyphs from photographs/screenshots of that reference display. The published
design describes a 9×14 glyph grid. The Meyrin project carries an open font
license permitting reuse.

This is used as the **2013 IBM reference environment**. It is not used as proof
that Morita's personal 1992 terminal was an RS/6000.

## X11 `fixed`

For X11 comparison profiles, `fixed` is not a modern look-alike: the X11 sample
implementation includes the standard bitmap fixed family, with 6×13 as a
canonical member. The emulator therefore uses that bitmap source for the
Sun-4/X11 and NeXT/X11 comparison paths.

## NeXTSTEP native Terminal

The native NeXTSTEP Terminal path uses the documented standard setting
**Ohlfs 10pt** as its historical specification. The project does not claim that
Courier is the historical Ohlfs raster. Until a redistributable/pinnable Ohlfs
raster with sufficiently clear provenance is identified, the exact glyph raster
remains separate from the documented standard font selection.

## IBM 3270-class

The v0.52 comparison packages the complete x3270 4.1ga10
`x3270/3270.bdf` as `emulator/assets/fonts/ibm3270/3270.bdf`. The BDF identifies
itself as a 14-point 3270 font with a 9×14 bounding box, 431 glyphs,
`CHARSET_REGISTRY 3270cg`, and `CHARSET_ENCODING 1a`. The source encoding uses
3270 character-generator order, not normal ASCII/Unicode order, so the emulator
resolves ASCII characters by BDF `STARTCHAR` glyph names first.

Before activation, the runtime validates the packaged file's pinned SHA-256,
431-glyph count, 9×14 cell, `3270cg` / `1a` charset metadata, and complete
printable-ASCII coverage. The runtime path is local and performs no network
font fetch. If the asset cannot be loaded or validated, the 3270 framebuffer is
left blank and the error is reported; it does not silently fall back to Courier.

## VAX host distinction

A VAX is a host/computer family, not a unique display terminal. The connected
terminal may have been a DEC VT-series device or another terminal. Assigning a
single “VAX font” solely from the host name would invent evidence, so the VAX
profile deliberately keeps host identity and terminal glyph identity separate.
