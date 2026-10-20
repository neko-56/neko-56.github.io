const assert=require("assert");const LMB=require("../src/lmb-core.js");
const html=`<HTML><HEAD><TITLE>KEK Entry Point</TITLE></HEAD><BODY><H1>KEK Information</H1>
Welcome to the KEK WWW server. This server is still in the process of being set up.
<DL><DT><A HREF=a.html>Help</A><DD>On this program, or the <A HREF=b.html>World-Wide Web</A>.
<DT><A HREF=c.html>HEP</A><DD>World Wide Web service provided by other High-Energy Physics institutes.</DL></BODY></HTML>`;
const f=LMB.formatDocument(html,{width:80,definitionIndent:24,definitionGap:true});
assert.strictEqual(f.documentTitle,"KEK Entry Point");
assert.strictEqual(f.lines[0].trim(),"KEK Entry Point");
assert.strictEqual(f.lines[0].length,80,"document title right aligned to width");
assert.strictEqual(f.links.length,3);assert.ok(f.lines.some(x=>x.includes("Help[1]")));assert.ok(f.lines.some(x=>x.includes("World-Wide Web[2]")));assert.ok(f.lines.some(x=>x.trim()==="[End]"));assert.ok(f.lines.every(x=>x.length<=80));
const engine=new LMB.Engine(html,{width:80,rows:24});
assert.strictEqual(engine.prompt(),"1-3, Quit, or Help:");
engine.execute("1");assert.ok(engine.prompt().includes("Back"));assert.strictEqual(engine.current.address,"a.html");
engine.execute("n");assert.strictEqual(engine.current.address,"b.html","next follows sibling reference");
engine.execute("p");assert.strictEqual(engine.current.address,"a.html","previous follows sibling reference");
engine.execute("back");assert.strictEqual(engine.current.address,"ftp://kekux.kek.jp/kek/html/kek.html");
engine.execute("source");assert.strictEqual(engine.current.address,"internal:source");
engine.execute("back");engine.execute("help");assert.ok(engine.current.title.toLowerCase().includes("help"));
assert.strictEqual(LMB.commandFor("").name,"return");assert.strictEqual(LMB.commandFor("7").name,"number");assert.strictEqual(LMB.commandFor("recall 2").name,"recall-number");assert.strictEqual(LMB.commandFor("f foo").name,"find");
console.log("PASS: Line Mode Browser Phase 2 core tests");console.log("Prompt:",new LMB.Engine(html,{width:80,rows:24}).prompt());console.log("Title row:",JSON.stringify(f.lines[0]));