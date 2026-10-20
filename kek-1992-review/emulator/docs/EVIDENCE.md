# KEK Web Display Emulator — Evidence Matrix (Phase 2)

Updated: 2026-10-20

## 1. Line Mode Browser rendering and interaction

**Confirmed / near-contemporary**

- W3 1992-11-03 Quick Guide: references are numbers in square brackets; type the number and RETURN to follow.
- W3 1992-11-03 Commands: RETURN alone displays the next page; commands may be abbreviated and are case-insensitive. Back, Home, Recall, List, Next, Previous, Go, Up, Down, Top, Bottom, Source, Verbose and Quit are documented.
- W3 1992-11-03 Internals: `GridText.c` assumes fixed-width characters; `HTBrowse.c` handles prompts and command input; `DefaultStyles.c` contains display styles.
- CERN 2013: official reconstruction states the historical experience was 80 × 24 characters, monochrome, keyboard-driven.
- CERN 1993 Computer Newsletter screenshots and RFC 1580 preserve dynamic prompt forms such as `1-81, Back, <RETURN> for more, Quit, or Help:`. Phase 2 therefore uses reference ranges rather than a modern generic prompt.

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
- **Important Phase 2 correction:** 1988/1989 DECwindows manuals say DECterm normally displays **dark text on a light background**. Phase 1 had used light text on dark; Phase 2 changes the default-candidate profile accordingly.
- **Font size:** UWS/DECwindows documentation around this period gives normal DECterm font values around 12–14 point depending release/display DPI. Phase 2 uses 14 px only as a geometry approximation, not a claimed exact point-to-pixel mapping.
- **Monitor candidate:** VRT19 family is a strong candidate when paired with the period workstation/graphics configuration; DEC documentation describes VRT19 as Trinitron, 1280×1024. The exact rear label of KEK's surviving monitor remains unconfirmed.
- **Execution environment still unknown:** whether KEK ran Line Mode Browser inside DECterm, another X terminal, or console.

## 4. Font policy

The ZIP does **not** embed historical/reference font binaries. If the open-source Meyrin font is installed on the local system, the CERN reference profiles use it automatically; otherwise they fall back to a modern monospace font and report that fallback in the inspector.

This avoids presenting a fallback as historically exact. KEK DECterm glyph reconstruction remains Phase 3.

## Primary sources / references

- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/QuickGuide.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/Commands.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Internals.html
- https://line-mode.cern.ch/makingof/ (currently unstable live URL; indexed/cached text and GitHub mirror used)
- https://github.com/cern-hackdays/lmb
- https://github.com/optional-is/Meyrin
- https://optional.is/required/2013/09/25/cern-line-mode-browser/
- https://www.ibarakiken.gr.jp/www/morita/morita3.html
- https://www.ibarakiken.gr.jp/www/history/index.html
- https://bitsavers.org/pdf/dec/vax/ultrix-32/4.0_Jun90/AA-MA88A-TE_DECwindows_Desktop_Applications_Guide_1988.pdf


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

Contemporary DECwindows documentation confirms 24×80 default terminal size,
Normal Font for 80 columns, block cursor, and period defaults of dark text on
light background. DECwindows file listings also preserve Terminal bitmap font
filenames including `TERMINAL14.PCF` and `TERMINAL10_100DPI.PCF`.

These are now explicit candidate font files in the KEK profile. Exact KEK
display DPI/font file remains **UNKNOWN**.
