KEK 1992 WWW — review reconstruction v0.52

CURRENT STRUCTURE (v0.52)
-------------------------
Top-level reviewer navigation is intentionally limited to three pillars:
1. review.html     — 森田様への質問
2. emulation.html  — 各種機種での再現エミュレート
3. research.html   — 各種資料

Historical display policy:
- Reconstruct machine/OS/terminal/browser behavior from period standard specifications and surviving evidence.
- Do not use modern CSS mockups as substitutes for terminal emulation.
- Historical bitmap glyph sources are rendered into the Canvas framebuffer as discrete pixels.
- Individual 1992 user settings are not invented when the surviving evidence does not identify them.
- The old v0.49 rule that treated the verified DEC/X Consortium font as non-distributable is withdrawn; the license grant permits use/copy/modify/publish/distribute/sublicense/sell. Runtime uses the pinned public source.

Current machine/font mapping:
- KEK DECterm: verified DEC Terminal V2.2 8x15 raster; 195/195 normalized glyph match to the ULTRIX 4.3 target.
- IBM RISC System/6000 reference: Meyrin CERN reconstruction, OFL-1.1; loaded as the anchored profile source.
- Sun-4 / NeXT X11: standard X11 fixed 6x13 bitmap.
- NeXTSTEP Terminal.app: standard Ohlfs 10pt setting is documented; exact original Ohlfs raster is not falsely substituted.
- IBM 3270-class: the package includes emulator/assets/fonts/ibm3270/3270.bdf, the complete x3270 4.1ga10 14pt 3270.bdf with all 431 glyphs. The local asset is 9x14 / 3270cg, is SHA-256 pinned and validated before use, and ASCII LMB text is mapped by STARTCHAR glyph names because the source BDF uses 3270 character-generator order rather than ASCII code-point order. No network fetch or Courier/system-font fallback is used for this profile.
- PRIAM VAX: host identity alone does not identify the attached terminal font, so no fabricated “VAX font” is assigned.

See emulator/docs/FONT_RECONSTRUCTION.md and emulator/docs/FONT_MATRIX_v0.52.md.

KEK 1992 reconstruction — v0.27 unified model-page layout

KEK 1992 WWW — review reconstruction

Upload the entire `kek-1992-review` folder to the root of the GitHub Pages repository.

Expected URL after upload:
https://neko-56.github.io/kek-1992-review/

Files:
- index.html              research/review landing page
- cern-view.html          provisional CERN-side terminal rendering
- kek-2002-view.html      rendering based on later KEK reconstruction imagery
- kek-local.html          intentionally unresolved until confirmation
- original-source.html    reconstructed historical HTML source
- references.html         source materials and official/public links
- link-status.html        link verification status and methodology
- LINK_AUDIT.md           dated human-readable audit record
- link-audit.json         machine-readable audit summary
- style.css
- model-layout.css       shared layout for all four display-model pages
- terminal.js

Privacy/discoverability:
- all HTML pages include noindex,nofollow,noarchive
- do NOT link this folder from the public NEKO56 top page
- this is not access control: anyone who knows the URL can view it

Historical source reconstruction:
The HTML shown in original-source.html is based on the preserved KEK Entry Point
reconstruction and later quoted source. It should be described as a reconstruction,
not as a guaranteed byte-for-byte copy of the 1992 file.

Update v0.2:
- added explicit number + RETURN operation note
- added references.html with source links and evidence notes

Update v0.3:
- added Yohei Morita lecture video (YouTube) to source materials
- distinguishes personal retrospective testimony from contemporaneous documents

Update v0.4:
- treats KEK 2002 official article as confirmation that Morita worked from the CERN terminal room
- separates that confirmed fact from still-unknown terminal/browser/display details
- updates source notes and question wording accordingly

Update v0.5:
- added dated link audit (2026-10-20)
- distinguishes 404 from bot protection, timeout, 503, and unverified states
- records historical links 1/4/5 as current-mirror 404 without claiming they did not exist in 1992
- verifies all local relative href/src references
- adds LINK_AUDIT.md and link-audit.json

