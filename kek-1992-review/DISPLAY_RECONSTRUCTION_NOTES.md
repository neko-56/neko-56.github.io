# KEK 1992 WWW — Display Reconstruction Notes

Updated: 2026-10-20

## CERN VIEW

### Current primary candidate
- Location: CERN shared terminal room
- Browser: Line Mode Browser
- Display environment: IBM 3270-class fixed-size terminal/display candidate
- Baseline geometry: 24 rows × 80 columns
- Display: monochrome green CRT candidate
- Character cell: IBM 3278-class 7×9 matrix as a visual reference
- Confidence: medium-low

### Evidence
1. Youhei Morita's retrospective says that after lunch with Tim Berners-Lee he went to a CERN terminal room, logged into KEK over the network, created the HTML file, and placed it on the server.
2. A CERN staff retrospective describes early Line Mode Browser use on a “fixed size IBM 3270 display.”
3. CERN's 2013 reconstruction used an old IBM terminal as a visual/typeface reference.

### Unknowns
- Exact terminal manufacturer/model used by Morita
- Physical IBM 3270 vs terminal emulation
- Exact phosphor/color setting
- Exact ROM/display font

The HTML reconstruction must therefore label IBM 3270 as a candidate, not a confirmed identity.

## KEK LOCAL VIEW

### Current primary candidate
- Machine: DECstation 5000/125
- OS: ULTRIX / ULTRIX Worksystem Software
- Browser: Line Mode Browser (installation at KEK recorded on 1992-04-14)
- Monitor candidate: DEC VRT19-class 19-inch CRT, Sony GDM-1960/1961 OEM family candidate
- Raster: 1280 × 1024 (5:4)
- Terminal environment candidate: DECwindows + DECterm
- DECterm baseline: 80 columns × 24 rows
- Font reference: DEC Terminal fixed-width family, 14-point-class normal font
- Confidence: medium

### Unknowns
- Exact monitor model fitted to the surviving KEK machine
- Exact ULTRIX/UWS version
- Whether Line Mode Browser was run in DECterm, another terminal emulator, or console
- Actual foreground/background colors
- Exact window position and geometry

## Rendering policy
- Reconstruct historical HTML content and keyboard operation separately from hardware appearance.
- Where hardware is unconfirmed, label the display explicitly as a candidate.
- Do not silently substitute later screenshots for 1992 display evidence.
- Do not embed proprietary historical font files; reproduce metrics/appearance approximately and document the substitution.
