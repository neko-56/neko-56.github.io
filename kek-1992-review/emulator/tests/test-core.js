const assert=require("assert");
const LMB=require("../src/lmb-core.js");

const html=`<HTML><HEAD><TITLE>KEK Entry Point</TITLE></HEAD><BODY><H1>KEK Information</H1>
Welcome to the KEK WWW server. This server is still in the process of being set up.
<DL><DT><A HREF=a.html>Help</A><DD>On this program, or the <A HREF=b.html>World-Wide Web</A>.
<DT><A HREF=c.html>HEP</A><DD>World Wide Web service provided by other High-Energy Physics institutes.</DL></BODY></HTML>`;

const docs={
  "a.html":`<HTML><BODY><H1>Help</H1><P>Help document.</P></BODY></HTML>`,
  "b.html":`<HTML><BODY><H1>World-Wide Web</H1><P>Project document.</P></BODY></HTML>`,
  "c.html":`<HTML><BODY><H1>HEP</H1><P>Physics document.</P></BODY></HTML>`
};
const resolver=target=>docs[target]?{title:target,html:docs[target],address:target}:null;

const f=LMB.formatDocument(html,{width:80,definitionIndent:24,definitionGap:true});
assert.strictEqual(f.documentTitle,"KEK Entry Point");
assert.ok(!f.lines.some(x=>x.includes("KEK Entry Point")),"unverified TITLE must not be painted into conservative historical screen");
assert.ok(f.lines.some(x=>x.includes("KEK INFORMATION")),"historical H1 remains visible");
assert.strictEqual(f.links.length,3);
assert.ok(f.lines.some(x=>x.includes("Help[1]")));
assert.ok(f.lines.some(x=>x.includes("World-Wide Web[2]")));
assert.ok(f.lines.some(x=>x.trim()==="[End]"));
assert.ok(f.lines.every(x=>x.length<=80));

const engine=new LMB.Engine(html,{width:80,rows:24,resolveDocument:resolver});
assert.strictEqual(engine.prompt(),"1-3, Help or Quit:");
engine.execute("1");
assert.ok(!engine.prompt().includes("Back"),"September conservative prompt must not advertise unattested Back wording");
assert.strictEqual(engine.current.address,"a.html");
engine.execute("n");
assert.strictEqual(engine.current.address,"b.html","next follows sibling reference when destination content is available");
engine.execute("p");
assert.strictEqual(engine.current.address,"a.html","previous follows sibling reference when destination content is available");
engine.execute("back");
assert.strictEqual(engine.current.address,"ftp://kekux.kek.jp/kek/html/kek.html");
const beforeSource=engine.current.address;
engine.execute("source");
assert.strictEqual(engine.current.address,beforeSource,"SOURCE is not a standalone current-source command");
engine.execute("help");
assert.ok(engine.current.title.toLowerCase().includes("help"));

const offline=new LMB.Engine(html,{width:80,rows:24});
const originalLines=offline.screen("").slice();
offline.execute("1");
assert.strictEqual(offline.current.address,"ftp://kekux.kek.jp/kek/html/kek.html","missing target bytes must not create a synthetic historical document");
assert.deepStrictEqual(offline.screen(""),originalLines,"an unresolved reference request must not inject modern offline prose into the framebuffer");
assert.deepStrictEqual(offline.pendingNavigation,{kind:"reference",target:"a.html",from:"ftp://kekux.kek.jp/kek/html/kek.html",number:1,label:"Help"});

offline.execute("go http://example.invalid/");
assert.strictEqual(offline.current.address,"ftp://kekux.kek.jp/kek/html/kek.html");
assert.strictEqual(offline.pendingNavigation.kind,"go");
assert.strictEqual(offline.pendingNavigation.target,"http://example.invalid/");

assert.strictEqual(LMB.commandFor("").name,"return");
assert.strictEqual(LMB.commandFor("7").name,"number");
assert.strictEqual(LMB.commandFor("recall 2").name,"recall-number");
assert.strictEqual(LMB.commandFor("f foo").name,"find");
console.log("PASS: Line Mode Browser Phase 6.5 core tests");
console.log("Prompt:",new LMB.Engine(html,{width:80,rows:24}).prompt());
console.log("Title row:",JSON.stringify(f.lines[0]));
