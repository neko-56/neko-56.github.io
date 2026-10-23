# v0.51 font status matrix

This file is the implementation checklist for historical glyph sources.

| ID | Environment | Source | License/provenance decision | Runtime |
|---|---|---|---|---|
| `xconsortium_terminal_v22_verified` | DECterm / KEK | DEC/X Consortium `term14.bdf`, verified against ULTRIX Terminal V2.2 raster | redistribution grant confirmed; 195/195 glyph equivalence | automatic BDF load + 1-bit Canvas |
| `meyrin_cern_rs6000` | IBM RISC System/6000 CERN 2013 reference | Meyrin | open font license; reconstructed from IBM System/6000 display | automatic web-font load, then emulator rasterization |
| `x11_fixed_6x13` | X11 fixed baseline | X11 sample implementation 6×13 BDF | standard X11 bitmap source | automatic BDF load + 1-bit Canvas |
| — | NeXTSTEP Terminal.app | Ohlfs 10pt standard default | standard selection documented; exact original raster not pinned for redistribution | specification recorded; exact-raster status shown separately |
| `x3270_3270_14` | IBM 3270-class | x3270 4.1ga10 `3270.bdf` | upstream BDF header carries permissive redistribution/use grant; 9×14, 431 glyphs, `3270cg` ordering | automatic BDF load + structural validation + STARTCHAR-name mapping + 1-bit Canvas |
| — | PRIAM VAX | attached terminal-dependent | host identity is insufficient to select glyphs | no fabricated host font |

Rule: a successful runtime historical-font load must report its source and
provenance in the emulator detail panel. A browser fallback must never be
described as the exact historical raster.
