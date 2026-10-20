# Architecture — Phase 2

## Pipeline

```
historical HTML
    ↓
small forgiving HTML parser
    ↓
Line Mode formatter (fixed-width / numbered references / DL styles)
    ↓
document buffer + [End]
    ↓
23 content rows + 1 dynamic prompt row
    ↓
keyboard command interpreter
    ↓
hardware/display profile
    ↓
character-cell Canvas framebuffer
    ↓
optional character-by-character reveal
```

## Phase 2 changes

1. Adds document-title handling and right-aligned title line, matching surviving LMB screenshots.
2. Uses dynamic prompts with reference ranges (`1-n`) and context-sensitive Back/Up/RETURN/Quit.
3. Adds Next/Previous, Recall N, Find, Source and historical abbreviation handling.
4. Separates the **Morita 1992 unknown terminal** from the **IBM RS/6000 used as a 2013 reference machine**.
5. Downgrades IBM 3270 from the default hypothesis to an alternate candidate.
6. Corrects the KEK DECterm default candidate to dark text on a light background, with block cursor and vertical scrollbar.
7. Adds character-by-character reveal because the 2013 team documented that the original browser/terminal visibly drew characters progressively.
8. Adds a cell-grid overlay for geometry verification.

## Remaining Phase 3 work

- exact prompt behavior against a recovered 1992 binary/source revision
- exact DefaultStyles values from period source
- Meyrin/reference glyph validation against 2013 screenshots (no font binary redistributed here)
- DECterm bitmap font identification (XLFD / actual glyph metrics)
- identify exact KEK graphics option and monitor rear label
- identify Morita's actual CERN terminal from primary testimony or CERN terminal-room inventory


## Phase 3 font path

```
character VRAM
    ↓
font backend
    ├─ Canvas vector/system font
    └─ BDF bitmap font
          ↓
       glyph bitmap
          ↓
integer-pixel rectangles
          ↓
framebuffer
```

BDF rendering deliberately prohibits fractional scaling. This is intended to
preserve bitmap structure when a period DEC/X11 Terminal font is available.

## Phase 3 source provenance

Browser behavior and source-code lineage are now separate dimensions.
A later `GridText.c` may help explain architecture without being promoted to
“the exact 1992-09-30 code”. See `SOURCE_VERSION_POLICY.md`.
