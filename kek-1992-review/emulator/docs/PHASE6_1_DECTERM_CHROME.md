# Phase 6.1 — DECterm window chrome and screen-mode evidence

Date: 2026-10-21

## Purpose

This phase separates two questions that must not be conflated:

1. **Verified terminal glyph raster** — the DEC Terminal bitmap actually used for the historical text plane.
2. **Window-system presentation** — DECwindows window-manager decoration, menu bar, colors, scrollbar state, and screen placement around that plane.

The glyph raster is strongly verified. The KEK-specific window decoration is still partly reconstructive. The implementation therefore fixes the former and explicitly labels the latter as a candidate.

## Fixed historical text plane

The KEK DECterm candidate uses:

- 80 columns
- 24 rows
- 8 × 15 pixels per DEC Terminal cell
- 640 × 360 pixels for the complete text plane
- BDF bitmap rendering at scale 1

Window chrome is composited *outside* this rectangle. Changing screen mode, window-manager decoration, title, or menu appearance cannot change glyph geometry.

The public GitHub Pages font remains the separately redistributable X Consortium DEC Terminal V2.2 BDF pinned in Phase 6. The ULTRIX-extracted target font is verification material only and is not redistributed.

## Contemporary facts represented in v0.21

### dxwm banner structure

The ULTRIX/UWS `dxwm(1X)` reference describes a banner on managed application windows. From left to right it contains:

1. shrink-to-icon button
2. title bar
3. push-to-back button
4. resize button

The same reference describes a thin outer border and thicker inner/between-button borders, with defaults of white and black respectively. v0.21 uses this *structure* as the XUI/dxwm-era candidate frame. Its exact pixel dimensions and colors are reconstruction parameters rather than KEK measurements.

Source:
- https://www.typewritten.org/Manual/DEC/Ultrix/4.4/mips/man1x/dxwm.html

### DECterm menu names

DECterm documentation describes the menu set `File`, `Edit`, `Commands`, `Options`, `Print`, and `Help`. v0.21 exposes those names in the candidate menu bar. Menu geometry and the font used for the menu labels are not claimed to be exact KEK values.

Reference family:
- https://www.typewritten.org/Manual/DEC/Digital_UNIX/3.2c/man1x/dxterm.html

### Logical display size

`dxterm` documentation gives 24 rows as the default logical height. The reconstruction keeps the already-established 80-column Line Mode Browser candidate and therefore fixes the historical plane at 80×24.

Reference:
- https://www.typewritten.org/Manual/DEC/Digital_UNIX/3.2c/man1x/dxterm.html

### Screen mode and scrollbars

The documented `dxterm` resource default for `screenMode` is **light on dark**. The documented defaults for horizontal and vertical scrollbars are **Off**. v0.21 therefore uses light-on-dark and no vertical scrollbar as the profile default.

However, the contemporary ULTRIX X resource example in the Worksystem Software Reference Pages explicitly includes settings such as:

- `Dxterm*screenMode: true`
- `Dxterm*scrollVertical: on`

This demonstrates that a user's/session's resources could change the appearance. Consequently v0.21 must **not** interpret the default resource value as proof of the KEK workstation's saved configuration. A dark-on-light inspection mode remains available in the research UI.

Sources:
- https://www.bitsavers.org/pdf/dec/vax/ultrix-32/4.0_Jun90/AA-MA85C-TE_Ultrix_4.0_Workstation_Software_Reference_Pages_Sections_1X_and_8X_Jun1990.pdf
- https://www.typewritten.org/Manual/DEC/Digital_UNIX/3.2c/man1x/dxterm.html

### XUI/dxwm versus Motif

ULTRIX/UWS 4.3 Release Notes state that OSF/Motif 1.1.3 was supplied as a bundled component on its own distribution media and installed after the base 4.3 installation/upgrade. This means the mere fact that the KEK machine ran ULTRIX 4.3 does not by itself identify the active window manager or visual style.

The v0.21 frame therefore represents the documented DECwindows/dxwm/XUI-era candidate. It is **not** asserted to be proof that KEK used dxwm rather than the optional Motif environment.

Source:
- https://www.bitsavers.org/pdf/dec/vax/ultrix-32/4.3/AA-ME85H-TE_ULTRIX_and_UWS_V4.3_Release_Notes_Aug92.pdf

## Rendering discipline

The reconstruction follows these rules:

- terminal BDF pixels are drawn at integer coordinates and scale 1 into the reconstructed framebuffer;
- the 640×360 text plane is never stretched to make chrome fit;
- presentation enlargement remains a separate nearest-neighbor layer;
- no glow, scanline, phosphor blur, or browser text anti-aliasing is added to the historical glyph raster;
- candidate UI text is rasterized to an off-screen surface and thresholded to hard logical pixels before compositing;
- screen-mode switching changes colors only, not glyph geometry or browser state.

## Evidence boundary

### Strong / implemented as fixed

- historical DEC Terminal glyph bitmap equivalence established in Phase 6
- 8×15 terminal cell
- 80×24 candidate text grid
- exact 640×360 text-plane geometry
- documented dxwm banner function order
- documented DECterm menu names
- documented dxterm default screen polarity: light-on-dark
- documented default vertical scrollbar state: Off

### Plausible candidate / deliberately not asserted as KEK-specific

- exact window rectangle and position within 1280×1024
- title-bar and menu-bar pixel heights
- title string `DECterm`
- title/menu font metrics
- exact DECwindows colors
- XUI/dxwm as the active KEK window manager

### Still unknown

- KEK user's/session's `.Xdefaults` and startup resources
- whether `screenMode` had been overridden
- whether `scrollVertical` had been enabled
- whether OSF/Motif was installed and selected for the 1992 session
- the precise resource/monitor conditions selecting the 100dpi Terminal font path on the KEK workstation

## Next evidence target

The next useful step is not additional visual guessing. It is to reconstruct the DECwindows resource-selection path: server DPI / font path / `Dxterm*fontSetName` / session resources. That can determine whether the verified `terminal10` 100dpi raster was merely present on the ULTRIX media or was the raster selected by the KEK-like DECstation 5000/125 + VRT19 environment.
