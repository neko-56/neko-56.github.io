# Phase 6 research sources

Checked: 2026-10-21

These sources support discovery and verification. They do **not** prove the exact KEK runtime configuration by themselves.

## DECwindows system-file inventory

OpenVMS system-file help explicitly lists `TERMINAL10_100DPI.PCF` in the DECwindows 100dpi font set, alongside other Terminal sizes and variants.

- https://uprrp2.uprrp.edu/help?explode=yes&key=Sys_Files&title=VMS+Help
- https://uprag.upr.edu/conan?explode=yes&key=Sys_Files&referer=&title=VMS+Help

Use: confirms that `TERMINAL10_100DPI.PCF` is a real DECwindows filename. It does not prove that ULTRIX 4.3 uses the same basename.

## ULTRIX 4.3 installation guide (August 1992)

The installation guide identifies `X11/DECwindows 100dpi Fonts` as subset `UDWFONT15430`.

- https://bitsavers.org/pdf/dec/vax/ultrix-32/4.3/AA-PBL0E-TE_Guide_to_Installing_ULTRIX_Aug92.pdf

Use: narrows the contemporary ULTRIX 4.3 media search to a specific setld subset.

## ULTRIX/UWS 4.3 release notes

The 4.3 release notes list `UDWFONT15430` at about 3773.710 KB and map it to `/usr/lib/X11/fonts/decwin/100dpi`. They also state that the X servers read PCF, compressed PCF and BDF fonts, and give a 100dpi DECterm Big Font resource example using a `bitstream-terminal` pattern.

- https://manuals.plus/m/ddc95817cc32b6836e87c0454e45f48b6679df4a2874f74b63df7ab13eb0b40a
- https://bitsavers.org/pdf/dec/vax/ultrix-32/4.3/AA-ME85H-TE_ULTRIX_and_UWS_V4.3_Release_Notes_Aug92.pdf

Use: establishes the install directory and prevents the provisional `DEC` foundry from being treated as stronger evidence than the actual media PCF metadata.

## setld/kits format

ULTRIX `setld -x` extracts subsets from disk/tape distributions. The `kits` utility produces one subset image per subset; the key-file format can request classic UNIX `compress` compression.

- https://www.typewritten.org/Manual/DEC/Ultrix/4.2/mips/man8/setld.html
- https://www.typewritten.org/Manual/DEC/Ultrix/4.0/mips/man1/kits.html
- https://www.typewritten.org/Manual/DEC/Ultrix/4.2/mips/man5/stl_key.html

Use: basis for reading `UDWFONT15430` as a potentially compressed tar-style setld subset without installing ULTRIX.

## PCF format

The bundled PCF reader follows the X11 PCF table structure: little-endian table directory, per-table byte order, compressed/uncompressed metrics, bitmap padding/bit order, BDF encodings, scalable widths and glyph names.

- https://fontforge.org/docs/techref/pcf-format.html

Use: implementation reference for dependency-free PCF→BDF reconstruction.

## XLFD average width

The X Logical Font Description specification defines `AVERAGE_WIDTH` in tenths of a pixel. Therefore an 8-pixel character-cell width is represented as `80`, not `8`.

- https://www.x.org/archive/X11R6.8.0/PDF/xlfd.pdf

Use: preserves `C-80` for the 8-pixel character-cell width. Real-media parsing later established the full cell as 8×15 (ascent 12 + descent 3).

## Archival media lead

The user currently has a file named `Ultrix_RISC_4.3_OS.iso`. The public archival collection previously used as a discovery lead is:

- https://archive.org/details/@dec-ultrix

Use: acquisition lead only for ULTRIX target verification. Proprietary ULTRIX-extracted binaries are not bundled; v0.20 uses a separately licensed X Consortium DEC Terminal raster for public rendering.


## Xws runtime font-density selection — Phase 6.2

`Xws` accepts `-fd 75|100` and `-dpi` server-density options. ULTRIX/UWS documentation identifies 75dpi as the normal Xws font path and documents `-fd 100 -dpi 100` when selecting the 100dpi path. DECterm/dxterm documents Little Font as the default font-set selection, with 14pt at 75dpi and 10pt at 100dpi.

- https://www.unix.com/man-page/ultrix/8x/xws
- https://www.typewritten.org/Manual/DEC/Digital_UNIX/3.2c/man1x/dxterm.html
- https://manuals.plus/m/ddc95817cc32b6836e87c0454e45f48b6679df4a2874f74b63df7ab13eb0b40a

Use: establishes the Xws branch behavior without changing the verified glyph raster. Phase 6.3 shows that this branch cannot yet be promoted to the KEK-machine default.


## Graphics/X-server branch — Phase 6.3

Digital's 30-Dec-1991 systems price list documents two DECstation 5000/125 +
VRT19 configurations relevant to the surviving KEK machine:

- `PM322-KN`: PX 8-plane 2D accelerator;
- `PM323-KN`: PXG 8-plane 3D accelerator.

- https://bitsavers.trailing-edge.com/pdf/dec/priceLists/US_Systems_Services_Price_List_Dec91.pdf

ULTRIX/UWS 4.3 states that `Xws` uses 75dpi fonts by default while `Xtx` and
`Xwst3d` use 100dpi fonts by default. The installation guide lists
`UDWSER430` as the B&W/Color/PX server and `UDWWSTSER430` as the X11R4 PXG
server.

- https://www.bitsavers.org/pdf/dec/vax/ultrix-32/4.3/AA-ME85H-TE_ULTRIX_and_UWS_V4.3_Release_Notes_Aug92.pdf
- https://manuals.plus/m/a9064b2728e398a36d08dd6d2866d7d95b15dd19abd5479e356876678260d085

DEC maintenance documentation provides `cnfg` examples that make physical
module identification practical: `PMAG-CA` reports PX 2D and `PMAG-DA` reports
PXG 3D.

- https://www.filibeto.org/dec/mds/mds-2000-01/cd2/DECSTA/370AAMG2.PDF

Use: prevents a server-specific default from being presented as the KEK
runtime default before the graphics option or `/etc/ttys` server command is
observed.
