const assert=require("assert");
const fs=require("fs");
const path=require("path");
const F=require("../src/font-backend.js");

const base=path.resolve(__dirname,"..");
const doc=fs.readFileSync(path.join(base,"docs","PHASE6_2_FONT_SELECTION.md"),"utf8");
const evidence=JSON.parse(fs.readFileSync(path.join(base,"evidence","XWS_FONT_SELECTION_EVIDENCE.json"),"utf8"));

// Phase 6.2's durable result is server-specific font-density behavior,
// not a KEK-machine-wide ranking. Phase 6.3 supersedes that ranking.
const d75=F.DEC_TARGETS.kek_75dpi_normal;
const d100=F.DEC_TARGETS.kek_vrt19_100dpi_little;
assert.strictEqual(d75.expected.resolutionX,75);
assert.strictEqual(d75.expected.pointSize,140);
assert.deepStrictEqual(d75.cell,{w:8,h:15});
assert.strictEqual(d100.expected.resolutionX,100);
assert.strictEqual(d100.expected.pointSize,100);
assert.deepStrictEqual(d100.cell,{w:8,h:15});

const asset=F.DEC_PUBLIC_ASSETS.xconsortium_terminal_v22_verified;
assert.strictEqual(asset.metadataTargetId,"kek_75dpi_normal");
assert.strictEqual(asset.rasterEquivalentTargetId,"kek_vrt19_100dpi_little");
assert.deepStrictEqual(asset.rasterMatch,{matched:195,total:195,asciiMatched:95,asciiTotal:95});

assert.ok(doc.includes("-fd 100 -dpi 100"));
assert.ok(doc.includes("UDWFONT430"));
assert.ok(doc.includes("UDWFONT15430"));
assert.ok(doc.includes("195/195"));
assert.ok(String(evidence.status).includes("SUPERSEDED"));
assert.strictEqual(evidence.runtime_default.scope,"Xws SERVER DEFAULT ONLY; NOT A KEK-MACHINE DEFAULT");

console.log("PASS: Phase 6.2 server-specific density facts preserved; KEK runtime ranking marked superseded");
