# KEK Web Display Emulator v0.26 — Unified site navigation

Open `index.html` directly in a modern browser. No server is required.

## Main change from Phase 1

Phase 2 no longer treats “IBM 3270” as the primary CERN reconstruction. Research into the 2013 CERN recreation shows that the team had an old working **IBM RISC System/6000 running AIX with the original Line Mode Browser** and used that machine to recreate the terminal font and feel. That machine is now a separate reference profile, explicitly labelled as **2013 evidence, not an identification of Morita's 1992 terminal**.

The default CERN view is therefore hardware-agnostic: 80×24 Line Mode Browser on the unknown terminal Morita used.

The earlier dark-text-on-light statement is superseded by Phase 6.1. The documented `dxterm` resource default is light-on-dark, while contemporary `.Xdefaults` examples demonstrate that users could override `screenMode` and enable a vertical scrollbar. The exact KEK 1992 resource settings therefore remain unknown.

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


## Phase 3.1 correction

- removed `KEK Entry Point` from the emulated output;
- removed research/machine labels from inside the historical framebuffer;
- historical screen now occupies the main width; specification/evidence moved below;
- high-DPI Canvas backing store added for Retina;
- default phosphor blur/scanlines disabled;
- CRT effects are optional;
- Fit / 100% display switch added;
- historical screen content and research annotations are now strictly separated.

See `docs/DISPLAY_DISCIPLINE.md`.


## Phase 4 additions

- historical screen is full-width and is never auto-shrunk below 100%;
- automatic enlargement uses the available browser width;
- narrow browser windows use horizontal scrolling rather than shrinking;
- explanatory material is below the screen and reached by page scrolling;
- fullscreen historical display;
- reconstructed framebuffer backing store remains at native logical resolution; presentation zoom is a separate nearest-neighbor layer;
- no CRT blur/glow in the normal viewed-display mode;
- removed unverified `KEK Entry Point` from the historical HTML fixture itself;
- Phase 4 historical hypothesis (superseded by Phase 6.2):
  `TERMINAL10_100DPI.PCF` was initially ranked first from physical display DPI; Phase 6.2 established the Xws 75dpi server default, and Phase 6.3 further corrects the KEK-machine ranking because the surviving graphics/X-server branch is unresolved.

See `docs/PHASE4_FINDINGS.md`.


## Phase 5 additions

- Phase 5 historical verification target (now treated as the media-confirmed glyph target, not the runtime default):
  `-DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1`;
- provisional 8×14 metric assumption (superseded by Phase 6 real-media result);
- BDF XLFD parser and candidate classifier;
- SHA-256 fingerprint of locally loaded fonts;
- exact/near/partial metadata-match report;
- standalone `tools/inspect_bdf.py` verifier;
- 75dpi 14pt and 100dpi Big Font control targets.

No ULTRIX-extracted target binary is bundled. v0.20 does bundle the separately licensed X Consortium DEC Terminal V2.2 raster used by the public KEK profile.


## Phase 6 additions

- real-media verification confirms `terminal10.pcf` in ULTRIX 4.3 `UDWFONT15430` with exact target XLFD, 8×15 metrics, ascent 12/descent 3;
- historical bitmap acceptance gate now includes exact metadata, 8×15 parsed metrics, ASCII coverage and the verified reconstructed-BDF SHA-256;
- BDF pixels render 1:1 into the reconstructed framebuffer; presentation zoom no longer changes historical glyph geometry;
- explicit `HISTORICAL BITMAP ACTIVE` state only after an exact verified match;
- ULTRIX 4.3 100dpi media target recorded as `UDWFONT15430` (`UDWFONT15450` for 4.5);
- `tools/find_dec_terminal_font.py` inventories mounted/extracted ULTRIX/DECwindows media and now prioritizes the exact Normal/ISO8859-1 target over Wide/DECtech variants;
- the ULTRIX-extracted target binary is not bundled; the separately licensed X Consortium DEC Terminal V2.2 raster is bundled for GitHub Pages rendering.

See `docs/PHASE6_REAL_FONT.md`.


## Phase 6 sharp-display correction (v0.8)

