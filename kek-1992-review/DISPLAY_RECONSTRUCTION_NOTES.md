# KEK 1992 WWW — Display Reconstruction Notes

Updated: 2026-10-21 — v0.25 / Phase 6.5

## KEK local display candidate

Confirmed machine: **DECstation 5000/125**.

Current candidate stack:
- ULTRIX / ULTRIX Worksystem Software
- DECwindows + DECterm candidate
- 80×24 terminal grid
- verified glyph cell: 8×15, therefore text plane 640×360
- VRT19-class 1280×1024 monitor remains a strong display candidate, not an identified rear-label match
- graphics option and X server are **not yet identified**

## Phase 6.3 correction — do not collapse the graphics/server branch

Phase 6.2 correctly documented that `Xws` defaults to 75dpi, but it went too far
by promoting that server path to the KEK runtime-first candidate. Digital's
30-Dec-1991 price list contains both:

- `PM322-KN`: DECstation 5000/125 + PX 8-plane 2D + VRT19;
- `PM323-KN`: DECstation 5000/125 + PXG 8-plane 3D + VRT19.

The surviving machine's front label and VRT19-class appearance do not identify
which graphics option was installed.

ULTRIX/UWS 4.3 independently documents:
- `Xws` -> 75dpi font path by default;
- `Xwst3d` -> 100dpi font path by default;
- DECterm Little Font -> 14pt at 75dpi, 10pt at 100dpi.

Accordingly the reconstruction now stores **runtime branches**, not one runtime
default. The exact KEK branch remains unresolved until the graphics module or X
server startup line is recovered.

## Glyph result remains stable

- public 75dpi `term14.bdf`: Branch-A metadata match
- real ULTRIX 4.3 `UDWFONT15430/terminal10.pcf`: media-confirmed 100dpi reference
- normalized cell: 8×15
- all glyphs: 195/195
- printable ASCII: 95/95
- mismatches: 0

Therefore Phase 6.3 changes evidence semantics, not the displayed bitmap.

## Remaining evidence

Still unknown:
- exact TURBOchannel graphics option (PX/PXG/etc.)
- KEK `/etc/ttys` X server command line
- actual X server binary/process used for the local session
- `.Xdefaults` / session resources
- exact VRT19 submodel/rear label
- whether the Line Mode Browser was actually run inside DECterm locally

For field identification, see `emulator/docs/KEK_GRAPHICS_OPTION_IDENTIFICATION_JA.md`.


## Phase 6.4 — browser-visible behavior

- The February 1992 W3 terminal-client figure directly supports the prompt form `Return for more, Help or Quit:` and the ` ERROR CODES` / ` o ` presentation examples.
- The exact Line Mode Browser executable used on 1992-09-30 is still unresolved; the 1992-11-03 pages are maintained as a later documentation boundary, not relabeled as the KEK binary.
- Browser command-line `-source` (v1.2a+) and interactive `SOURCE <command>` (v1.3+) are separate features. Bare SOURCE does not redisplay current source.
- The KEK 80-column screen is a DECterm display candidate; the LMB command-line documentation itself gives 78/79/80 as system-dependent width defaults and page length 24.
- Modern offline/debug explanations are never painted inside the historical framebuffer. Missing destination bytes are reported only in the research UI outside it.


## Phase 6.5 — prompt evidence discipline

- September conservative prompt is now a directly-attested minimum: reference range, conditional `Return for more`, and `Help or Quit:`.
- `Back`, `Up`, and `Find <keywords>` are not painted in that mode until their exact 1992-09-30-or-earlier prompt wording/conditions are recovered.
- This does not claim those commands were absent; command capability and visible prompt advertisement are tracked separately.
- The 1992-11-03 reference mode remains available for later documented behavior.
