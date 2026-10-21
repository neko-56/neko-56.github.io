# Historical font reconstruction — Phase 3

## CERN

### Morita 1992 terminal
Exact hardware and exact glyph ROM/font are unknown.

### IBM RISC System/6000 reference
CERN's 2013 reconstruction team had an old IBM RISC System/6000/AIX machine
running the original Line Mode Browser. The Meyrin project reconstructed
glyphs by outputting available IBM System/6000 keyboard characters, taking
screenshots and redrawing the glyphs.

Meyrin is therefore a strong **2013 reconstruction reference**, not proof of
the font on Morita's 1992 terminal.

The emulator can load a user-owned/local Meyrin TTF/OTF/WOFF file through
the browser. No font binary is bundled.

## KEK / DECterm

Contemporary DECwindows documentation supports:

- default terminal size: 24 rows × 80 columns;
- Normal Font for 80 columns;
- default block cursor;
- dark text / light background in 1988/1989 DECwindows documentation;
- normally 14-point on 75dpi systems;
- normally 10-point on 100dpi systems in the 1989/UWS documentation.

DECwindows installations contain Terminal bitmap font families. Later
DECwindows file listings preserve names such as:

- `TERMINAL14.PCF`
- `TERMINAL10_100DPI.PCF`
- corresponding bold, narrow, wide and DECTECH variants.

These filenames and contemporary DECterm behavior make the Terminal bitmap
family substantially better grounded than Courier. However, the exact DPI,
font file and graphics option used by the KEK machine are not yet known.

## Bitmap path implemented in Phase 3

The browser now accepts BDF files and draws each glyph bitmap directly to
Canvas at integer pixel scale. This bypasses browser font antialiasing.

For a DEC PCF font:

1. obtain the PCF from a lawful local/archival source;
2. convert PCF → BDF on the user's own machine;
3. load the BDF in the emulator;
4. record the filename/hash in the research log.

`tools/pcf_to_bdf.command` automates step 2 when `pcf2bdf` is installed.

No historical font binaries are distributed in this project.
