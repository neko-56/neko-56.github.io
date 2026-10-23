const assert=require("assert");
const fs=require("fs");
const path=require("path");
const vm=require("vm");
const base=path.resolve(__dirname,"..");

const profiles=fs.readFileSync(path.join(base,"src","profiles.js"),"utf8");
const renderer=fs.readFileSync(path.join(base,"src","display-renderer.js"),"utf8");
const app=fs.readFileSync(path.join(base,"src","app.js"),"utf8");
const html=fs.readFileSync(path.join(base,"index.html"),"utf8");

const sandbox={};
vm.createContext(sandbox);
vm.runInContext(profiles,sandbox);
const kp=sandbox.TerminalProfiles.kek_decterm_vrt19_candidate;
assert.strictEqual(kp.cols*kp.cell.w,640,"80 columns × 8 pixels must equal 640");
assert.strictEqual(kp.rows*kp.cell.h,360,"24 rows × 15 pixels must equal 360");
assert.deepStrictEqual(
  {w:kp.terminalRect.w,h:kp.terminalRect.h},
  {w:640,h:360},
  "terminal rectangle must equal the native glyph plane"
);
const wr=kp.windowChrome.rect,tr=kp.terminalRect;
assert.ok(tr.x>=wr.x && tr.y>=wr.y && tr.x+tr.w<=wr.x+wr.w && tr.y+tr.h<=wr.y+wr.h,
  "terminal plane must be contained by candidate window chrome without scaling");
assert.deepStrictEqual(Array.from(kp.windowChrome.menuItems),["File","Edit","Commands","Options","Print","Help"],
  "DECterm menu ordering changed");
assert.strictEqual(kp.screenModeDefault,"light_on_dark");
assert.strictEqual(kp.verticalScrollbar,false);
assert.strictEqual(kp.phosphorGlow,false);
assert.strictEqual(kp.scanlineAlpha,0);
assert.strictEqual(kp.crtVignette,false);

assert.ok(profiles.includes('terminalRect: { x: 320, y: 270, w: 640, h: 360 }'),
  "verified 80x24 × 8x15 terminal plane must remain exactly 640x360");
assert.ok(profiles.includes('screenModeDefault: "light_on_dark"'),
  "ULTRIX dxterm documented default screen mode must be represented");
assert.ok(profiles.includes('verticalScrollbar: false'),
  "ULTRIX dxterm documented default vertical scrollbar state must be represented");
assert.ok(profiles.includes('phosphorGlow: false, scanlineAlpha: 0, crtVignette: false'),
  "KEK candidate must not carry latent CRT blur/scanline/vignette flags");
assert.ok(profiles.includes('["File", "Edit", "Commands", "Options", "Print", "Help"]'),
  "documented DECterm menu bar must be represented");
assert.ok(profiles.includes('shrink-to-icon') && profiles.includes('push-to-back'),
  "documented dxwm banner functions must be preserved in evidence notes");

assert.ok(renderer.includes('_drawDECWindowsChrome'),"DECwindows candidate chrome renderer missing");
assert.ok(renderer.includes('Documented banner functions: shrink, title, push-to-back, resize.'),
  "renderer must keep banner structure explicit");
assert.ok(renderer.includes('ctx.fillRect(r.x,r.y,r.w,r.h)'),
  "terminal plane must be painted independently from chrome");
assert.ok(renderer.includes('this.fontBackend.drawChar(ctx,ch,x,baseY,1,palette.foreground)'),
  "BDF glyph pixels must stay at scale 1");
assert.ok(!renderer.includes('shadowBlur=' ) || renderer.includes('shadowBlur=0'),
  "historical screen must not add blur");

assert.ok(html.includes('id="screenMode"'),"screen mode evidence switch missing");
assert.ok(app.includes('renderer.setScreenMode(screenModeSelect.value)'),
  "screen mode switch must be connected to renderer");

console.log("PASS: Phase 6.1 DECterm chrome / screen-mode evidence");
