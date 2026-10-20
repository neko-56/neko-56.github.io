# KEK Web Display Emulator v0.3 — Phase 3

Open `index.html` directly in a modern browser. No server is required.

## Main change from Phase 1

Phase 2 no longer treats “IBM 3270” as the primary CERN reconstruction. Research into the 2013 CERN recreation shows that the team had an old working **IBM RISC System/6000 running AIX with the original Line Mode Browser** and used that machine to recreate the terminal font and feel. That machine is now a separate reference profile, explicitly labelled as **2013 evidence, not an identification of Morita's 1992 terminal**.

The default CERN view is therefore hardware-agnostic: 80×24 Line Mode Browser on the unknown terminal Morita used.

KEK DECterm default display has also been corrected to dark text on a light background based on contemporary DECwindows documentation.

## Optional reference font

If Meyrin is installed on your computer, CERN reference profiles use it automatically. The ZIP does not contain the font file. Source/reference project:
https://github.com/optional-is/Meyrin

## Tests

Run:

```
node tests/test-core.js
```

See `docs/EVIDENCE.md` for fact / inference / unknown separation.


## Phase 3 additions

- local BDF bitmap-font loading;
- native integer-pixel glyph drawing, bypassing Canvas `fillText()` for BDF;
- local TTF/OTF/WOFF loading through `FontFace`;
- explicit DECterm candidates:
  `TERMINAL14.PCF` (75dpi path) and `TERMINAL10_100DPI.PCF` (100dpi path);
- PCF→BDF helper;
- conservative 1992-09-30 behavior mode separated from the 1992-11-03 documented-command mode;
- source-version policy correcting the tempting but incorrect assumption that
  `WWWLineMode_2.11/2.12` are the exact September 1992 source;
- source-archaeology analyzer for extracted `HTBrowse.c`, `GridText.c`,
  and `DefaultStyles.c`.

No historical font binaries are bundled.
