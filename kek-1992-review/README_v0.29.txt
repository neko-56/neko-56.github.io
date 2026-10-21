KEK 1992 WWW review site — v0.29 reviewer-first patch

PURPOSE
This patch changes the public entry point from a technical reconstruction index to a reviewer-first page intended for sending to a person who remembers the 1992 work.

MAIN CHANGES
1. index.html
   - Rewritten as "ご確認のお願い（調査中）".
   - Separates confirmed statements, questions for the witness, and reconstruction hypotheses.
   - Makes the six priority questions the primary action.
   - Keeps reconstruction screens behind a disclosure to reduce memory priming.

2. review.html / review.js
   - Reduces the first-pass burden to six priority questions.
   - Moves technical/detail questions into an optional disclosure.
   - Places reconstruction comparison after the free-recall questions.
   - "回答メモをコピー" copies only fields that contain answers.
   - No form submission is implemented; entries stay in the browser page unless copied/printed.

3. research.html
   - Preserves the prior technical/evidence-oriented front page as a separate research notebook.

4. references.html
   - Adds KEK's 2016 official article as a distinct source.
   - Clarifies the difference between the September 1992 FTP-hosted HTML page and the February 1993 HTTP server record.
   - Records the ULTRIX 4.3 DEC Terminal 100dpi/10pt metadata finding while explicitly leaving the actual 75dpi/100dpi runtime choice unresolved.

5. style.css
   - Adds a light, document-like reviewer interface for index.html and review.html.
   - Technical reconstruction pages retain the existing dark style.

DEPLOYMENT
This is an overlay patch, not a complete site archive.
Copy the files in this ZIP over the existing kek-1992-review directory (same relative paths).
Do not delete the existing emulator/ directory or its assets.

Recommended sequence:
- back up the current GitHub Pages directory;
- copy/replace the files from this patch;
- confirm index.html, review.html, research.html and references.html;
- then push to GitHub Pages.

NOTE ON HISTORICAL FONTS
No font payload is included in this patch. It only records metadata/evidence in the HTML text.
