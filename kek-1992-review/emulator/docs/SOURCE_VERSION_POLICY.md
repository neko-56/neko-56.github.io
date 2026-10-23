# Line Mode Browser version policy — 1992-09-30

Updated: 2026-10-21

## Critical distinction

The W3 historical tree exposes `WWWLineMode_2.11.tar.Z` and
`WWWLineMode_2.12.tar.Z`, but these must **not** be treated as the exact
source used by Yohei Morita on 1992-09-30 merely because they are visible
under `/History/1992/`.

The W3/libwww change history places the 2.11 and 2.12 line/library generation
in 1993-era releases (2.11: September 1993; 2.12: October 1993 for the
corresponding library generation).

## What is actually documented around 1992-09-30

- 1992-01-15: Line Mode Browser 1.1 public release.
- 1992-02-12: 1.2 announced.
- April 1992 W3 News: current browser is **1.2f**, and Version 2 is expected
  “any time now”.
- 1992-09 W3 News: KEK is already mentioned among experimental servers.
- 1992-11-03 W3 snapshot: detailed Line Mode Browser user and internals
  documentation survives, including QuickGuide, Commands and Internals.

Therefore the emulator has two behavior-evidence modes:

1. `1992-09-30 conservative`
   - the reconstruction target;
   - uses only behavior that is well supported by 1992 documentation or
     near-contemporary evidence;
   - a February 1992 W3 figure directly attests the prompt form
     `1-9, Return for more, Help or Quit:` and the current conservative prompt
     preserves that order/capitalization where applicable;
   - exact KEK prompt state, extra Back/Up/Find prompt tokens, and exact binary revision remain UNKNOWN; Phase 6.5 therefore omits those unattested prompt tokens from the September framebuffer rather than guessing their wording.

2. `1992-11-03 documented commands`
   - a validation/reference mode based on the preserved W3 snapshot;
   - it must not be silently labeled as the exact 1992-09-30 executable.

## SOURCE semantics

Do not conflate two features that share the word `source`:

- command-line `-source`: preserved documentation marks this as **v1.2a or later**;
- interactive `SOURCE <command>`: the preserved SourceExamples page marks this as **Version 1.3 and later** and describes it as a prefix/qualifier. It explicitly says bare `SOURCE` does not turn the already loaded current document into source view.

Therefore the September conservative mode does not claim interactive SOURCE as established. The November reference mode recognizes the prefix semantics, but missing remote bytes are not fabricated.

## Display-width boundary

The KEK profile uses 80 columns because the candidate DECterm is 80×24. This must not be described as a universal browser default: the preserved Line Mode Browser command-line documentation says the width default is **78, 79, or 80 depending on system**, with a page-length default of **24**.

## Current W3 preservation inventory

The W3C FTP-shutdown inventory preserved in 2016 lists `WWWLineMode_2.11.tar.Z` as the earliest versioned Line Mode source archive in its old/linemode section and has no `WWWLineMode_1*` entry. The public `/History/1992/` index similarly exposes 2.11/2.12 and `WWWLineModeDefaults.tar.Z`, not a version-1 source tarball. This is an archive-availability fact, not proof that no 1.x copy exists elsewhere.

## Source packages

The 2.11/2.12 source archives are still valuable for code archaeology:
`HTBrowse.c`, `GridText.c`, `DefaultStyles.c`, parsing and style lineage can be
compared against the 1992 documentation. But every finding imported from them
must be labeled “later source lineage” unless independently corroborated by a
1992 source.

## Primary references

- https://www.w3.org/2016/11/ftp-shutdown/info.html
- https://www.w3.org/History/1992/ENRAP/Article_9202.pdf

- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/News/9204.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/News/9209.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/QuickGuide.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/Commands.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/CommandLine.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/SourceExamples.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Internals.html
- https://www.w3.org/History/1992/


## Phase 6.5 prompt lineage rule

Later prompt examples are useful for lineage but not for filling gaps in the September framebuffer. The conservative mode uses the 1992-02-18 terminal figure as a directly attested minimum. `Back`, `Up`, and `Find` can remain commands or later-reference concepts without being displayed in the September prompt. If an exact 1.x source/binary or September-or-earlier screen record is recovered, this boundary can be revised from evidence rather than from chronology alone.