Phase 6 originally removed explicit glow from the new renderer but still allowed arbitrary fractional auto scaling and browser-antialiased fallback `fillText()`. The corrected renderer keeps the canvas backing store at the native reconstructed framebuffer, presents it with nearest-neighbor scaling, quantizes auto enlargement to 25% steps, and converts fallback glyphs to hard 1-bit logical pixels. See `docs/SHARP_DISPLAY_FIX.md`.

## Phase 6 media extraction update (v0.9)

The ULTRIX 4.3 path is executable rather than documentary only. `tools/extract_ultrix_dec_terminal.command` accepts `Ultrix_RISC_4.3_OS.iso`, reads classic UFS directly when needed, locates `UDWFONT15430`, extracts the DECwindows 100dpi Terminal files, converts PCF without external `pcf2bdf`, and writes a provenance/hash/XLFD/metrics report. The supplied media confirmed `terminal10.pcf` as DEC foundry, Normal setwidth, ISO8859-1. See `docs/PHASE6_ULTRIX_MEDIA_PIPELINE.md`.


## v0.20 GitHub Pages licensed raster

The KEK profile now auto-loads `assets/fonts/dec-terminal/dec-terminal-xconsortium-verified.bdf`; visitors do not select a local font. The historical target remains the independently verified ULTRIX 4.3 `UDWFONT15430/terminal10.pcf`. The served BDF is the pinned public DEC/X Consortium DEC Terminal V2.2 `term14.bdf` artifact itself (22,065 bytes; SHA-256 `b93ab33ead159d11a4e503ab71c72b7b51802a35de27d5a326ab4648f448f081`). Normalization to the common 8x15 cell verifies 195/195 encoded glyphs and ASCII 95/95 against the historical target. The renderer continues to draw BDF bits directly, so keyboard interaction and page changes do not fall back to browser text rendering.

See `LICENSES/DEC-X-CONSORTIUM.txt`, `docs/DEC_TERMINAL_PROVENANCE.md`, and `evidence/DEC_TERMINAL_GLYPH_EQUIVALENCE.json`.


## v0.21 Phase 6.1 DECterm chrome evidence

The historical text plane is now treated as a fixed, verified raster object: **80 columns × 24 rows × 8×15 pixels = 640×360 pixels**. Window-manager decoration is drawn outside that rectangle and cannot alter glyph metrics or bitmap pixels.

The KEK candidate profile adds a DECwindows/dxwm-style frame using documented contemporaneous structure: shrink-to-icon control, title bar, push-to-back control, and resize control. The DECterm menu bar uses the documented menu names `File`, `Edit`, `Commands`, `Options`, `Print`, and `Help`. Chrome geometry, exact colors, and title typography are reconstruction parameters, not claimed KEK-specific measurements.

The default screen mode in the profile is now `light_on_dark`, matching the documented `dxterm` default. `scrollVertical` is off by default. Both could be changed by X resources, so the emulator exposes dark-on-light for inspection and marks the KEK-specific setting unresolved rather than silently treating a configurable default as historical fact.

The UI chrome text itself is thresholded to hard logical pixels before compositing. The terminal glyph path remains the verified bundled BDF rendered at scale 1; browser anti-aliasing, CRT blur, and fractional historical raster scaling are not used.

See `docs/PHASE6_1_DECTERM_CHROME.md` for the evidence boundary and source list.


## v0.22 Phase 6.2 Xws font-selection evidence

Phase 6.2 separated **server-specific font selection** from **verified glyph identity**. For `Xws`, the documented default path is 75dpi. DECterm Little Font
selects 14pt there; 100dpi/10pt requires an explicit server-density selection
such as `-fd 100 -dpi 100`.  The real ULTRIX 100dpi `terminal10.pcf` remains
the media-confirmed raster reference.

The bundled public `term14.bdf` is especially useful because its metadata
exactly matches the documented 75dpi/14pt default path while its normalized
8×15 raster is already verified 195/195 identical to the extracted 100dpi
ULTRIX artifact.  Thus the historical ranking changes without changing the
public bitmap.

`tools/extract_ultrix_dec_terminal_density_pair.py` and the macOS wrapper
`../Extract_ULTRIX_DEC_Terminal_75_100.command` now extract `UDWFONT430` and
`UDWFONT15430` from the same local medium and perform a three-way comparison.

