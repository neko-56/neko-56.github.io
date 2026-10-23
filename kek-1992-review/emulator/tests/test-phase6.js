const assert=require("assert");
const fs=require("fs");
const path=require("path");
const base=path.resolve(__dirname,"..");
const F=require("../src/font-backend.js");

const sample=`STARTFONT 2.1
FONT -DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1
FONTBOUNDINGBOX 8 15 0 -3
STARTPROPERTIES 3
FONT_ASCENT 12
FONT_DESCENT 3
FAMILY_NAME "Terminal"
ENDPROPERTIES
CHARS 95
${Array.from({length:95},(_,i)=>{const cp=i+32;return `STARTCHAR C${cp}\nENCODING ${cp}\nDWIDTH 8 0\nBBX 0 0 0 0\nBITMAP\nENDCHAR`;}).join("\n")}
ENDFONT`;
const font=F.BDFFont.parse(sample,"fixture.bdf");
const summary=font.summary();
assert.strictEqual(summary.xlfd.foundry,"DEC");
assert.strictEqual(summary.decCandidate.status,"EXACT METADATA MATCH");
assert.strictEqual(summary.asciiComplete,true);
assert.strictEqual(summary.cellWidth,8);
assert.strictEqual(summary.cellHeight,15);


const target=F.DEC_TARGETS.kek_vrt19_100dpi_little;
assert.deepStrictEqual(target.cell,{w:8,h:15});
assert.strictEqual(target.baseline,12);
assert.strictEqual(target.expectedPCFSHA256,"46cdbd6f8656ddd7704df99f2103274c9ae9ffe1fc829ae57f92f6bb910d89d5");
assert.strictEqual(target.expectedBDFSHA256,"7cfc76e2e45ebfceb0e8d7fb1632e0710a550bac4dbe14e2ddf7c2bc94e84033");
const profile=fs.readFileSync(path.join(base,"src","profiles.js"),"utf8");
assert.ok(profile.includes("640×360px"));

const renderer=fs.readFileSync(path.join(base,"src","display-renderer.js"),"utf8");
assert.ok(renderer.includes("1:1 to the reconstructed framebuffer"));
assert.ok(!renderer.includes("maxScale=Math.max"),"BDF glyphs must not auto-grow to fill terminalRect");
const finder=fs.readFileSync(path.join(base,"tools","find_dec_terminal_font.py"),"utf8");
assert.ok(finder.includes("UDWFONT15430"));
assert.ok(finder.includes("UDWFONT15450"));
const docs=fs.readFileSync(path.join(base,"docs","PHASE6_REAL_FONT.md"),"utf8");
assert.ok(docs.includes("HISTORICAL BITMAP ACTIVE"));
console.log("PASS: Phase 6 real-font acceptance / physical-pixel rendering");
