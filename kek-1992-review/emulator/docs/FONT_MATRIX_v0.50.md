# v0.50 font status matrix

This file is the implementation checklist for historical glyph sources.

| ID | Environment | Source | License/provenance decision | Runtime |
|---|---|---|---|---|
| `xconsortium_terminal_v22_verified` | DECterm / KEK | DEC/X Consortium `term14.bdf`, verified against ULTRIX Terminal V2.2 raster | redistribution grant confirmed; 195/195 glyph equivalence | automatic BDF load + 1-bit Canvas |
| `meyrin_cern_rs6000` | IBM RISC System/6000 CERN 2013 reference | Meyrin | open font license; reconstructed from IBM System/6000 display | automatic web-font load, then emulator rasterization |
| `x11_fixed_6x13` | X11 fixed baseline | X11 sample implementation 6×13 BDF | standard X11 bitmap source | automatic BDF load + 1-bit Canvas |
| — | NeXTSTEP Terminal.app | Ohlfs 10pt standard default | standard selection documented; exact original raster not pinned for redistribution | specification recorded; exact-raster status shown separately |
| — | IBM 3270-class | 3270font/x3270 lineage | lineage and reusable project license documented; canonical single-file runtime pin still pending | not auto-loaded yet |
| — | PRIAM VAX | attached terminal-dependent | host identity is insufficient to select glyphs | no fabricated host font |

Rule: a successful runtime historical-font load must report its source and
provenance in the emulator detail panel. A browser fallback must never be
described as the exact historical raster.
