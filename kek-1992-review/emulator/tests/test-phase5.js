const assert=require("assert");
const fs=require("fs");
const path=require("path");
const base=path.resolve(__dirname,"..");

const profiles=fs.readFileSync(path.join(base,"src","profiles.js"),"utf8");
assert.ok(profiles.includes("kek_vrt19_100dpi_little"),"KEK profile must declare exact target");
assert.ok(profiles.includes("14-100-100-100-C-80"),"100dpi media-verification XLFD target required");

const html=fs.readFileSync(path.join(base,"index.html"),"utf8");
assert.ok(html.includes('id="fontVerify"'),"font verification panel required");

const app=fs.readFileSync(path.join(base,"src","app.js"),"utf8");
assert.ok(app.includes("fontVerificationHTML"),"font verifier UI required");
assert.ok(app.includes("SHA-256"),"font fingerprint must be surfaced");

console.log("PASS: Phase 5 font-target verification wiring");
