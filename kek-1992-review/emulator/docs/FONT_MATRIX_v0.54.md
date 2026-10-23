# v0.54 font status matrix

This file is the implementation checklist for historical glyph sources after
local asset packaging. Runtime font fetches are package-local; `publicSource`
fields are provenance metadata only.

| ID | Environment | Bundled asset | Verification | Runtime |
|---|---|---|---|---|
| `xconsortium_terminal_v22_verified` | DECterm / KEK | `assets/fonts/dec/term14.bdf` | SHA-256 `d9daba...5887ae7`; 195 glyphs; normalized raster 195/195 and ASCII 95/95 match the ULTRIX target | local BDF + 1-bit Canvas |
| `meyrin_cern_rs6000` | IBM RISC System/6000 CERN 2013 reference | `assets/fonts/meyrin/Meyrin.woff` (+ TTF and OFL text) | SHA-256 `a669b20a...4d94cc1`; SIL OFL 1.1 | local WOFF, then hard-rasterized to emulator cell |
| `x11_fixed_6x13` | X11 fixed baseline | `assets/fonts/x11/6x13.bdf` | SHA-256 `c68c55ca...73efc9b`; 4121 glyphs; 6×13 | local BDF + 1-bit Canvas |
| `x3270_3270_14` | IBM 3270-class comparison | `assets/fonts/ibm3270/3270.bdf` | SHA-256 `3d71ea77...d34838b`; 431 glyphs; 9×14; `3270cg/1a` | local BDF + STARTCHAR mapping + 1-bit Canvas |
| — | NeXTSTEP Terminal.app | original Ohlfs bytes are **not** bundled | NeXT docs confirm Ohlfs as fixed-width screen font; CERN 2019 confirms pixel-traced reconstruction methodology | native profile is not certified as exact-raster until a project-owned/redistributable reconstruction asset is pinned |
| — | PRIAM VAX 8530 host | terminal-dependent | host is identified, display terminal is not | no invented VAX font; visible comparison plane uses X11 fixed only as an explicitly neutral comparison raster |

## Fail-closed rule

Profiles with an anchored asset do not silently fall back to Courier or another
system font when the package-local asset fails validation. The framebuffer is
left without historical text and the inspector reports the asset error.

## NeXT native exception

The project decision remains: do not redistribute the original Ohlfs font;
use a separately reconstructed font. CERN's 2019 reconstruction demonstrates a
sound method (capture all glyphs from a real NeXT, trace the bitmap pixels, then
export a modern font). The public CERN recreation's font-file redistribution
terms are not explicit enough for this package, so v0.54 does not copy those
third-party font bytes and does not label Courier/X11 fixed as Ohlfs.
