# KEK Web Display Emulator — Evidence Matrix (through Phase 6.5)

Updated: 2026-10-21

## 1. Line Mode Browser rendering and interaction

**Confirmed / near-contemporary**

- W3 1992-11-03 Quick Guide: references are numbers in square brackets; type the number and RETURN to follow.
- W3 1992-11-03 Commands: RETURN alone displays the next page; commands may be abbreviated and are case-insensitive. Back, Home, Recall, List, Next, Previous, Go, Up, Down, Top, Bottom, Source, Verbose and Quit are documented.
- W3 1992-11-03 Internals: `GridText.c` assumes fixed-width characters; `HTBrowse.c` handles prompts and command input; `DefaultStyles.c` contains display styles.
- CERN 2013: official reconstruction states the historical experience was 80 × 24 characters, monochrome, keyboard-driven.
- Later lineage, including 1993/1994 examples, preserves richer dynamic prompts containing `Back`, `Up`, and `<RETURN> for more`. Phase 6.5 does not back-port those later token spellings into the September conservative framebuffer without direct September-or-earlier evidence.


### Phase 6.4 period-behavior correction

- A contemporaneous W3 paper's terminal-client figure directly shows `1-9, Return for more, Help or Quit:`, ` ERROR CODES`, numeric references immediately after anchor text, and ` o ` unordered-list markers. It is a schematic example, not a KEK screen capture.
- Preserved command-line documentation gives page length 24 and a system-dependent default width of 78, 79, or 80 columns. The emulator's 80-column KEK plane therefore comes from the DECterm candidate, not a claimed universal Line Mode Browser default.
- Command-line `-source` is documented as v1.2a+. Interactive `SOURCE` is separately documented as a prefix in v1.3+, and bare SOURCE does not expose the already loaded document's source.
- Exact 1992-09-30 Line Mode Browser executable revision remains **UNKNOWN**. The `sep1992_conservative` profile is evidence-bounded; the `nov1992_documented` profile is a later preserved reference boundary. The W3C 2016 FTP-shutdown inventory lists versioned old Line Mode source archives from 2.11 onward and no `WWWLineMode_1*`; this is an archive-availability bound, not proof that no 1.x copy survives elsewhere.
- Unavailable remote documents are not replaced by modern synthetic "offline reconstruction" pages inside the historical framebuffer. The current historical pixels remain unchanged, while an unresolved navigation request is exposed only by the surrounding research UI.

### Phase 6.5 prompt-token correction

- `sep1992_conservative` now emits only the prompt token classes directly attested by the 1992-02-18 figure: reference range, conditional `Return for more`, and `Help or Quit:`.
- `Back`, `Up`, and `Find <keywords>` are omitted from that prompt because their exact 1992-09-30 wording/conditions remain unresolved. Their omission is not evidence that the commands were absent.
- `nov1992_documented` remains the later documentation/reference mode and may expose the richer prompt model.
- Current W3 preservation inventories already audited expose versioned Line Mode source from 2.11 onward, not an exact 1.x tarball; public searching performed for Phase 6.5 did not identify a versioned 1.1/1.2/1.2f/1.3 source archive. This search is non-exhaustive.

## 2. CERN-side hardware

### Morita 1992 terminal

**Confirmed:** Morita's retrospective says that after lunch with Tim Berners-Lee he went to a CERN terminal room and logged into KEK.

**Still unknown:** manufacturer/model, physical display resolution, phosphor, terminal emulator, exact glyph set.

The safest CERN profile therefore remains **hardware unknown + 80×24 Line Mode Browser**.

### IBM RISC System/6000 reference machine

The 2013 reconstruction team documented that it had an old working **IBM RISC System/6000 AIX machine with the original Line Mode Browser running**. The team photographed its display, recorded its keyboard, and reconstructed the non-Courier terminal typeface. The resulting Meyrin project states that glyphs were reproduced from screenshots of the IBM System 6000 character repertoire.

This is strong evidence for the *2013 reference implementation*, but **not proof that Morita used an RS/6000 on 1992-09-30**. Phase 2 now makes this a separate profile.

### IBM 3270 hypothesis

A separate CERN staff retrospective mentions early Line Mode Browser use on a fixed-size IBM 3270 display. This proves such use existed at CERN, but does not identify Morita's terminal. Phase 2 therefore retains 3270 only as an alternate hypothesis, not the default reconstruction.

## 3. KEK side

