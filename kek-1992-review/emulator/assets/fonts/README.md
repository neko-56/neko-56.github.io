# Packaged emulator fonts — v0.54

All runtime font files listed here are package-local. External URLs in research
documents or `publicSource` metadata are provenance references, not runtime
font fetches.

| Environment | File | SHA-256 | License / status |
|---|---|---|---|
| DECterm | `dec/term14.bdf` | `d9daba2437558c3a75bfba33b8fb21a78063e4f42bede5d61a53c9a4d5887ae7` | DEC / X Consortium grant; see `../../LICENSES/DEC-X-CONSORTIUM.txt` |
| X11 fixed | `x11/6x13.bdf` | `c68c55ca8effcdc2714fffa9c8e07df290411867b00b547eeae952f7473efc9b` | BDF COPYRIGHT property states public domain; see `../../LICENSES/X11-FIXED-6X13-PUBLIC-DOMAIN.txt` |
| CERN IBM RS/6000 reconstruction | `meyrin/Meyrin.woff` | `a669b20af5d7c00eac496012cda61150b39a5b7fb6cb16f0c6a8383504d94cc1` | SIL OFL 1.1; `meyrin/License.md` |
| CERN IBM RS/6000 reconstruction | `meyrin/Meyrin.ttf` | `fddf38d0cf25b9e0fd2c2dce2db81a0dd8ccd80067ed191b43517a5e31be5780` | SIL OFL 1.1; `meyrin/License.md` |
| IBM 3270-class | `ibm3270/3270.bdf` | `3d71ea77ade51a7d2d6de326bd98fd14724b0e0086ecc0bd2d5083483d34838b` | x3270/GTRC permissive grant; see `../../LICENSES/X3270-3270-BDF.txt` |

## NeXTSTEP Ohlfs

The original NeXT Ohlfs font is not included. The project uses a separate
reconstruction track rather than redistributing original bytes or silently
calling Courier/X11 fixed "Ohlfs". CERN's 2019 pixel-tracing recreation is a
methodological reference, but this package does not copy third-party recreated
font bytes without explicit redistribution provenance.
