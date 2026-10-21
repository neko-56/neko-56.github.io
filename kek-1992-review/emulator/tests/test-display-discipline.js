const assert=require("assert");
const fs=require("fs");
const path=require("path");
const LMB=require("../src/lmb-core.js");

const html=`<HTML><HEAD><TITLE>KEK Entry Point</TITLE></HEAD><BODY><H1>KEK Information</H1><P>Hello.</P><A HREF="missing.html">Missing</A></BODY></HTML>`;
const f=LMB.formatDocument(html,{width:80,showDocumentTitle:false});
assert.ok(!f.lines.some(x=>x.includes("KEK Entry Point")),"TITLE must not be injected into historical screen");
assert.ok(f.lines.some(x=>x.includes("KEK INFORMATION")),"H1 remains");

const e=new LMB.Engine(html,{width:80,rows:24,formatter:{showDocumentTitle:false}});
assert.ok(!e.screen("").some(x=>x.includes("KEK Entry Point")),"Engine screen must not show internal title");
const before=e.screen("").join("\n");
e.execute("1");
const after=e.screen("").join("\n");
assert.strictEqual(after,before,"unavailable link content must not replace historical pixels with an invented offline page");
assert.ok(e.pendingNavigation&&e.pendingNavigation.target==="missing.html","unresolved request must remain available to the outer research UI");

const coreSource=fs.readFileSync(path.join(__dirname,"../src/lmb-core.js"),"utf8");
for(const forbidden of [
  "Target content is not bundled in this offline reconstruction",
  "Network retrieval is intentionally disabled in this offline reconstruction",
  "Index retrieval is not bundled in this offline reconstruction",
  "Reached with NEXT from the parent reference list",
  "Reached with PREVIOUS from the parent reference list"
]){
  assert.ok(!coreSource.includes(forbidden),`modern research prose must not exist in historical framebuffer path: ${forbidden}`);
}
console.log("PASS: no non-historical document title or offline-status injection");
