const assert=require("assert");
const fs=require("fs");
const path=require("path");
const F=require("../src/font-backend.js");
const P=require("../src/profiles.js");

(()=>{
  const a=F.PUBLIC_FONT_ASSETS;
  const p=P.TerminalProfiles;

  assert.strictEqual(p.kek_decterm_vrt19_candidate.publicFontAssetId,"xconsortium_terminal_v22_verified");
  assert.strictEqual(p.kek_console_fullscreen_candidate.publicFontAssetId,"xconsortium_terminal_v22_verified");
  assert.strictEqual(p.cern_rs6000_reference.publicFontAssetId,"meyrin_cern_rs6000");
  assert.strictEqual(p.cern_sun4_reference.publicFontAssetId,"x11_fixed_6x13");
  assert.strictEqual(p.cern_next_x11_lmb_green.publicFontAssetId,"x11_fixed_6x13");

  assert.ok(/Open Font License 1\.1/i.test(a.meyrin_cern_rs6000.licenseName));
  assert.ok(/public-domain/i.test(a.x11_fixed_6x13.licenseName));
  assert.strictEqual(a.x11_fixed_6x13.kind,"bdf");
  assert.strictEqual(a.meyrin_cern_rs6000.kind,"vector");

  // Do not manufacture a host-specific font when the display terminal is not known.
  assert.ok(!p.cern_priam_vax_reference.publicFontAssetId,"VAX host alone must not imply a terminal font");
  // Native NeXT profile records Ohlfs as the historical standard but does not pretend
  // that an unverified redistributable original Ohlfs raster has been pinned.
  assert.ok(/Ohlfs/i.test(p.cern_nextstep_terminal_lmb.fontCandidate));
  assert.ok(!p.cern_nextstep_terminal_lmb.publicFontAssetId);
  // 3270 uses x3270's own pinned 14pt bitmap; do not silently fall back to Courier.
  assert.ok(/3270/i.test(p.cern_3270_alternate.fontCandidate));
  assert.strictEqual(p.cern_3270_alternate.publicFontAssetId,"x3270_3270_14");
  assert.strictEqual(a.x3270_3270_14.kind,"bdf");
  assert.strictEqual(a.x3270_3270_14.glyphCount,431);
  assert.deepStrictEqual(a.x3270_3270_14.cell,{w:9,h:14});
  assert.strictEqual(a.x3270_3270_14.expectedCharsetRegistry,"3270cg");
  assert.strictEqual(a.x3270_3270_14.url,"assets/fonts/ibm3270/3270.bdf");
  assert.strictEqual(a.x3270_3270_14.sha256,"3d71ea77ade51a7d2d6de326bd98fd14724b0e0086ecc0bd2d5083483d34838b");
  assert.ok(fs.existsSync(path.join(__dirname,"../assets/fonts/ibm3270/3270.bdf")),"bundled 3270.bdf must exist");

  const src=fs.readFileSync(path.join(__dirname,"../src/profiles.js"),"utf8");
  const defs=(src.match(/\bkek_decterm_vrt19_candidate\s*:/g)||[]).length;
  assert.strictEqual(defs,1,"DECterm profile key must be defined exactly once");

  console.log("PASS: v0.52 machine/font asset matrix uses pinned x3270 bitmap and contains no fabricated host-font mappings");
})();
