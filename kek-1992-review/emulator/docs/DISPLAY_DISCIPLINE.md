# Display discipline — Phase 3.1

## Rule

The emulated historical display must contain only:

1. text originating from the reconstructed historical HTML;
2. output that the Line Mode Browser itself would generate;
3. cursor / paging UI that is supported by period documentation or clearly marked as a browser-level reconstruction.

Research labels, machine names, evidence notes, and modern debugging information must never be painted inside the historical framebuffer.

## Phase 3.0 regression fixed

The previous build incorrectly painted modern/research labels such as a hardware-identification caption into the simulated display frame, and it also injected the internal document label `KEK Entry Point` into the terminal output.

Those were not part of the historical page and have been removed.

## Sharpness

The previous build also scaled a low-resolution Canvas and applied phosphor glow by default. On Retina Safari this produced visibly soft text.

Phase 3.1:
- renders Canvas at `devicePixelRatio`;
- disables image smoothing;
- removes default phosphor shadow;
- makes scanline/vignette effects opt-in;
- expands the historical display to full-width and moves the specification inspector below it;
- keeps BDF glyph scaling integer-only.

The historical bitmap font is still a separate open issue; sharp rendering does not imply the fallback font is historically exact.


## Phase 4 display-size rule

The historical screen is the primary object. It must not be reduced merely so
that explanatory prose can fit beside it.

Research prose follows below the screen. If the historical framebuffer is
wider than the current browser viewport, horizontal scrolling is preferred to
sub-100% scaling.

CRT display sharpness and photographed-CRT artifacts are separate models.
The normal emulator models the viewed display and contains no blur.


## Phase 6.4 unresolved-navigation rule

A missing target is not historical content. Therefore link selection, GO, FIND, or SOURCE operations whose destination bytes are unavailable must not generate a synthetic document containing modern research/debug language inside the framebuffer.

The engine now leaves the current historical screen unchanged and emits a structured `pendingNavigation` record. The surrounding research UI may show that request below the canvas. If an actual target document is supplied through the document resolver, normal historical document formatting/navigation can proceed.


## Phase 6.5 prompt-token rule

A command being known somewhere in the Line Mode Browser lineage is not sufficient evidence to paint its name into the 1992-09-30 prompt. The September conservative framebuffer may advertise only prompt token classes directly supported by target-date-or-earlier evidence. Later prompt wording belongs in the separate November reference mode until independently corroborated.

Omitting an unverified token is deliberately asymmetric: it means “not proven for this screen,” not “the historical executable lacked this command.”
