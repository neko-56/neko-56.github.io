const assert=require("assert");
const crypto=require("crypto");
const fs=require("fs");
const path=require("path");
const F=require("../src/font-backend.js");

(async()=>{
  const base=path.resolve(__dirname,"..");
  const assetPath=path.join(base,"assets","fonts","dec-terminal","dec-terminal-xconsortium-verified.bdf");
  const data=fs.readFileSync(assetPath);
  const text=data.toString("utf8");
  const parsed=F.BDFFont.parse(text,"bundled-test");
  const sha=crypto.createHash("sha256").update(data).digest("hex");
  const asset=F.DEC_PUBLIC_ASSETS.xconsortium_terminal_v22_verified;

  assert.strictEqual(sha,asset.sha256);
  assert.strictEqual(data.length,22065);
  assert.strictEqual(sha,"b93ab33ead159d11a4e503ab71c72b7b51802a35de27d5a326ab4648f448f081", "must be the byte-exact public term14.bdf");
  assert.strictEqual(parsed.glyphs.size,195);
  assert.strictEqual(parsed.cellWidth,8);
  assert.strictEqual(parsed.cellHeight,15);
  assert.strictEqual(parsed.ascent,12);
  assert.strictEqual(parsed.descent,3);
  for(let cp=32;cp<=126;cp++)assert.ok(parsed.glyphs.has(cp),`missing ASCII ${cp}`);
  assert.ok(text.includes("full and unrestricted irrevocable, world-wide"));
  assert.ok(text.includes('DECterm Fonts V2.2, 11-Nov-1991'));

  const loaded=await F.loadBDFBytes(new Uint8Array(data),"bundled-runtime-test");
  const summary=loaded.summary();
  assert.strictEqual(summary.provenanceId,"xconsortium_terminal_v22_verified");
  assert.strictEqual(summary.metadataTargetId,"kek_75dpi_normal");
  assert.strictEqual(summary.rasterEquivalentTargetId,"kek_vrt19_100dpi_little");
  assert.deepStrictEqual(summary.rasterMatch,{matched:195,total:195,asciiMatched:95,asciiTotal:95});

  const profiles=fs.readFileSync(path.join(base,"src","profiles.js"),"utf8");
  const app=fs.readFileSync(path.join(base,"src","app.js"),"utf8");
  const index=fs.readFileSync(path.join(base,"index.html"),"utf8");
  assert.ok(profiles.includes('bundledFontAssetId: "xconsortium_terminal_v22_verified"'));
  assert.ok(app.includes("HistoricalFonts.loadBDFURL(asset.url"));
  assert.ok(app.includes("match.total===195"));
  assert.ok(index.includes("ローカルフォントの選択は不要です"));
  assert.ok(!index.includes("terminal10.bdf</code> を選択してください"));

  console.log("PASS: GitHub Pages auto-loads licensed DEC Terminal raster; no local font required");
})().catch(err=>{console.error(err);process.exit(1);});