Update v0.6:
- rebuilt CERN VIEW as an IBM 3270-class 24x80 monochrome terminal candidate
- rebuilt KEK LOCAL VIEW around DECstation 5000/125 + ULTRIX/DECwindows + Line Mode Browser
- uses 1280x1024 5:4 virtual raster for the KEK display candidate
- uses DECterm 80x24 and DEC fixed-width font metrics as the primary local-display hypothesis
- adds per-view specification, evidence, confidence, and substitution notes
- adds DISPLAY_RECONSTRUCTION_NOTES.md

Update v0.7:
- uses GitHub cern-hackdays/lmb mirror as the primary link for CERN's 2013 Line Mode Browser reconstruction
- retains line-mode.cern.ch only as the unavailable/unstable historical official URL
- adds direct links to screenshot.png, public/, and font/ in the mirror

Update v0.9:
- emulator Phase 2
- CERN default changed to hardware-unknown Morita terminal; IBM RS/6000 is a separate 2013 reference profile
- IBM 3270 moved to alternate hypothesis
- KEK DECterm color polarity remains evidence-controlled; later Phase 6.1 corrected the default-resource interpretation
- historical-style dynamic prompts, title line, Next/Previous/Recall/Source and character-by-character reveal

Phase 6 (2026-10-21): KEK real bitmap-font acceptance gate and ULTRIX font-media discovery tooling added. The ULTRIX-extracted target binary is not redistributed.

Phase 6 sharp-display correction (2026-10-21): native framebuffer presentation, nearest-neighbor scaling, 25% auto steps, 1-bit fallback glyph rasterization, and legacy glow/scanline removal.

Phase 6 ULTRIX media pipeline (2026-10-21): `Ultrix_RISC_4.3_OS.iso` can now be processed directly. The tool locates `UDWFONT15430`, extracts `/usr/lib/X11/fonts/decwin/100dpi` Terminal PCFs, converts them without external pcf2bdf, and records provenance/hashes/XLFD/metrics. Exact foundry remains evidence-driven until the real media font is inspected.

v0.17 Phase 6 local ISO extractor
----------------------------------
Do not upload the full ULTRIX ISO. On macOS, double-click
Extract_ULTRIX_DEC_Terminal.command and select Ultrix_RISC_4.3_OS.iso.
Only the small result ZIP created on Desktop needs to be shared for analysis.


v0.18 Phase 6 direct ULTRIX UFS reader
--------------------------------------
The ULTRIX install image is no longer assumed to be a mountable ISO9660 image.
The extractor first reads classic ULTRIX/Sun-style UFS1 directly from Python
(root inode 2, classic FFS superblock/geometry), then tries ISO9660 directly,
and only then falls back to hdiutil/tar. This avoids the macOS mount failure seen
with the 4.3 RISC CD image and preserves detailed diagnostics if all readers fail.


v0.20 Phase 6 GitHub Pages licensed raster (2026-10-21)
- Public page no longer requires a local terminal10.bdf selection.
- A DEC/X Consortium licensed DEC Terminal V2.2 BDF raster asset is bundled and auto-loaded.
- Historical ULTRIX 4.3 target and public rendering source are kept separate in metadata/UI.
- Normalized 8x15 comparison: 195/195 encoded glyphs and ASCII 95/95 match.
- Keyboard-driven Line Mode Browser rendering stays dynamic; Canvas draws BDF pixels directly.
- License: emulator/LICENSES/DEC-X-CONSORTIUM.txt
- Provenance: emulator/docs/DEC_TERMINAL_PROVENANCE.md
- Verification: emulator/tools/verify_dec_terminal_equivalence.py


v0.21 Phase 6.1 DECterm chrome evidence (2026-10-21)
-------------------------------------------------------
- keeps the verified DEC Terminal glyph plane exactly 80x24 cells = 640x360 pixels (8x15 per cell)
- adds a documented DECwindows/dxwm-style candidate frame outside that plane
- models the dxwm banner functions in documented left-to-right order: shrink, title, push-to-back, resize
- adds the documented DECterm menu names: File, Edit, Commands, Options, Print, Help
- corrects the earlier color assumption: dxterm's documented default screenMode is light-on-dark; user X resources can override it
- keeps vertical scrollbar off for the documented dxterm default, while recording that X resources can enable it
- provides a screen-mode selector so the dark-on-light alternate can be inspected without changing the verified glyph geometry
- treats exact KEK 1992 window position, colors, title text, scrollbar resource, and window-manager choice as unresolved evidence questions
- browser-side historical content still renders as hard bitmap pixels; no glow/blur is introduced

