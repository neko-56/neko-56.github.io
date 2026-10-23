const assert=require("assert");
const fs=require("fs");
const path=require("path");
const LMB=require("../src/lmb-core.js");

const sep=LMB.behaviorProfile("sep1992_conservative");
assert.strictEqual(sep.promptStyle,"period_1992_feb");
assert.strictEqual(sep.promptEvidence.referenceRange,"direct_1992_02");
assert.strictEqual(sep.promptEvidence.returnForMore,"direct_1992_02");
assert.strictEqual(sep.promptEvidence.helpOrQuit,"direct_1992_02");
assert.strictEqual(sep.promptEvidence.back,"omit_unattested_sep30_wording");
assert.strictEqual(sep.promptEvidence.up,"omit_unattested_sep30_wording");
assert.strictEqual(sep.promptEvidence.find,"omit_unattested_sep30_wording");

const child=`<HTML><BODY><H1>Child</H1><P>Child document.</P></BODY></HTML>`;
let body='<H1>Long Page</H1>';
for(let i=0;i<30;i++) body+=`<P>Line ${i+1}</P>`;
body+='<P><A HREF="child.html">Child</A></P>';
const home=`<HTML><BODY>${body}</BODY></HTML>`;
const resolver=target=>target==="child.html"?{title:"Child",html:child,address:target}:null;
const engine=new LMB.Engine(home,{width:80,rows:24,behaviorMode:"sep1992_conservative",resolveDocument:resolver});

assert.strictEqual(engine.prompt(),"1, Return for more, Help or Quit:");
engine.execute("");
assert.ok(engine.canUp(),"test must reach a state where Up could be offered");
assert.ok(!engine.prompt().includes("Up"),"September conservative mode must not advertise unattested Up prompt wording");

engine.execute("top");
engine.execute("1");
assert.strictEqual(engine.current.address,"child.html");
assert.ok(engine.history.length>0,"test must reach a state where Back is usable");
assert.ok(!engine.prompt().includes("Back"),"September conservative mode must not advertise unattested Back prompt wording");
engine.execute("back");
assert.strictEqual(engine.current.address,"ftp://kekux.kek.jp/kek/html/kek.html","Back command remains functional even when its September prompt token is omitted");

engine.loadDocument("Index",'<HTML><BODY><H1>Index</H1><P>Searchable.</P></BODY></HTML>',"index:test",false,null,true);
assert.strictEqual(engine.current.isIndex,true);
assert.ok(!engine.prompt().includes("Find"),"September conservative mode must not advertise November-documented Find prompt wording without September evidence");

const nov=new LMB.Engine(home,{width:80,rows:24,behaviorMode:"nov1992_documented",resolveDocument:resolver});
nov.execute("1");
assert.ok(nov.prompt().includes("Back"),"November reference mode may retain its documented/reference navigation prompt model");

const root=path.join(__dirname,"..");
const evidence=JSON.parse(fs.readFileSync(path.join(root,"evidence","LMB_1992_BEHAVIOR_BOUNDS.json"),"utf8"));
assert.strictEqual(evidence.period_prompt.conservative_token_policy,"directly_attested_minimum");
assert.deepStrictEqual(evidence.period_prompt.omitted_unattested_tokens.sort(),["Back","Find <keywords>","Up"].sort());
assert.strictEqual(evidence.period_prompt.omission_does_not_mean_absence,true);

console.log("PASS: Phase 6.5 September prompt advertises only directly attested 1992 token classes");
