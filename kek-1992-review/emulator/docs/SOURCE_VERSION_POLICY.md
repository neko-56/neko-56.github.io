# Line Mode Browser version policy — 1992-09-30

Updated: 2026-10-20

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
   - exact prompt wording and exact binary revision remain UNKNOWN.

2. `1992-11-03 documented commands`
   - a validation/reference mode based on the preserved W3 snapshot;
   - it must not be silently labeled as the exact 1992-09-30 executable.

## Source packages

The 2.11/2.12 source archives are still valuable for code archaeology:
`HTBrowse.c`, `GridText.c`, `DefaultStyles.c`, parsing and style lineage can be
compared against the 1992 documentation. But every finding imported from them
must be labeled “later source lineage” unless independently corroborated by a
1992 source.

## Primary references

- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/News/9204.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/News/9209.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/QuickGuide.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Defaults/Commands.html
- https://www.w3.org/History/19921103-hypertext/hypertext/WWW/LineMode/Internals.html
- https://www.w3.org/History/1992/
