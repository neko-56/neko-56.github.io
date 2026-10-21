# Phase 6.5 — September prompt evidence discipline

Updated: 2026-10-21

## Problem

Phase 6.4 established a strong contemporary prompt example:

`1-9, Return for more, Help or Quit:`

from the 1992-02-18 W3 paper *World-Wide Web: The Information Universe*.
However, the conservative profile still inserted `Back` and `Up` after state
changes, and could advertise `Find <keywords>` for index documents. Those
features are compatible with later Line Mode Browser documentation, but their
exact prompt wording and conditions on 1992-09-30 have not been directly
recovered.

For a reconstruction whose historical framebuffer is intended to be
source-disciplined, "plausible later lineage" is not enough to paint a token.

## Policy

`sep1992_conservative` now advertises only prompt token classes directly
attested by the 1992-02-18 terminal figure:

- numeric reference range (`1` or `1-n`) when references exist;
- `Return for more` when additional text remains;
- closing `Help or Quit:`.

The following are deliberately omitted from the September prompt:

- `Back`;
- `Up`;
- `Find <keywords>`.

This omission is **not** a claim that those commands were absent. The command
interpreter and the visible prompt are separate evidence domains. A command can
remain usable for research/testing while its spelling is not painted into the
target-date screen.

## Later reference mode

`nov1992_documented` remains separate. The preserved 1992-11-03 W3 materials
are valid evidence for that reference boundary and can expose the richer prompt
model there. Later 1993/1994 examples can corroborate lineage but are not used
to make the September prompt more specific.

## Source-recovery status

The W3 preservation inventories already audited expose versioned Line Mode
source archives beginning at 2.11, not a `WWWLineMode_1*` source tarball.
Targeted public searches performed during Phase 6.5 for versioned 1.1, 1.2,
1.2f, and 1.3 archives did not identify an exact source package. That search is
non-exhaustive and must not be converted into a claim that all 1.x source is
lost.

## Acceptance test

The Phase 6.5 regression test constructs states where `Back`, `Up`, and `Find`
would be meaningful. It requires that:

1. the September prompt does not advertise those tokens;
2. the `Back` command can still function when navigation bytes are supplied;
3. pagination still yields the directly-attested `Return for more` form;
4. the November reference profile remains independent.

## Primary evidence

- https://www.w3.org/History/1992/ENRAP/Article_9202.pdf
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/QuickGuide.html
- https://www.w3.org/2016/11/ftp-shutdown/info.html
- https://www.w3.org/History/1992/
