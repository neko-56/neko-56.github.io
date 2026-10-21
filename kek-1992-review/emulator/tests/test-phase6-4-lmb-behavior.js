const assert=require("assert");
const fs=require("fs");
const path=require("path");
const LMB=require("../src/lmb-core.js");

const period=LMB.behaviorProfile("sep1992_conservative");
const nov=LMB.behaviorProfile("nov1992_documented");
assert.strictEqual(period.promptStyle,"period_1992_feb");
assert.strictEqual(period.interactiveSourcePrefix,false);
assert.strictEqual(nov.interactiveSourcePrefix,true);

const shortHtml=`<HTML><BODY><H1>Error Codes</H1><P>Codes returned by the <A HREF="pfd.html">PFD</A> program include</P><UL><LI>No paper in tray<LI>No people in room<LI>No data in file</UL></BODY></HTML>`;
const short=LMB.formatDocument(shortHtml,{width:80});
assert.strictEqual(short.lines[0]," ERROR CODES","period figure supports uppercase H1 with a one-column left indent");
assert.ok(short.lines.includes(" o No paper in tray"),"period figure supports ' o ' unordered-list marker");

const shortEngine=new LMB.Engine(shortHtml,{width:80,rows:24,behaviorMode:"sep1992_conservative"});
assert.strictEqual(shortEngine.prompt(),"1, Help or Quit:");
const before=shortEngine.current.address;
shortEngine.execute("source");
assert.strictEqual(shortEngine.current.address,before,"SOURCE must not expose current HTML in conservative September mode");

let longBody='<H1>Long Page</H1>';
for(let i=0;i<28;i++) longBody+=`<P>Line ${i+1}</P>`;
longBody+='<P><A HREF="a">A</A> <A HREF="b">B</A> <A HREF="c">C</A></P>';
const longEngine=new LMB.Engine(`<HTML><BODY>${longBody}</BODY></HTML>`,{width:80,rows:24,behaviorMode:"sep1992_conservative"});
assert.strictEqual(longEngine.prompt(),"1-3, Return for more, Help or Quit:","period prompt form must match the February 1992 terminal example");
assert.ok(longEngine.screen("")[23].endsWith("Help or Quit:"));

const novEngine=new LMB.Engine(shortHtml,{width:80,rows:24,behaviorMode:"nov1992_documented"});
const novBefore=novEngine.current.address;
novEngine.execute("source");
assert.strictEqual(novEngine.current.address,novBefore,"November SOURCE prefix alone is documented not to redisplay current source");
assert.notStrictEqual(novEngine.current.address,"internal:source");

const root=path.join(__dirname,"..");
const evidence=JSON.parse(fs.readFileSync(path.join(root,"evidence","LMB_1992_BEHAVIOR_BOUNDS.json"),"utf8"));
assert.strictEqual(evidence.period_prompt.literal,"1-9, Return for more, Help or Quit:");
assert.strictEqual(evidence.source_semantics.command_line_source.minimum_version,"1.2a");
assert.strictEqual(evidence.source_semantics.interactive_source_prefix.minimum_version,"1.3");
assert.strictEqual(evidence.source_semantics.interactive_source_prefix.standalone_displays_current_source,false);

console.log("PASS: Phase 6.4 bounds September 1992 behavior with period prompt evidence and correct SOURCE semantics");
