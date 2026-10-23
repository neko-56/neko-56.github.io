const assert=require("assert");
const F=require("../src/font-backend.js");

(()=>{
  // Synthetic miniature of x3270's nonstandard CG ordering:
  // encoding 65 is deliberately *not* "A"; STARTCHAR A lives at 160.
  // The backend must resolve by glyph name when CHARSET_REGISTRY is 3270cg.
  const bdf=`STARTFONT 2.1
FONT 3270-test
SIZE 14 72 72
FONTBOUNDINGBOX 9 14 0 -3
STARTPROPERTIES 4
CHARSET_REGISTRY "3270cg"
CHARSET_ENCODING "1a"
FONT_ASCENT 11
FONT_DESCENT 3
ENDPROPERTIES
CHARS 5
STARTCHAR wrong65
ENCODING 65
DWIDTH 9 0
BBX 9 14 0 -3
BITMAP
0000
0000
0000
0000
0000
0000
0000
0000
0000
0000
0000
0000
0000
0000
ENDCHAR
STARTCHAR space
ENCODING 16
DWIDTH 9 0
BBX 9 14 0 -3
BITMAP
0000
0000
0000
0000
0000
0000
0000
0000
0000
0000
0000
0000
0000
0000
ENDCHAR
STARTCHAR question
ENCODING 24
DWIDTH 9 0
BBX 9 14 0 -3
BITMAP
0000
1E00
2100
2100
0200
0400
0800
0800
0000
0000
0800
0000
0000
0000
ENDCHAR
STARTCHAR A
ENCODING 160
DWIDTH 9 0
BBX 9 14 0 -3
BITMAP
0000
0000
0800
1400
2200
4100
4100
7F00
4100
4100
4100
0000
0000
0000
ENDCHAR
STARTCHAR exclam
ENCODING 25
DWIDTH 9 0
BBX 9 14 0 -3
BITMAP
0000
0800
0800
0800
0800
0800
0800
0800
0000
0000
0800
0000
0000
0000
ENDCHAR
ENDFONT`;
  const f=F.BDFFont.parse(bdf,"synthetic x3270 mapping test");
  assert.strictEqual(f.charsetRegistry,"3270cg");
  assert.strictEqual(f.glyphForChar("A").name,"A","3270cg must resolve ASCII A by STARTCHAR name");
  assert.strictEqual(f.glyphForChar("A").encoding,160,"must not use encoding 65 in 3270 CG order");
  assert.strictEqual(f.glyphForChar("!").name,"exclam");
  assert.strictEqual(f.glyphForChar("?").name,"question");
  assert.strictEqual(f.glyphForChar(" ").name,"space");
  console.log("PASS: x3270 3270cg ASCII mapping resolves STARTCHAR names before numeric encoding");
})();
