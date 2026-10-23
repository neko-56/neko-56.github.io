const assert=require("assert");
const fs=require("fs");
const path=require("path");
const F=require("../src/font-backend.js");
const P=require("../src/profiles.js");

(()=>{
  const base=path.resolve(__dirname,"..");
  const asset=F.DEC_PUBLIC_ASSETS.xconsortium_terminal_v22_verified;
  const profile=P.TerminalProfiles.kek_decterm_vrt19_candidate;
  const index=fs.readFileSync(path.join(base,"index.html"),"utf8");

  // The old public-review rule "do not distribute/load the DEC font" is abolished.
  // Correctness now means that the verified public DEC/X Consortium artifact is
  // explicitly selected by the DECterm profile and automatically loaded at runtime.
  assert.ok(asset,"verified DEC public asset must be registered");
  assert.strictEqual(asset.kind,"bdf");
  assert.strictEqual(asset.sha256,"d9daba2437558c3a75bfba33b8fb21a78063e4f42bede5d61a53c9a4d5887ae7");
  assert.strictEqual(asset.glyphCount,195);
  assert.deepStrictEqual(asset.cell,{w:8,h:15});
  assert.strictEqual(asset.url,"assets/fonts/dec/term14.bdf","DEC asset must load from the bundled local BDF");
  assert.ok(/permissive/i.test(asset.licenseName),"asset metadata must record the permissive license grant");

  assert.strictEqual(profile.publicFontAssetId,"xconsortium_terminal_v22_verified");
  assert.ok(index.includes("自動読込"),"UI must state that the anchored historical font is auto-loaded");
  assert.ok(index.includes("配布しない')制約") || index.includes("配布しない」制約") || index.includes("『配布しない』制約"),"UI must explicitly record removal of the old non-distribution rule");
  assert.ok(!index.includes("通常表示はフォールバック"),"DECterm must not be described as fallback-only");

  console.log("PASS: DECterm selects the verified public DEC/X Consortium BDF and auto-loads it at runtime");
})();
