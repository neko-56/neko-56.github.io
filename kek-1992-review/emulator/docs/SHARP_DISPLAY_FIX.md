# Sharp display fix — Phase 6

Date: 2026-10-21

## Problem

The Phase 6 page claimed that CRT blur was disabled, but two independent smoothing paths still existed:

1. `auto` presentation scale used an arbitrary fractional fit value between 1.0 and 1.75.
2. Until a historical BDF was loaded, terminal text was drawn directly with Canvas `fillText()`, so browser/OS font antialiasing remained visible.

The old reconstruction CSS also retained text glow and scanline overlays.

## Rendering rule after this fix

- The canvas backing store is exactly the reconstructed framebuffer size.
  - KEK candidate: 1280×1024.
  - No `devicePixelRatio` multiplication.
  - No presentation-scale multiplication in the backing store.
- Presentation enlargement happens only through CSS dimensions.
- Canvas presentation uses nearest-neighbor / pixelated image rendering.
- Auto scale uses 25% steps only: 100%, 125%, 150%, 175%.
- It never shrinks below 100%; horizontal scrolling is used instead.
- Historical BDF glyph pixels remain 1:1 logical framebuffer pixels.
- Until the real historical BDF is available, vector/system fallback glyphs are rendered into the target character cell and thresholded into a 1-bit logical-pixel bitmap before being painted to the framebuffer.
- The 1-bit fallback is explicitly a diagnostic stand-in. It is not treated as evidence for the historical glyph design.
- Legacy reconstruction CSS no longer applies text glow or pseudo-scanline overlays.

## Why this matters

A real CRT can have a sharply focused raster when viewed directly. Camera defocus, bloom, scanline moire, and exposure effects are properties of photography or a deliberately simulated optical model; they should not be baked into the default historical display reconstruction.

## Regression protection

`tests/test-sharp-display.js` checks that:

- the native framebuffer is retained,
- `devicePixelRatio` re-rasterization is absent,
- fallback text is hard-rasterized,
- nearest-neighbor presentation is enabled,
- auto scale is quantized to 25% steps,
- the KEK Phase 6 profile is the default profile.
