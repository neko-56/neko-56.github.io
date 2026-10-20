(function(){
  "use strict";
  const canvas=document.getElementById("display");
  const renderer=new DisplayRenderer(canvas);
  const profileSelect=document.getElementById("profile");
  const behaviorSelect=document.getElementById("behavior");
  const spec=document.getElementById("spec");
  const address=document.getElementById("address");
  const evidence=document.getElementById("evidence");
  const inputEcho=document.getElementById("inputEcho");
  const fontState=document.getElementById("fontState");
  const fontFile=document.getElementById("fontFile");
  const clearFont=document.getElementById("clearFont");
  const animateToggle=document.getElementById("animate");
  const gridToggle=document.getElementById("grid");

  let profile=TerminalProfiles[profileSelect.value];
  let engine=null,buffer="",raf=0,revealStart=0,revealTotal=0;
  let fontBackend=null;

  function behaviorMode(){return behaviorSelect.value;}
  function buildEngine(){
    engine=new LMBCore.Engine(window.KEK_1992_HTML,{
      width:profile.cols,rows:profile.rows,behaviorMode:behaviorMode(),
      formatter:{definitionIndent:24,definitionGap:true,headingUppercase:true,headingCenter:true,endIndent:3,showDocumentTitle:true}
    });
    buffer="";
  }

  function detectedSystemFont(){
    if(!document.fonts||!document.fonts.check)return "font detection unavailable";
    const meyrin=document.fonts.check("16px Meyrin")||document.fonts.check("16px MeyrinRegular");
    const dec=document.fonts.check('14px "DEC Terminal"')||document.fonts.check("14px Terminal");
    if(profile.id.startsWith("cern_"))return meyrin?"Meyrin available as installed system font":"Meyrin not installed";
    return dec?"DEC/Terminal family available as installed system font":"DEC Terminal family not installed";
  }

  function fontDescription(){
    if(fontBackend){
      const s=fontBackend.summary();
      if(s.kind==="bdf")return `LOCAL BDF: ${s.source} · ${s.glyphCount} glyphs · cell ${s.cellWidth}×${s.cellHeight} · ascent ${s.ascent} / descent ${s.descent}`;
      return `LOCAL VECTOR FONT: ${s.source}`;
    }
    return detectedSystemFont()+" — profile fallback if unavailable";
  }

  function renderSpec(){
    const behaviorText=behaviorMode()==="sep1992_conservative"
      ?"1992-09-30 conservative / exact binary revision unknown"
      :"W3 1992-11-03 documented command model";
    const rows=[
      ["Profile",profile.label],["Evidence",profile.evidenceLevel],["Character grid",profile.cols+" × "+profile.rows],
      ["Framebuffer",profile.framebufferWidth+" × "+profile.framebufferHeight+" ("+profile.physicalResolutionStatus+")"],
      ["Browser behavior",behaviorText],
      ["Prompt provenance","dynamic form; exact 1992-09-30 prompt wording not yet captured"],
      ["Font candidate",profile.fontCandidate||"unresolved"],
      ["Font evidence",profile.fontEvidence||"unresolved"],
      ["Active font",fontDescription()]
    ];
    spec.innerHTML=rows.map(r=>"<tr><th>"+r[0]+"</th><td>"+r[1]+"</td></tr>").join("");
    evidence.innerHTML=profile.notes.map(x=>"<li>"+x+"</li>").join("");
    fontState.textContent=fontDescription();
  }

  function lines(){return engine.screen(buffer);}
  function countVisibleCells(screenLines){return screenLines.reduce((n,l)=>n+(l||"").length,0);}
  function renderNow(visible){
    renderer.setProfile(profile);renderer.setGrid(gridToggle.checked);renderer.setFontBackend(fontBackend);renderer.draw(lines(),visible);
    address.textContent=engine.current?engine.current.address:"";inputEcho.textContent=buffer||" ";
  }
  function draw(animate){
    cancelAnimationFrame(raf);
    const ls=lines();revealTotal=countVisibleCells(ls);
    if(!animate||!animateToggle.checked||!profile.revealCellsPerSecond){renderNow(revealTotal);return;}
    revealStart=performance.now();
    function tick(now){
      const visible=Math.min(revealTotal,Math.floor((now-revealStart)*profile.revealCellsPerSecond/1000));
      renderNow(visible);
      if(visible<revealTotal)raf=requestAnimationFrame(tick);
    }
    raf=requestAnimationFrame(tick);
  }
  function update(animate){renderSpec();draw(!!animate);}

  profileSelect.addEventListener("change",function(){
    profile=TerminalProfiles[this.value];fontBackend=null;fontFile.value="";
    buildEngine();update(true);canvas.focus();
  });
  behaviorSelect.addEventListener("change",()=>{buildEngine();update(true);canvas.focus();});
  document.getElementById("reset").addEventListener("click",()=>{buildEngine();update(true);canvas.focus();});
  animateToggle.addEventListener("change",()=>draw(false));
  gridToggle.addEventListener("change",()=>draw(false));

  fontFile.addEventListener("change",async function(){
    const file=this.files&&this.files[0]; if(!file)return;
    try{
      const lower=file.name.toLowerCase();
      if(lower.endsWith(".bdf")){
        fontBackend=await HistoricalFonts.loadBDF(file);
      }else if(lower.endsWith(".pcf")||lower.endsWith(".pcf.gz")){
        alert("PCFはブラウザで直接読みません。tools/pcf_to_bdf.command でBDFへ変換してから読み込んでください。");
        this.value=""; return;
      }else{
        fontBackend=await HistoricalFonts.loadVectorFont(file,"UserHistoricalFont");
      }
      update(false);canvas.focus();
    }catch(err){
      console.error(err);alert("Font load failed: "+err.message);fontBackend=null;this.value="";update(false);
    }
  });
  clearFont.addEventListener("click",()=>{fontBackend=null;fontFile.value="";update(false);canvas.focus();});

  function onKeyDown(e){
    if(e.metaKey||e.ctrlKey||e.altKey)return;
    if(e.key==="Enter"){e.preventDefault();engine.execute(buffer);buffer="";draw(true);renderSpec();return;}
    if(e.key==="Backspace"){e.preventDefault();buffer=buffer.slice(0,-1);draw(false);return;}
    if(e.key==="Escape"){e.preventDefault();buffer="";draw(false);return;}
    if(e.key.length===1&&e.key.charCodeAt(0)>=32&&e.key.charCodeAt(0)<=126){
      e.preventDefault();const max=Math.max(0,profile.cols-engine.prompt().length-1);
      if(buffer.length<max)buffer+=e.key;draw(false);
    }
  }
  canvas.setAttribute("tabindex","0");
  canvas.addEventListener("keydown",onKeyDown);canvas.addEventListener("click",()=>canvas.focus());

  buildEngine();update(true);setTimeout(()=>canvas.focus(),50);
})();