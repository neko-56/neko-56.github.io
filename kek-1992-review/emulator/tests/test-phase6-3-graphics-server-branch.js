const assert=require("assert");
const fs=require("fs");
const path=require("path");
const vm=require("vm");
const F=require("../src/font-backend.js");

const base=path.resolve(__dirname,"..");
const profilesText=fs.readFileSync(path.join(base,"src","profiles.js"),"utf8");
const app=fs.readFileSync(path.join(base,"src","app.js"),"utf8");
const doc=fs.readFileSync(path.join(base,"docs","PHASE6_3_GRAPHICS_SERVER_BRANCH.md"),"utf8");
const guide=fs.readFileSync(path.join(base,"docs","KEK_GRAPHICS_OPTION_IDENTIFICATION_JA.md"),"utf8");
const evidence=JSON.parse(fs.readFileSync(path.join(base,"evidence","GRAPHICS_SERVER_FONT_BRANCH_EVIDENCE.json"),"utf8"));
const sandbox={};
vm.createContext(sandbox);
vm.runInContext(profilesText,sandbox);
const p=sandbox.TerminalProfiles.kek_decterm_vrt19_candidate;

assert.ok(!Object.prototype.hasOwnProperty.call(p,"runtimeDefaultFontId"));
assert.ok(p.runtimeSelectionStatus.includes("UNRESOLVED"));
assert.ok(p.graphicsOptionStatus.includes("PX 2D") && p.graphicsOptionStatus.includes("PXG 3D"));
assert.strictEqual(p.runtimeFontBranches.length,2);

const b75=p.runtimeFontBranches.find(x=>x.id==="xws_75dpi");
const b100=p.runtimeFontBranches.find(x=>x.id==="xwst3d_100dpi");
assert.ok(b75 && b100);
assert.strictEqual(b75.xServer,"Xws");
assert.strictEqual(b75.defaultDensity,75);
assert.strictEqual(b75.fontId,"kek_75dpi_normal");
assert.strictEqual(b75.dectermLittlePointSize,14);
assert.strictEqual(b100.defaultDensity,100);
assert.strictEqual(b100.fontId,"kek_vrt19_100dpi_little");
assert.strictEqual(b100.dectermLittlePointSize,10);

assert.deepStrictEqual(F.DEC_TARGETS[b75.fontId].cell,{w:8,h:15});
assert.deepStrictEqual(F.DEC_TARGETS[b100.fontId].cell,{w:8,h:15});
const asset=F.DEC_PUBLIC_ASSETS.xconsortium_terminal_v22_verified;
assert.strictEqual(asset.metadataTargetId,b75.fontId);
assert.strictEqual(asset.rasterEquivalentTargetId,b100.fontId);
assert.deepStrictEqual(asset.rasterMatch,{matched:195,total:195,asciiMatched:95,asciiTotal:95});

assert.ok(app.includes("Runtime font path:"));
assert.ok(app.includes("runtimeFontBranches"));
assert.ok(!app.includes("Documented Xws runtime default:"));
assert.ok(doc.includes("PM322-KN"));
assert.ok(doc.includes("PM323-KN"));
assert.ok(doc.includes("PMAG-CA"));
assert.ok(doc.includes("PMAG-DA"));
assert.ok(doc.includes("195/195"));
assert.ok(guide.includes("/etc/ttys"));
assert.ok(guide.includes("xset q"));
assert.strictEqual(evidence.status,"KEK RUNTIME BRANCH UNRESOLVED; SERVER-SPECIFIC DEFAULTS DOCUMENTED");
assert.strictEqual(evidence.contemporary_package_branches.length,2);
assert.strictEqual(evidence.glyph_bridge.mismatches,0);
assert.strictEqual(evidence.supersedes.phase,"6.2");

console.log("PASS: Phase 6.3 models PX/Xws 75dpi and Xwst3d 100dpi as unresolved KEK runtime branches");
