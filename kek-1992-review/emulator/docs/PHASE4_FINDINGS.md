# Phase 4 findings — display scale and KEK DECterm font

Updated: 2026-10-20

## 1. Display-size rule

The emulator no longer shrinks the historical screen merely to keep modern
documentation visible beside it.

Default `Auto` behavior:
- never scale below 100%;
- enlarge to use available browser width, up to 175%;
- if the browser is narrower than the historical framebuffer, keep 100% and
  use horizontal scrolling;
- all research notes live below the historical screen and are reached by normal
  page scrolling;
- fullscreen display is available.

The Canvas backing store is generated at the selected presentation scale
multiplied by `devicePixelRatio`, so the default view is not a low-resolution
Canvas enlarged by CSS.

## 2. CRT sharpness

The viewed CRT image is not deliberately blurred.

Phase 4 has no phosphor blur, no CSS blur, and no default scanline overlay.
If photographic reproduction is needed later, camera-focus, exposure,
shutter/refresh interaction and moiré must be implemented as a separate
`photographed display` mode, not as a property of the CRT itself.

## 3. KEK / VRT19 font evidence — superseded by Phases 6.2 and 6.3

Phase 4 originally ranked the 100dpi/10pt DEC Terminal path first because a
VRT19-class 1280×1024 display is physically close to 95 dpi. Phase 6.2 added
server evidence: `Xws` defaults to 75dpi, while DECterm Little Font selects
14pt at 75dpi and 10pt at 100dpi.

Phase 6.3 then corrects the remaining overreach. Digital sold DECstation
5000/125 + VRT19 in both PX 2D (`PM322-KN`) and PXG 3D (`PM323-KN`)
configurations. ULTRIX/UWS documents `Xwst3d` as a 100dpi-default server. The
surviving KEK graphics option and exact X-server command are not identified, so
there is **no single runtime ranking yet**.

Current model:
1. Xws branch: 75dpi / 14pt Little Font;
2. Xwst3d branch (conditional): 100dpi / 10pt Little Font;
3. media-confirmed glyph reference: 100dpi/10pt `terminal10.pcf`.

The rendered glyphs do not need to change: normalized comparison already shows
that the public 75dpi `term14.bdf` and ULTRIX 100dpi `terminal10` have identical
8×15 rasters for all 195 encoded glyphs. Exact KEK graphics option,
`/etc/ttys`, and X resources remain unresolved.

## 4. CERN font status

The CERN 2013 Line Mode Browser mirror remains a reconstruction reference.
The separate Meyrin project states that its glyphs were rebuilt from
screenshots of characters produced on an IBM System/6000 keyboard/environment.

Meyrin is therefore useful for the 2013 reconstruction profile but is not
silently promoted to the font used by Morita on 1992-09-30.

## URLs

- CERN Line Mode Browser mirror:
  https://github.com/cern-hackdays/lmb
- Meyrin:
  https://github.com/optional-is/Meyrin
- DECterm guide (14-point / 10-point on 100 dpi; 24×80):
  https://device.report/m/594b9dc923c15c6f5f9d7456908f19ca2b9a37716764c7273e0732638e7b7963.pdf
- DECwindows Terminal font file listings:
  https://uprrp2.uprrp.edu/help?explode=yes&key=Sys_Files&title=VMS+Help
- Period DEC VRT19 / font discussion:
  https://decnotes.datacellar.net/showtopic.php?conf=1700&topic=1073753883&userno=1672
- VRT19 monitor characteristics:
  https://lastin.dti.supsi.ch/VET/monitor/DEC-VRT19/0045B-DEC-VRT19.pdf


## Phase 5 refinement

The KEK first candidate is now represented by the exact XLFD target:

`-DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1`

Expected character cell was provisional in Phase 5; Phase 6 real-media parsing supersedes it with **8×15 pixels**.

The emulator can verify a locally loaded BDF against this metadata and records
its SHA-256 for reproducibility. No font binary is bundled.
