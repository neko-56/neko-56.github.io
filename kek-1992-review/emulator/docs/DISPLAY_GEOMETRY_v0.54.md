# v0.54 display geometry discipline

The emulator now keeps four different geometries separate:

1. physical monitor / CRT family,
2. logical framebuffer resolution,
3. terminal or application window rectangle inside that framebuffer,
4. character grid and glyph cell dimensions.

A terminal's 80×24 text plane must never be stretched to imply that it is the
physical monitor resolution.

## KEK DECstation 5000/125

- Display family used for the candidate: DEC VRT19-class.
- Documented raster: 1280×1024.
- The monitor frame is outside the Canvas and does not change framebuffer pixels.
- DECterm candidate glyph plane: 80×24 × 8×15 = 640×360 pixels.
- Exact KEK VRT19 rear-label sub-model and PX/PXG graphics option remain open evidence items.

## Sun-4 CERN candidate

- W3C history directly records `sun4` as a March 1991 LMB release platform.
- Sun's December 1988 price list contains 19-inch 1152×900 monochrome/color/grayscale configurations, alongside other resolutions.
- v0.54 therefore uses 1152×900 as a **period official configuration candidate**, not as a claim about the exact CERN desk monitor.
- The 80×24 X11 `fixed` 6×13 plane remains 480×312 inside that framebuffer.

## CERN PRIAM

- CERN documentation identifies PRIAM as DEC VAX 8530 / ULTRIX.
- A VAX 8530 is the host, not the CRT terminal.
- CERN's 1986 terminal recommendations name DMT2200 (mainly 80 columns) and Pericom MG200 Monterey (80/132 columns plus graphics), both VT220-compatible, as period candidates.
- v0.54 does not choose one without evidence from Morita's actual session and therefore does not invent a physical shell or a "VAX font".

## IBM 3270-class

- "3270" is a display/protocol family, not one unique monitor model.
- CERN used virtual / telnet 3270 paths as well as IBM-compatible access, so the 3270 comparison intentionally does not draw an IBM 3278 shell as if it were established hardware.
- The x3270 9×14 character generator is used only for the 3270 display-class comparison.

## NeXT

- MegaPixel Display family logical raster: 1120×832.
- CERN's 2019 reconstruction reports that the physical CRT pixels were wider than tall, but does not give a numeric pixel-aspect ratio suitable for this package.
- v0.54 therefore preserves 1120×832 square framebuffer pixels and records the non-square physical-pixel issue instead of inventing a stretch factor.

## Presentation previews

Review-page thumbnails no longer render a hard-coded 1000×650 iframe and then
scale it with CSS. Each embedded emulator owns its viewport and fits the native
framebuffer/monitor candidate using the same geometry code as the full view.

## Research references

- W3C history, March 1991 LMB platforms: https://www.w3.org/History.html
- CERN PRIAM host inventory (VAX 8530 / ULTRIX): CERN 1988 network/computer naming material.
- CERN Annual Report 1986, terminal selection: DMT2200 and Pericom MG200 Monterey.
- Sun Price List, December 1988: documented Sun monitor configurations including 19-inch 1152×900.
- DEC VRT19 service/user documentation: VRT19 family 1280×1024 display.
- CERN WorldWideWeb 30th anniversary typography notes: https://worldwideweb30.com/typography/
