const assert=require("assert");
const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
const F=require("../src/font-backend.js");
const P=require("../src/profiles.js");

function sha256(p){return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");}

(()=>{
  const root=path.join(__dirname,"..");
  const a=F.PUBLIC_FONT_ASSETS;
  const p=P.TerminalProfiles;
  const ids=["xconsortium_terminal_v22_verified","meyrin_cern_rs6000","x11_fixed_6x13","x3270_3270_14"];
  for(const id of ids){
    const asset=a[id];
    assert.ok(asset,`missing asset ${id}`);
    assert.ok(!/^https?:\/\//i.test(asset.url),`${id} runtime URL must be package-local`);
    const fp=path.join(root,asset.url);
    assert.ok(fs.existsSync(fp),`${id} local file missing: ${asset.url}`);
    assert.strictEqual(sha256(fp),asset.sha256,`${id} SHA-256 mismatch`);
  }

  assert.strictEqual(a.xconsortium_terminal_v22_verified.glyphCount,195);
  assert.deepStrictEqual(a.xconsortium_terminal_v22_verified.cell,{w:8,h:15});
  assert.strictEqual(a.x11_fixed_6x13.glyphCount,4121);
  assert.deepStrictEqual(a.x11_fixed_6x13.cell,{w:6,h:13});
  assert.strictEqual(a.x3270_3270_14.glyphCount,431);
  assert.deepStrictEqual(a.x3270_3270_14.cell,{w:9,h:14});

  assert.strictEqual(p.kek_decterm_vrt19_candidate.framebufferWidth,1280);
  assert.strictEqual(p.kek_decterm_vrt19_candidate.framebufferHeight,1024);
  assert.deepStrictEqual(p.kek_decterm_vrt19_candidate.terminalRect,{x:320,y:270,w:640,h:360});
  assert.strictEqual(p.kek_decterm_vrt19_candidate.monitorFrame.shell,"dec-vrt19");

  assert.strictEqual(p.cern_sun4_reference.framebufferWidth,1152);
  assert.strictEqual(p.cern_sun4_reference.framebufferHeight,900);
  assert.deepStrictEqual(p.cern_sun4_reference.terminalRect,{x:336,y:294,w:480,h:312});
  assert.strictEqual(p.cern_sun4_reference.monitorFrame.shell,"sun-19");

  assert.ok(/VAX 8530/i.test(p.cern_priam_vax_reference.label));
  assert.ok(!p.cern_priam_vax_reference.publicFontAssetId,"PRIAM host identity must not fabricate a terminal font");
  assert.strictEqual(p.cern_priam_vax_reference.comparisonFontAssetId,"x11_fixed_6x13");
  assert.ok(p.cern_priam_vax_reference.monitorAlternatives.some(x=>/DMT2200/.test(x)));
  assert.ok(p.cern_priam_vax_reference.monitorAlternatives.some(x=>/MG200/.test(x)));

  assert.strictEqual(p.cern_nextstep_terminal_lmb.framebufferWidth,1120);
  assert.strictEqual(p.cern_nextstep_terminal_lmb.framebufferHeight,832);
  assert.strictEqual(p.cern_nextstep_terminal_lmb.monitorFrame.shell,"next-megapixel");
  assert.ok(/Ohlfs/i.test(p.cern_nextstep_terminal_lmb.fontCandidate));
  assert.ok(!p.cern_nextstep_terminal_lmb.publicFontAssetId,"do not silently redistribute/claim original Ohlfs");
  assert.strictEqual(p.cern_nextstep_terminal_lmb.requiresHistoricalRaster,true,"native NeXT must fail closed until reconstruction is pinned");
  assert.strictEqual(p.cern_nextstep_terminal_lmb.fontFamily,"Ohlfs","native NeXT must not list Courier/system fallback families");

  assert.strictEqual(p.cern_3270_alternate.monitorFrame.shell,"neutral-plane");
  assert.strictEqual(p.cern_3270_alternate.publicFontAssetId,"x3270_3270_14");

  const reviewCSS=fs.readFileSync(path.join(root,"../review-tabs.css"),"utf8");
  assert.ok(!/width:\s*1000px;height:\s*650px/.test(reviewCSS),"review thumbnails must not force a generic 1000x650 iframe");

  console.log("PASS: v0.54 local font assets, hashes, display geometry, and monitor-frame discipline");
})();
