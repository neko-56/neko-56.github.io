const assert=require("assert");
const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
const F=require("../src/font-backend.js");

function asciiGlyphName(ch){return F.bdfGlyphNameForASCII(ch);}

function make3270Fixture(registry="3270cg"){
  const glyphs=[];
  for(let cp=32;cp<=126;cp++){
    const ch=String.fromCharCode(cp);
    const name=asciiGlyphName(ch);
    // Deliberately keep glyph encodings away from ASCII code points.
    glyphs.push({name,enc:200+glyphs.length});
  }
  while(glyphs.length<431)glyphs.push({name:`dummy${glyphs.length}`,enc:1000+glyphs.length});
  const out=[
    "STARTFONT 2.1","FONT 3270-test","SIZE 14 72 72","FONTBOUNDINGBOX 9 14 0 -3",
    "STARTPROPERTIES 4",`CHARSET_REGISTRY \"${registry}\"`,"CHARSET_ENCODING \"1a\"","FONT_ASCENT 11","FONT_DESCENT 3","ENDPROPERTIES",
    `CHARS ${glyphs.length}`
  ];
  for(const g of glyphs){
    out.push(`STARTCHAR ${g.name}`,`ENCODING ${g.enc}`,"SWIDTH 562 0","DWIDTH 9 0","BBX 9 14 0 -3","BITMAP");
    out.push("0000","0000","0800","1400","2200","4100","4100","7F00","4100","4100","4100","0000","0000","0000","ENDCHAR");
  }
  out.push("ENDFONT");
  return out.join("\n")+"\n";
}

(()=>{
  const asset=F.PUBLIC_FONT_ASSETS.x3270_3270_14;
  const structuralAsset=Object.assign({},asset,{sha256:""});
  const good=F.BDFFont.parse(make3270Fixture(),"synthetic x3270 structural fixture");
  F.validatePublicAssetBackend(structuralAsset,good);
  assert.strictEqual(good.summary().glyphCount,431);
  assert.strictEqual(good.summary().cellWidth,9);
  assert.strictEqual(good.summary().cellHeight,14);
  assert.strictEqual(good.summary().asciiComplete,true);


  const localPath=path.join(__dirname,"../assets/fonts/ibm3270/3270.bdf");
  assert.ok(fs.existsSync(localPath),"packaged IBM 3270 BDF must exist");
  const localBytes=fs.readFileSync(localPath);
  const localText=localBytes.toString("utf8");
  const local=F.BDFFont.parse(localText,"assets/fonts/ibm3270/3270.bdf");
  local.fileSHA256=crypto.createHash("sha256").update(localBytes).digest("hex");
  local.byteLength=localBytes.length;
  F.validatePublicAssetBackend(asset,local);
  assert.strictEqual(local.summary().glyphCount,431);
  assert.strictEqual(local.summary().asciiComplete,true);
  assert.strictEqual(local.fileSHA256,asset.sha256);

    const wrong=F.BDFFont.parse(make3270Fixture("ISO8859"),"wrong registry fixture");
  assert.throws(()=>F.validatePublicAssetBackend(structuralAsset,wrong),/charset registry/i);

  console.log("PASS: bundled x3270 asset exists locally and passes SHA-256 / 431 glyph / 9x14 / 3270cg / ASCII validation");
})();
