const assert=require("assert");
const F=require("../src/font-backend.js");
const sample=`STARTFONT 2.1
FONT -TEST-Terminal-Medium-R-Normal--8-80-75-75-C-80-ISO8859-1
FONTBOUNDINGBOX 8 8 0 -2
STARTPROPERTIES 2
FONT_ASCENT 6
FONT_DESCENT 2
ENDPROPERTIES
CHARS 2
STARTCHAR SPACE
ENCODING 32
SWIDTH 500 0
DWIDTH 8 0
BBX 0 0 0 0
BITMAP
ENDCHAR
STARTCHAR A
ENCODING 65
SWIDTH 500 0
DWIDTH 8 0
BBX 5 7 1 -1
BITMAP
70
88
88
F8
88
88
88
ENDCHAR
ENDFONT`;
const f=F.BDFFont.parse(sample,"fixture.bdf");
assert.strictEqual(f.glyphs.size,2);
assert.strictEqual(f.cellWidth,8);
assert.strictEqual(f.cellHeight,8);
assert.strictEqual(f.ascent,6);
assert.strictEqual(f.descent,2);
assert.strictEqual(f.glyphForChar("A").bbx[0],5);
assert.strictEqual(f.summary().source,"fixture.bdf");
console.log("PASS: BDF parser / integer-cell metrics");