See `docs/PHASE6_2_FONT_SELECTION.md`.


## v0.23 Phase 6.3 graphics/X-server branch evidence

Phase 6.3 removes the remaining overclaim in v0.22. A DECstation 5000/125 with
a VRT19 could be sold with PX 2D (`PM322-KN`) or PXG 3D (`PM323-KN`)
graphics. Because the KEK graphics option has not been identified, the profile
no longer has a single `runtimeDefaultFontId`. It stores two documented server
branches instead:

- Xws branch: 75dpi, DECterm Little Font 14pt;
- Xwst3d branch: 100dpi, DECterm Little Font 10pt. PXG hardware makes a 3D-server path relevant, but the exact KEK server binary is still unknown.

The current public raster is unchanged: its 75dpi metadata fits the Xws branch
and its normalized 8×15 glyphs match the media-confirmed 100dpi terminal10
reference 195/195.

See `docs/PHASE6_3_GRAPHICS_SERVER_BRANCH.md` and
`docs/KEK_GRAPHICS_OPTION_IDENTIFICATION_JA.md`.


## v0.24 Phase 6.4 1992 Line Mode Browser behavior bounds

Phase 6.4 tightens the part of the reconstruction that is actually visible inside the terminal. A contemporaneous 1992 W3 paper includes a terminal-client example with the prompt `1-9, Return for more, Help or Quit:` and shows `<H1>Error Codes</H1>` as ` ERROR CODES`, anchors followed immediately by numeric references, and unordered-list items with an ` o ` marker. The conservative September profile now follows those directly attested presentation conventions where applicable.

The source command model is also corrected. The preserved command-line documentation marks `-source` as available from v1.2a; the preserved interactive `SOURCE` documentation calls it a command prefix available from v1.3 and explicitly says bare `SOURCE` does not display the source of the current loaded document. The September profile therefore does not promote interactive SOURCE as established behavior, while the November reference profile preserves the documented prefix semantics.

The 80-column KEK display remains a DECterm candidate, not a universal LMB software default: the preserved command-line page gives a default width of 78, 79, or 80 depending on system, and page length 24. Exact `-p24` interaction with a physical 24-row terminal remains executable-level evidence still to recover.

Finally, missing remote targets no longer generate synthetic pages containing modern phrases such as "offline reconstruction" inside the historical framebuffer. The engine accepts an optional document resolver; if bytes are unavailable it leaves the historical screen untouched and publishes a structured `pendingNavigation` record for the research UI below the framebuffer.

See `docs/PHASE6_4_LMB_1992_BEHAVIOR.md`, `docs/SOURCE_VERSION_POLICY.md`, and `evidence/LMB_1992_BEHAVIOR_BOUNDS.json`.


## v0.25 Phase 6.5 September prompt evidence discipline

The conservative September profile no longer advertises prompt tokens merely because later Line Mode Browser documentation shows that the corresponding navigation commands existed. The 1992-02-18 W3 terminal-client figure directly attests three prompt token classes: a numeric reference range, `Return for more` when pagination applies, and the closing `Help or Quit:`. Those are now the only prompt token classes emitted by `sep1992_conservative`.

`Back`, `Up`, and `Find <keywords>` remain useful commands/reference concepts, but their exact prompt wording and display conditions on 1992-09-30 have not been recovered. They are therefore omitted from the September framebuffer. Omission is an evidence boundary, not a claim that the commands were absent. The separate `nov1992_documented` profile continues to expose the later documented/reference prompt model.

The current W3 preservation inventories already audited do not expose a version-1 Line Mode source tarball, and targeted public searches did not identify an exact 1.1/1.2/1.2f/1.3 source archive. This is non-exhaustive and is not treated as proof of global loss.

See `docs/PHASE6_5_PROMPT_EVIDENCE_DISCIPLINE.md` and `evidence/LMB_1992_BEHAVIOR_BOUNDS.json`.


## v0.26 site navigation

The research-site wrapper now uses one navigation pattern across all display models. `← 表示モデル一覧へ戻る` is the primary action on every model/detail page, model-to-model switching is grouped together, and documentation links are visually separated. This change does not modify the historical framebuffer or Line Mode Browser behavior.
