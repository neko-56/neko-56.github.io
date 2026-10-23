# Phase 6.3 — DECstation graphics / X-server branch model

Updated: 2026-10-21

## Why Phase 6.2 required another correction

Phase 6.2 correctly established two server facts:

- `Xws` uses the 75dpi font path by default;
- `Xwst3d` uses the 100dpi font path by default.

However, Phase 6.2 then promoted the `Xws`/75dpi path to the KEK runtime-first
candidate solely from the machine being a DECstation 5000/125. That inference is
too strong because the surviving machine's graphics option has not yet been
identified.

## Contemporary hardware branch

Digital's 30-Dec-1991 systems price list contains both of the following
DECstation 5000/125 + VRT19 configurations:

- `PM322-KN`: DECstation 5000/125, 16MB, **8-plane 2D accelerator (PX)**,
  VRT19 19-inch color Sony monitor;
- `PM323-KN`: DECstation 5000/125, 16MB, **8-plane 3D accelerator (PXG)**,
  VRT19 19-inch color Sony monitor.

Therefore the observed front-panel model `DECstation 5000/125` plus a
VRT19-class display cannot determine the graphics stack.

## Contemporary server/font branch

ULTRIX/UWS 4.3 release notes state:

- `Xws` uses 75dpi fonts by default;
- `Xtx` and `Xwst3d` use 100dpi fonts by default;
- an `Xws` session can be explicitly moved to the 100dpi path by editing the
  X-server command in `/etc/ttys` and selecting `-fd 100 -dpi 100`.

The ULTRIX 4.3 installation guide separately identifies:

- `UDWSER430` — B&W, Color, or PX server;
- `UDWWSTSER430` — X11R4 PXG server;
- `UDWFONT430` — X11/DECwindows 75dpi fonts;
- `UDWFONT15430` — X11/DECwindows 100dpi fonts.

This is enough to establish **multiple historically valid branches**, but not
enough to assert which server binary the KEK 5000/125 actually ran.

## DECterm Little Font consequence

DECterm/dxterm documents Little Font as the default font-set selection. Its
point size changes with display/font density:

- 75dpi -> 14pt Terminal font;
- 100dpi -> 10pt Terminal font.

The reconstruction therefore models two runtime branches:

| Branch | Server evidence | Default density | DECterm Little Font | Target |
| --- | --- | ---: | ---: | --- |
| A | `Xws` | 75dpi | 14pt | `kek_75dpi_normal` |
| B | PXG 3D server / `Xwst3d` family | 100dpi | 10pt | `kek_vrt19_100dpi_little` |

Branch B is deliberately worded as a server-family branch. The exact KEK
5000/125 `/etc/ttys` command has not been recovered, so this document does not
claim that the machine definitely ran a particular `Xwst3d` executable.

## Why the displayed glyphs do not change

The public 75dpi `term14.bdf` has metadata matching Branch A. The real ULTRIX
4.3 `UDWFONT15430/terminal10.pcf` supplies the media-confirmed Branch B glyph
reference. After normalization to the common 8x15 cell, they match:

- all encoded glyphs: **195/195**;
- printable ASCII: **95/95**;
- mismatch count: **0**.

Thus Phase 6.3 changes the evidence model, not the current bitmap pixels.

## What identifies the real branch

### Best case: bootable surviving machine

1. At the console, inspect the TURBOchannel configuration with `cnfg`.
   Contemporary DEC maintenance documentation shows examples:
   - `PMAG-CA` -> `PX -- D=8` (2D PX);
   - `PMAG-DA` -> `PXG -- D=8, z=24` (3D PXG).
2. Inspect `/etc/ttys` for the X-server startup command.
3. While DECwindows is running, record the running server process and font path.
4. Query X resources for DECterm font/screen resources.

The commands in items 2-4 are a diagnostic procedure for the surviving system;
they are not themselves evidence of what was configured in 1992 until their
output is captured.

### If the machine cannot boot

Photograph:

- TURBOchannel graphics option labels/part numbers;
- monitor rear label and model suffix;
- any surviving disk labels/configuration notes.

The graphics option alone narrows the server family substantially; the actual
`/etc/ttys` line is stronger evidence for the runtime path.

## Evidence status after Phase 6.3

- Machine model `DECstation 5000/125`: **confirmed**.
- VRT19-class monitor: **strong candidate; rear label not confirmed**.
- PX vs PXG graphics option: **unknown**.
- Exact KEK X server command: **unknown**.
- Xws 75dpi default: **documented**.
- Xwst3d 100dpi default: **documented**.
- ULTRIX 100dpi/10pt Terminal glyph artifact: **media-confirmed**.
- Public 75dpi/14pt raster equivalence to media target: **195/195 verified**.
- KEK runtime 75dpi vs 100dpi: **unresolved**.

## Sources

- Digital systems price list, 30-Dec-1991, DECstation 5000 packages:
  https://bitsavers.trailing-edge.com/pdf/dec/priceLists/US_Systems_Services_Price_List_Dec91.pdf
- ULTRIX/UWS 4.3 Release Notes:
  https://www.bitsavers.org/pdf/dec/vax/ultrix-32/4.3/AA-ME85H-TE_ULTRIX_and_UWS_V4.3_Release_Notes_Aug92.pdf
- Guide to Installing ULTRIX, Aug 1992:
  https://manuals.plus/m/a9064b2728e398a36d08dd6d2866d7d95b15dd19abd5479e356876678260d085
- DECstation 5000 maintenance/console command documentation (graphics `cnfg` examples):
  https://www.filibeto.org/dec/mds/mds-2000-01/cd2/DECSTA/370AAMG2.PDF
