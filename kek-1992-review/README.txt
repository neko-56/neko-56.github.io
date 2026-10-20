KEK 1992 WWW — review reconstruction

Upload the entire `kek-1992-review` folder to the root of the GitHub Pages repository.

Expected URL after upload:
https://neko-56.github.io/kek-1992-review/

Files:
- index.html              research/review landing page
- cern-view.html          provisional CERN-side terminal rendering
- kek-2002-view.html      rendering based on later KEK reconstruction imagery
- kek-local.html          intentionally unresolved until confirmation
- original-source.html    reconstructed historical HTML source
- references.html         source materials and official/public links
- link-status.html        link verification status and methodology
- LINK_AUDIT.md           dated human-readable audit record
- link-audit.json         machine-readable audit summary
- style.css
- terminal.js

Privacy/discoverability:
- all HTML pages include noindex,nofollow,noarchive
- do NOT link this folder from the public NEKO56 top page
- this is not access control: anyone who knows the URL can view it

Historical source reconstruction:
The HTML shown in original-source.html is based on the preserved KEK Entry Point
reconstruction and later quoted source. It should be described as a reconstruction,
not as a guaranteed byte-for-byte copy of the 1992 file.

Update v0.2:
- added explicit number + RETURN operation note
- added references.html with source links and evidence notes

Update v0.3:
- added Yohei Morita lecture video (YouTube) to source materials
- distinguishes personal retrospective testimony from contemporaneous documents

Update v0.4:
- treats KEK 2002 official article as confirmation that Morita worked from the CERN terminal room
- separates that confirmed fact from still-unknown terminal/browser/display details
- updates source notes and question wording accordingly

Update v0.5:
- added dated link audit (2026-10-20)
- distinguishes 404 from bot protection, timeout, 503, and unverified states
- records historical links 1/4/5 as current-mirror 404 without claiming they did not exist in 1992
- verifies all local relative href/src references
- adds LINK_AUDIT.md and link-audit.json

Update v0.6:
- rebuilt CERN VIEW as an IBM 3270-class 24x80 monochrome terminal candidate
- rebuilt KEK LOCAL VIEW around DECstation 5000/125 + ULTRIX/DECwindows + Line Mode Browser
- uses 1280x1024 5:4 virtual raster for the KEK display candidate
- uses DECterm 80x24 and DEC fixed-width font metrics as the primary local-display hypothesis
- adds per-view specification, evidence, confidence, and substitution notes
- adds DISPLAY_RECONSTRUCTION_NOTES.md

Update v0.7:
- uses GitHub cern-hackdays/lmb mirror as the primary link for CERN's 2013 Line Mode Browser reconstruction
- retains line-mode.cern.ch only as the unavailable/unstable historical official URL
- adds direct links to screenshot.png, public/, and font/ in the mirror

Update v0.9:
- emulator Phase 2
- CERN default changed to hardware-unknown Morita terminal; IBM RS/6000 is a separate 2013 reference profile
- IBM 3270 moved to alternate hypothesis
- KEK DECterm default candidate corrected to dark text on light background
- historical-style dynamic prompts, title line, Next/Previous/Recall/Source and character-by-character reveal
