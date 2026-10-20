# KEK 1992 WWW Link Audit

Last checked: **2026-10-20**

## Policy

- 「取得できない」と「リンク切れ」を区別する。
- 明示的な HTTP 404 を確認したものを「リンク切れ」とする。
- bot protection、503、timeout、自動取得不能は別区分とし、404とは扱わない。
- 歴史的リンクは、現在の代替URLが存在しても、同一資料と確認できない限り勝手に置換しない。

## Internal site audit

Checked relative `href` / `src` references in all local HTML files.

- Checked references: **35**
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

## Important distinction

The 404 result for links 1, 4 and 5 is a statement about the **current mirror's relative targets**.
It does not prove that the corresponding resources did not exist in 1992.
