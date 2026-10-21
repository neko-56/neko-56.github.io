const assert=require("assert");
const F=require("../src/font-backend.js");

const sample=`STARTFONT 2.1
FONT -DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1
FONTBOUNDINGBOX 8 15 0 -3
STARTPROPERTIES 3
FONT_ASCENT 12
FONT_DESCENT 3
FAMILY_NAME "Terminal"
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
BBX 7 11 0 0
BITMAP
38
44
82
82
FE
82
82
82
82
82
82
ENDCHAR
ENDFONT`;

const f=F.BDFFont.parse(sample,"fixture-dec-terminal.bdf");
assert.strictEqual(f.glyphs.size,2);
assert.strictEqual(f.cellWidth,8);
assert.strictEqual(f.cellHeight,15);
assert.strictEqual(f.ascent,12);
assert.strictEqual(f.descent,3);

const x=F.parseXLFD(f.name);
assert.strictEqual(x.family,"Terminal");
assert.strictEqual(x.pixelSize,14);
assert.strictEqual(x.pointSize,100);
assert.strictEqual(x.resolutionX,100);
assert.strictEqual(x.averageWidth,80);

const cls=F.classifyDECtermFont(f);
assert.ok(cls.best);
assert.strictEqual(cls.best.target.id,"kek_vrt19_100dpi_little");
assert.strictEqual(cls.best.result.status,"EXACT METADATA MATCH");
assert.strictEqual(cls.best.result.score,1);

console.log("PASS: BDF parser / XLFD parser / DECterm exact candidate match");
