# Architecture — through Phase 6.5

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
2. Uses dynamic prompts with reference ranges (`1-n`). Later/reference mode can expose context-sensitive Back/Up/RETURN/Quit; Phase 6.5 restricts the September conservative prompt to directly attested token classes.
3. Adds Next/Previous, Recall N, Find, Source and historical abbreviation handling.
4. Separates the **Morita 1992 unknown terminal** from the **IBM RS/6000 used as a 2013 reference machine**.
5. Downgrades IBM 3270 from the default hypothesis to an alternate candidate.
6. Historical note: Phase 2 temporarily treated dark-on-light plus a vertical scrollbar as the KEK default candidate. Phase 6.1 supersedes this: documented `dxterm` defaults are light-on-dark and scrollbars Off, while KEK-specific resources remain unknown.
7. Adds character-by-character reveal because the 2013 team documented that the original browser/terminal visibly drew characters progressively.
8. Adds a cell-grid overlay for geometry verification.

## Remaining historical-browser / environment work

- exact prompt behavior against a recovered 1992 binary/source revision
- exact DefaultStyles values from period source
- Meyrin/reference glyph validation against 2013 screenshots (no font binary redistributed here)
- DECterm bitmap font identification is complete at the glyph level; remaining work is proving the KEK runtime DPI/font-resource selection path
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


## Phase 6 / 6.1 / 6.2 display and evidence separation

The KEK display path now has two explicitly separate coordinate domains:

```
1280×1024 reconstructed display framebuffer
    ↓
DECwindows candidate window chrome (evidence-bounded, not KEK-exact)
    ↓
fixed DECterm text plane: 640×360
    ↓
80×24 cells × 8×15 pixels
    ↓
verified DEC Terminal BDF glyphs at scale 1
```

Window title/menu/borders never resize or resample the 640×360 terminal plane. The profile default screen polarity is light-on-dark and vertical scrolling is off because those are the documented `dxterm` defaults; the research UI retains an alternate polarity because startup/X resources could override them.

The chrome implementation follows the documented dxwm banner function order (shrink, title, push-to-back, resize) and DECterm menu names, but exact KEK 1992 window geometry, colors, title typography and active window manager remain unresolved.


## Phase 6.3 font evidence domains

The font pipeline no longer stores a KEK-machine-wide `runtimeDefaultFontId`.
That property incorrectly collapsed an unresolved graphics/X-server branch.

The KEK profile now carries:

- `targetFontId = kek_vrt19_100dpi_little`: media-confirmed ULTRIX glyph target;
- `runtimeSelectionStatus`: explicitly unresolved;
- `graphicsOptionStatus`: explicitly unknown;
- `runtimeFontBranches[]`: documented server-specific paths.

Current branches:

- `xws_75dpi`: Xws, 75dpi, DECterm Little Font 14pt;
- `xwst3d_100dpi`: Xwst3d, 100dpi, DECterm Little Font 10pt (conditional until the KEK PXG server binary is identified).

The bundled public BDF records two independent relationships:

- `metadataTargetId = kek_75dpi_normal`;
- `rasterEquivalentTargetId = kek_vrt19_100dpi_little`.

This lets new graphics-module or `/etc/ttys` evidence resolve the runtime branch
without rewriting already verified glyph history.


## Phase 6.4 browser-evidence boundary

The browser engine now separates three domains that older builds blurred together:

```
period HTML + period-attested formatter/prompt rules
    ↓
historical framebuffer

optional document resolver
    ↓
real destination bytes, only when actually available

missing destination / unavailable network operation
    ↓
structured pendingNavigation
    ↓
research status UI outside the historical framebuffer
```

This means a missing link no longer creates a made-up historical page saying that content is unavailable offline. Tests can inject a `resolveDocument(target, context)` function when real/fixture destination bytes are available; public static operation leaves unresolved requests outside the historical pixel plane.

The two browser-behavior profiles remain intentionally different: `sep1992_conservative` uses directly period-supported behavior and `nov1992_documented` preserves the later 1992-11-03 documentation boundary.


## Phase 6.5 prompt evidence boundary

Prompt advertisement is now modeled separately from command capability. `sep1992_conservative` can retain navigation commands in the interpreter while its visible prompt is generated from the smaller directly-attested 1992 token set. This prevents a later-documented command from silently becoming a claimed September screen token.

```
command capability
    !=
prompt token directly attested for 1992-09-30
```

The conservative prompt therefore omits `Back`, `Up`, and `Find <keywords>` until stronger target-date evidence is recovered. `nov1992_documented` remains a separate later reference profile.