- **Confirmed machine:** DECstation 5000/125 (surviving/exhibited KEK hardware).
- **Confirmed chronology:** Line Mode Browser installed at KEK on 1992-04-14.
- **Contemporary DECwindows documentation:** DECterm default terminal size 24 rows × 80 columns; normal 80-column font; block cursor.
- **Phase 6.1 correction of the earlier color claim:** the `dxterm` resource documentation states that `screenMode` can be dark-on-light or light-on-dark and that the documented default is **light-on-dark**. Contemporary ULTRIX `.Xdefaults` examples also show that users/session startup could override `screenMode`, so the KEK machine's actual polarity remains **UNKNOWN**.
- **Font metrics (Phase 6):** the ULTRIX 4.3 media target `UDWFONT15430/terminal10.pcf` is verified as DEC Terminal V2.2, 8×15, ascent 12/descent 3, with XLFD `-DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1`.
- **Runtime font selection (Phase 6.3 correction):** server-specific defaults are documented, but the KEK server branch is not. `Xws` defaults to 75dpi; `Xwst3d` defaults to 100dpi; DECterm Little Font maps those densities to 14pt and 10pt respectively. DEC's 1991 price list shows DECstation 5000/125 + VRT19 packages with both PX 2D (`PM322-KN`) and PXG 3D (`PM323-KN`) graphics. Because the surviving graphics option and `/etc/ttys` server line are unknown, neither 75dpi nor 100dpi is promoted as the KEK runtime default.
- **Monitor candidate:** VRT19 family is a strong candidate when paired with the period workstation/graphics configuration; DEC documentation describes VRT19 as Trinitron, 1280×1024. The exact rear label of KEK's surviving monitor remains unconfirmed.
- **Execution environment still unknown:** whether KEK ran Line Mode Browser inside DECterm, another X terminal, or console.

## 4. Font policy

The ZIP does **not** embed the proprietary ULTRIX-extracted target font. For the KEK profile, v0.20 embeds a separately licensed X Consortium DEC Terminal V2.2 bitmap raster whose 195 encoded glyphs were normalized and verified against the ULTRIX 4.3 target. CERN profiles retain their separate Meyrin/fallback behavior.

This avoids presenting a fallback as historically exact. Phase 6 establishes glyph-raster equivalence; Phase 6.1 keeps the surrounding DECwindows chrome separate; Phase 6.2 establishes server-specific density behavior; Phase 6.3 prevents those server facts from being misread as a KEK-machine-wide default before the graphics/X-server branch is identified. Phase 6.4 similarly bounds browser-visible behavior to period evidence and removes modern offline-status prose from the historical framebuffer. Phase 6.5 tightens the September prompt further by omitting later/unattested Back, Up, and Find prompt tokens.

## Primary sources / references

- https://www.w3.org/2016/11/ftp-shutdown/info.html
- https://www.w3.org/History/1992/ENRAP/Article_9202.pdf
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/QuickGuide.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/CommandLine.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/SourceExamples.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/Commands.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Internals.html
- https://line-mode.cern.ch/makingof/ (currently unstable live URL; indexed/cached text and GitHub mirror used)
- https://github.com/cern-hackdays/lmb
- https://github.com/optional-is/Meyrin
- https://optional.is/required/2013/09/25/cern-line-mode-browser/
- https://www.ibarakiken.gr.jp/www/morita/morita3.html
- https://www.ibarakiken.gr.jp/www/history/index.html
- https://bitsavers.org/pdf/dec/vax/ultrix-32/4.0_Jun90/AA-MA88A-TE_DECwindows_Desktop_Applications_Guide_1988.pdf
- https://www.bitsavers.org/pdf/dec/vax/ultrix-32/4.0_Jun90/AA-MA85C-TE_Ultrix_4.0_Workstation_Software_Reference_Pages_Sections_1X_and_8X_Jun1990.pdf
- https://www.typewritten.org/Manual/DEC/Ultrix/4.4/mips/man1x/dxwm.html
- https://www.bitsavers.org/pdf/dec/vax/ultrix-32/4.3/AA-ME85H-TE_ULTRIX_and_UWS_V4.3_Release_Notes_Aug92.pdf


## Phase 3 correction — Line Mode source versions

The presence of `WWWLineMode_2.11.tar.Z` and `WWWLineMode_2.12.tar.Z` in
W3 historical storage does not make them 1992-09-30 source snapshots.
The related 2.11/2.12 code generation belongs to 1993-era release history.
They are retained only for source-lineage comparison.

For the target date, the strongest version evidence currently is:
- 1.1 released 1992-01-15;
- 1.2 announced 1992-02-12;
- April 1992 W3 News explicitly says the current browser is 1.2f and
  Version 2 is expected soon;
- detailed user/internals documentation survives in the 1992-11-03 snapshot.

Exact executable revision on Morita's CERN terminal: **UNKNOWN**.

## Phase 3 — DECterm font evidence

Contemporary DECwindows documentation confirms 24-row terminal defaults, a normal 80-column font path, and a block cursor. The later direct media extraction confirms the 100dpi `terminal10.pcf` target described above.

Phase 6.1 corrects the earlier screen-color interpretation: the documented `dxterm` default is light-on-dark and vertical scrolling is Off, but both are configurable through resources. Phase 6.2 establishes the Xws 75dpi default / explicit 100dpi override distinction; Phase 6.3 adds the separate 100dpi-default `Xwst3d` branch and records that the KEK graphics/server branch is unresolved. Exact KEK graphics option, server command, screen polarity, scrollbar state, and session resources remain **UNKNOWN**.
