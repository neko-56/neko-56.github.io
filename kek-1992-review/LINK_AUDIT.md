# KEK 1992 WWW Link Audit

Last checked: **2026-10-21**

## Policy

- 「取得できない」と「リンク切れ」を区別する。
- 明示的な HTTP 404 を確認したものを「リンク切れ」とする。
- bot protection、503、timeout、自動取得不能は別区分とし、404とは扱わない。
- 歴史的リンクは、現在の代替URLが存在しても、同一資料と確認できない限り勝手に置換しない。

## Internal site audit

Checked relative `href` / `src` references in all local HTML files.

- Checked references: **82**
- Missing local files: **0**
- Result: **PASS**


## External / historical links

| Target | Status | Note |
|---|---|---|
| KEK 2002 article | Retrieved | Article body retrieved |
| ibarakiken history | Retrieved | Page body retrieved |
| KEK Entry Point mirror | Retrieved | Page body and link structure retrieved |
| W3C Line Mode Quick Guide | Retrieved | Page body retrieved |
| Morita `3_morita.pdf` | Public URL confirmed | Indexed at exact URL; local uploaded copy reviewed |
| Morita 2019 lecture video | Officially cross-referenced | KEK Open House 2019 page lists `youtu.be/b81GOepuFMU` |
| CERN CDS Proposal PDF | Bot protection | Anubis challenge; not a 404 |
| CERN CDS p69 PDF | Bot protection | Anubis challenge; not a 404 |
| CERN Line Mode Browser home | Indexed; direct fetch unstable | Direct fetch returned 503 |
| CERN Line Mode Browser interviews | Indexed; direct fetch unstable | Direct fetch timed out |
| CERN Line Mode Browser making-of | Not conclusively auto-verified | Keep URL but do not label as verified |
| Historical Help relative target | 404 | `.../first/LineMode/QuickGuide.html` |
| Historical KIWI relative target | 404 | `.../first/kiwi.html` |
| Historical Root relative target | 404 | `.../first/Root.html` |
| Historical CERN links #2 #3 #6 #7 | Retrieved | Current HTTPS versions retrieved |
| DEC Dec-1991 systems price list | Retrieved / indexed | PM322-KN (PX+VRT19) and PM323-KN (PXG+VRT19) entries confirmed 2026-10-21 |
| ULTRIX/UWS 4.3 Release Notes | Retrieved / indexed | Xws=75dpi default; Xwst3d=100dpi default confirmed 2026-10-21 |
| Guide to Installing ULTRIX Aug92 | Retrieved / indexed | UDWSER430 / UDWWSTSER430 / 75dpi / 100dpi subset labels confirmed 2026-10-21 |
| DECstation maintenance manual | Retrieved / indexed | PMAG-CA=PX and PMAG-DA=PXG `cnfg` examples confirmed 2026-10-21 |
| W3 1992 ENRAP paper | Retrieved | Terminal-client figure confirms ` ERROR CODES`, ` o ...`, `PFD[1]`, and `1-9, Return for more, Help or Quit:`; schematic, not a KEK screenshot. 2026-10-21 |
| W3 1992-11-03 historical Quick Guide | Retrieved | Numbered references + RETURN; FIND only when present in prompt. 2026-10-21 |
| W3 1992-11-03 CommandLine | Retrieved | Page length 24; width 78/79/80 system-dependent; `-source` v1.2a+. 2026-10-21 |
| W3 1992-11-03 SourceExamples | Retrieved / indexed | Interactive SOURCE prefix v1.3+; bare SOURCE does not display current loaded source. 2026-10-21 |
| W3 News Apr 1992 | Retrieved | Line Mode Browser version 1.2f at time of writing. 2026-10-21 |
| W3C 2016 FTP shutdown inventory | Retrieved | old/linemode versioned source list begins at 2.11; no `WWWLineMode_1*` entry. Absence elsewhere is not claimed. 2026-10-21 |

## Important distinction

The 404 result for links 1, 4 and 5 is a statement about the **current mirror's relative targets**.
It does not prove that the corresponding resources did not exist in 1992.
