const assert=require("assert");
const fs=require("fs");
const path=require("path");

const base=path.resolve(__dirname,"..");
const fixture=fs.readFileSync(path.join(base,"fixtures.js"),"utf8");
assert.ok(!fixture.includes("KEK Entry Point"),"historical fixture must not contain unverified KEK Entry Point");

const html=fs.readFileSync(path.join(base,"index.html"),"utf8");
assert.ok(html.includes('id="displayScroll"'),"display scroll container must exist");
assert.ok(html.includes('id="fullscreen"'),"fullscreen control must exist");
assert.ok(!html.includes("CRT effects"),"normal UI must not present CRT blur/effects as historical display");
assert.ok(html.includes("100%未満に縮小しない"),"no-shrink display rule must be visible");

const app=fs.readFileSync(path.join(base,"src","app.js"),"utf8");
assert.ok(app.includes("Math.max(1"),"auto scale must never shrink below 100%");
assert.ok(app.includes("requestFullscreen"),"fullscreen path must be implemented");

const renderer=fs.readFileSync(path.join(base,"src","display-renderer.js"),"utf8");
assert.ok(renderer.includes("presentationScale"),"renderer must render at selected presentation scale");
assert.ok(renderer.includes("ctx.shadowBlur=0"),"normal display must not blur glyphs");

console.log("PASS: Phase 4 display-size / sharpness / title-discipline regression");