See emulator/docs/PHASE6_1_DECTERM_CHROME.md.


v0.22 Phase 6.2 Xws font-selection evidence (2026-10-21)
----------------------------------------------------------
- corrects the earlier VRT19≈95dpi => 100dpi-first inference
- documents Xws 75dpi as the ordinary default font-density path
- documents DECterm Little Font as 14pt at 75dpi and 10pt at 100dpi
- records that Xws 100dpi selection requires explicit server options such as `-fd 100 -dpi 100`
- keeps ULTRIX 4.3 UDWFONT15430/terminal10.pcf as the media-confirmed raster reference
- records the public term14 asset as metadata-matching the 75dpi default path and raster-matching the 100dpi media target 195/195
- adds Extract_ULTRIX_DEC_Terminal_75_100.command to extract UDWFONT430 + UDWFONT15430 and compare them without uploading the full ISO

See emulator/docs/PHASE6_2_FONT_SELECTION.md.


v0.23 Phase 6.3 graphics/X-server branch evidence (2026-10-21)
----------------------------------------------------------------
- removes the v0.22 machine-wide 75dpi runtime-default claim
- records DECstation 5000/125 + VRT19 PX and PXG package branches separately
- stores Xws/75dpi and Xwst3d/100dpi as conditional server paths until the KEK graphics option and actual X-server startup command are recovered
- does not change the verified public glyph bitmap

See emulator/docs/PHASE6_3_GRAPHICS_SERVER_BRANCH.md.


v0.24 Phase 6.4 Line Mode Browser behavior bounds (2026-10-21)
----------------------------------------------------------------
- uses the 1992-02-18 W3 terminal-client figure for period prompt/heading/list/reference evidence
- fixes SOURCE semantics and separates September conservative behavior from the 1992-11-03 reference boundary
- keeps missing remote bytes outside the historical framebuffer via pendingNavigation

v0.25 Phase 6.5 September prompt evidence discipline (2026-10-21)
------------------------------------------------------------------
- September conservative prompt now emits only directly attested token classes: reference range, Return for more, Help or Quit:
- Back / Up / Find prompt tokens are omitted until September-or-earlier direct evidence establishes their exact prompt wording/conditions
- command capability and prompt advertisement are now explicitly separate evidence questions
- November 1992 documented/reference mode retains the later prompt model

See emulator/docs/PHASE6_5_PROMPT_EVIDENCE_DISCIPLINE.md.


v0.26 unified site navigation (2026-10-21)
--------------------------------------------
- all model and research-detail pages use the same persistent top navigation
- the primary return action is always `← 表示モデル一覧へ戻る`
- direct model switching is grouped separately from source/reference links
- the landing page now separates `表示モデル` from `資料・検証`
- the historical framebuffer itself is unchanged


v0.27 unified model-page layout (2026-10-21)
-----------------------------------------------
- all four display models now share one page hierarchy: title/evidence -> display -> operation -> details
- the emulator no longer opens as a separate dense control-panel layout; research controls and diagnostics are collapsed by default
- the emulator framebuffer remains a bare verified pixel surface; no fictional CRT cabinet, blur, scanline or vignette is added
- hardware shells remain only inside models where the shell itself is part of the historical reconstruction hypothesis
- model-layout.css centralises the shared model-page UI without changing historical rendering logic


v0.38 CERN workflow / HTML-authoring provenance (2026-10-22)
--------------------------------------------------------------
- keeps the two primary reviewer questions: CERN-side display and KEK-side display
- adds one CERN-side auxiliary confirmation: how Morita learned/referenced HTML when creating the first KEK file
- records that Berners-Lee built the first WorldWideWeb browser/editor and server on NeXT
- records that HTML/HTTP/URI specifications were published on the first WWW server and that the 1992 snapshot contains HTML tags/examples material
- does NOT infer from those facts that Morita used a NeXT; NeXT + LMB remains an evidence-labelled candidate
- adds a short confirmed-vs-unconfirmed CERN workflow to the reviewer-facing CERN page
