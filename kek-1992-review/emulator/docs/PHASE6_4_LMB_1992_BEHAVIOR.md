# Phase 6.4 — 1992 Line Mode Browser behavior bounds

Updated: 2026-10-21

## Purpose

This phase tightens the browser behavior visible inside the reconstructed
terminal.  It does **not** claim that the exact executable used by Yohei Morita
on 1992-09-30 has been recovered.

The evidence is deliberately split into:

1. material demonstrably available before the KEK target date;
2. the preserved 1992-11-03 W3 documentation snapshot;
3. later source lineage, which remains useful for archaeology but is not allowed
   to override period evidence by itself.

## 1. A period prompt form now exists

The source of the W3 paper *World-Wide Web: The Information Universe* carries a
creation date of 1992-02-18.  Its terminal-client figure shows the prompt:

`1-9, Return for more, Help or Quit:`

This is substantially stronger than deriving the prompt from a modern
reimplementation.  Phase 6.4 therefore changes the `sep1992_conservative`
profile to preserve the attested order and capitalization:

- reference range first;
- `Return for more` when more document text exists;
- `Help or Quit:` at the end.

The exact wording used after navigation states that add `Back` or `Up` is still
not established for Morita's exact 1992-09-30 executable. In v0.24 those tokens
remained a conditional reconstruction. **Phase 6.5 supersedes that choice:** the
September conservative prompt now omits them until direct evidence is recovered.

## 2. Contemporary formatting evidence

The same February 1992 figure supplies a useful HTML-to-terminal example:

- `<H1>Error Codes</H1>` becomes ` ERROR CODES`;
- an anchor appears as its label immediately followed by `[1]`;
- unordered-list items use a lowercase `o` marker with surrounding spacing.

Accordingly Phase 6.4 changes H1/H2/H3 fallback rendering from centered text to
uppercase text with a one-column left indent, and adds period-style unordered
list rendering.

This figure is an explanatory schematic.  It is evidence for contemporary Line
Mode Browser presentation conventions, not proof of the exact KEK page pixels.

## 3. SOURCE was previously modeled incorrectly

Two different features must not be conflated.

The preserved command-line documentation says `-source` is available from
version 1.2a.  That is a **program invocation option**.

The preserved `SourceExamples` page describes interactive `SOURCE` as a prefix
that qualifies another command and labels it "Version 1.3 and later".  It also
states that `SOURCE` alone does not change an already loaded document into its
source representation.

The old emulator incorrectly treated bare `source` as "show the source of the
current document".  Phase 6.4 removes that behavior:

- September conservative mode does not promote the interactive SOURCE prefix as
  established behavior;
- November reference mode recognizes the prefix semantics;
- bare `SOURCE` never opens an invented `internal:source` document;
- remote target bytes are not fabricated when they are not bundled.

## 4. Geometry: 80 columns is a display candidate, not a universal LMB default

The preserved 1992 command-line page documents:

- page length default: 24;
- width default: 78, 79, or 80 depending on system.

The KEK DECterm candidate remains an 80x24 terminal, and the emulator therefore
uses an 80-column rendering surface for that profile.  Phase 6.4 stops describing
80 columns as though it were a universal Line Mode Browser software default.

The current fixed-screen model reserves one of the 24 visible rows for the
prompt.  Exact interaction between `-p24`, terminal scrolling, and the physical
24-row viewport remains an open executable-level question.

## 5. Version boundary

Documented chronology currently gives:

- 1992-01-15: Line Mode Browser 1.1 public release;
- 1992-02-12: 1.2 announced;
- April 1992: W3 News says the current browser is 1.2f and version 2 is expected;
- August 1992: CVS introduced at CERN;
- 1992-09-30: KEK reconstruction target;
- 1992-11-03: preserved W3 project snapshot.

This is enough to reject a false exact-version claim, but not enough to name the
precise binary revision running in the KEK/CERN session on 1992-09-30.

The W3C's 2016 FTP-shutdown inventory lists preserved Line Mode source archives beginning with `WWWLineMode_2.11.tar.Z`; it contains no `WWWLineMode_1*` entry. The `/History/1992/` directory likewise exposes 2.11/2.12 source archives and the defaults archive, not a 1.2/1.3 source tarball. This does **not** prove that 1.x source is lost everywhere, but it explains why the exact September source cannot be recovered merely by choosing a file from the current W3 historical directory.

## 6. Missing remote bytes are not historical screen content

Earlier emulator builds created a synthetic page when a selected reference was not bundled. That page contained modern statements such as “offline reconstruction”, which violates the display-discipline rule even if the text is technically informative.

Phase 6.4 replaces that with an explicit resolver boundary:

- when real/fixture destination HTML is available through `resolveDocument(target, context)`, the browser formats and navigates to it normally;
- when destination bytes are unavailable, the historical framebuffer is left unchanged;
- the attempted operation is recorded as structured `pendingNavigation`;
- the surrounding research UI, outside the canvas, may report that unresolved request.

The same rule is used for unresolved reference, GO, FIND, and qualified SOURCE operations. This does not claim that a 1992 browser would leave the screen unchanged on a real network failure; it prevents the reconstruction from inventing a failure screen for which no period bytes/message have been established.

## Sources

- https://www.w3.org/History/1992/ENRAP/Article_9202.pdf
- https://www.w3.org/2016/11/ftp-shutdown/info.html
- https://www.w3.org/History.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/News/9204.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/QuickGuide.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/CommandLine.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/SourceExamples.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Internals.html
