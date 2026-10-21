(function(){
  "use strict";

  const canvas=document.getElementById("display");
  const displayPanel=document.getElementById("displayPanel");
  const displayScroll=document.getElementById("displayScroll");
  const renderer=new DisplayRenderer(canvas);

  const profileSelect=document.getElementById("profile");
  const behaviorSelect=document.getElementById("behavior");
  const spec=document.getElementById("spec");
  const address=document.getElementById("address");
  const evidence=document.getElementById("evidence");
  const inputEcho=document.getElementById("inputEcho");
  const navigationStatus=document.getElementById("navigationStatus");
  const fontState=document.getElementById("fontState");
  const fontVerify=document.getElementById("fontVerify");
  const fontFile=document.getElementById("fontFile");
  const clearFont=document.getElementById("clearFont");
  const animateToggle=document.getElementById("animate");
  const gridToggle=document.getElementById("grid");
  const screenModeSelect=document.getElementById("screenMode");
  const sizeSelect=document.getElementById("size");
  const fullscreenButton=document.getElementById("fullscreen");
  const fullscreenExit=document.getElementById("fullscreenExit");

  const params=new URLSearchParams(window.location.search);
  const requestedProfile=params.get("profile");
  const requestedBehavior=params.get("behavior");
  if(requestedProfile && TerminalProfiles[requestedProfile]) profileSelect.value=requestedProfile;
  if(requestedBehavior && Array.from(behaviorSelect.options).some(o=>o.value===requestedBehavior)) behaviorSelect.value=requestedBehavior;
  if(params.get("embed")==="1") document.body.classList.add("embed-mode");
  if(params.get("animate")==="0") animateToggle.checked=false;

  let profile=TerminalProfiles[profileSelect.value];
  let engine=null,buffer="",raf=0,revealStart=0,revealTotal=0;
  let fontBackend=null;
  let fontLoadError="";
  let profileFontLoadSerial=0;

  function behaviorMode(){return behaviorSelect.value;}

  function effectiveScreenMode(){
    if(!profile.alternateTerminalPalette)return "profile fixed";
    return screenModeSelect.value==="profile"
      ?(profile.screenModeDefault||"profile default")
      :screenModeSelect.value;
  }

  function syncScreenModeControl(reset){
    const supported=!!profile.alternateTerminalPalette;
    screenModeSelect.disabled=!supported;
    if(reset||!supported)screenModeSelect.value="profile";
  }

  function buildEngine(){
    const behavior=LMBCore.behaviorProfile(behaviorMode());
    engine=new LMBCore.Engine(window.KEK_1992_HTML,{
      width:profile.cols,
      rows:profile.rows,
      behaviorMode:behavior.id,
      formatter:{
        definitionIndent:24,
        definitionGap:true,
        headingUppercase:behavior.formatter.headingUppercase,
        headingCenter:behavior.formatter.headingCenter,
        headingIndent:behavior.formatter.headingIndent,
        endIndent:3,
        showDocumentTitle:false
      }
    });
    buffer="";
  }

  function detectedSystemFont(){
    if(!document.fonts||!document.fonts.check)return "font detection unavailable";
    const meyrin=document.fonts.check("16px Meyrin")||
      document.fonts.check("16px MeyrinRegular");
    const dec=document.fonts.check('14px "DEC Terminal"')||
      document.fonts.check("14px Terminal");

    if(profile.id.startsWith("cern_")){
      return meyrin
        ?"Meyrin available as installed system font"
        :"Meyrin not installed";
    }
    return dec
      ?"DEC/Terminal family available as installed system font"
      :"DEC Terminal family not installed";
  }

  function bundledAsset(){
    if(!profile.bundledFontAssetId)return null;
    return HistoricalFonts.DEC_PUBLIC_ASSETS[profile.bundledFontAssetId]||null;
  }

  function fontDescription(){
    if(fontBackend){
      const s=fontBackend.summary();
      if(s.kind==="bdf"){
        if(s.provenanceId){
          return `BUNDLED LICENSED BDF: ${s.source} · ${s.glyphCount} glyphs · `+
            `cell ${s.cellWidth}×${s.cellHeight} · raster-equivalent historical target`;
        }
        return `RESEARCH BDF OVERRIDE: ${s.source} · ${s.glyphCount} glyphs · `+
          `cell ${s.cellWidth}×${s.cellHeight} · ascent ${s.ascent} / descent ${s.descent}`;
      }
      return `RESEARCH VECTOR OVERRIDE: ${s.source}`;
    }
    if(fontLoadError)return `BUNDLED FONT LOAD FAILED: ${fontLoadError}`;
    return detectedSystemFont()+" — diagnostic fallback";
  }

  function exactTargetBDFActive(summary,target){
    const hashMatches=!target.expectedBDFSHA256 ||
      String(summary.sha256||"").toLowerCase()===String(target.expectedBDFSHA256).toLowerCase();
    return !!(summary.decCandidate&&
      summary.decCandidate.id===target.id&&
      summary.decCandidate.status==="EXACT METADATA MATCH"&&
      summary.cellWidth===target.cell.w&&summary.cellHeight===target.cell.h&&
      summary.asciiComplete&&hashMatches);
  }

  function verifiedRasterEquivalentActive(summary,target){
    if(!summary.rasterEquivalentTargetId||summary.rasterEquivalentTargetId!==target.id)return false;
    const asset=Object.values(HistoricalFonts.DEC_PUBLIC_ASSETS).find(
      item=>item.id===summary.provenanceId
    );
    if(!asset)return false;
    const hashOK=String(summary.sha256||"").toLowerCase()===asset.sha256.toLowerCase();
    const match=summary.rasterMatch||{};
    return !!(hashOK&&summary.asciiComplete&&
      summary.cellWidth===target.cell.w&&summary.cellHeight===target.cell.h&&
      match.matched===match.total&&match.total===195&&
      match.asciiMatched===match.asciiTotal&&match.asciiTotal===95);
  }

  function exactHistoricalBitmapActive(){
    if(!fontBackend||fontBackend.kind!=="bdf"||!profile.targetFontId)return false;
    const target=HistoricalFonts.DEC_TARGETS[profile.targetFontId];
    if(!target)return false;
    const summary=fontBackend.summary();
    return exactTargetBDFActive(summary,target)||verifiedRasterEquivalentActive(summary,target);
  }

  function fontVerificationHTML(){
    if(!profile.targetFontId){
      return "<p>この表示プロファイルには、まだ確定したhistorical font targetがありません。</p>";
    }
    const target=HistoricalFonts.DEC_TARGETS[profile.targetFontId];
    if(!target)return "<p>Font target definition missing.</p>";

    let html="<p><strong>Verified glyph target:</strong> "+target.label+"</p>"+
      "<p><code>"+target.xlfd+"</code></p>"+
      `<p>Target cell: ${target.cell.w}×${target.cell.h}px · baseline ${target.baseline}px</p>`;

    if(profile.runtimeFontBranches&&profile.runtimeFontBranches.length){
      html+=`<p><strong>Runtime font path:</strong> ${profile.runtimeSelectionStatus||"UNRESOLVED"}</p>`;
      for(const branch of profile.runtimeFontBranches){
        const runtime=HistoricalFonts.DEC_TARGETS[branch.fontId];
        if(!runtime)continue;
        html+=`<p><strong>${branch.label}:</strong> ${branch.xServer} · ${branch.defaultDensity}dpi · `+
          `DECterm Little Font ${branch.dectermLittlePointSize}pt</p>`+
          `<p><code>${runtime.xlfd}</code></p>`;
      }
    }

    if(!fontBackend){
      const asset=bundledAsset();
      if(fontLoadError){
        html+=`<p class="verify-warn">Bundled bitmap failed to load: ${fontLoadError}</p>`;
      }else if(asset){
        html+='<p class="verify-pending">Bundled DEC Terminal bitmapを読み込み中です。</p>';
      }else{
        html+='<p class="verify-pending">Historical bitmap source is unresolved.</p>';
      }
      return html;
    }

    const s=fontBackend.summary();
    if(s.kind!=="bdf"){
      html+='<p class="verify-warn">Vector font is a research override, not the verified bitmap source.</p>';
      return html;
    }

    html+=`<p><strong>Rendered BDF:</strong> ${s.source}</p>`;
    html+=`<p>Loaded XLFD: <code>${s.name}</code></p>`;
    if(s.sha256)html+=`<p>SHA-256: <code>${s.sha256}</code></p>`;

    if(verifiedRasterEquivalentActive(s,target)){
      const asset=HistoricalFonts.DEC_PUBLIC_ASSETS[s.provenanceId];
      html+=`<p class="verify-ok"><strong>VERIFIED HISTORICAL GLYPH RASTER ACTIVE</strong></p>`;
      html+=`<p class="verify-ok">ULTRIX 4.3 historical targetとのbitmap照合: `+
        `${asset.rasterMatch.matched}/${asset.rasterMatch.total} glyphs, `+
        `ASCII ${asset.rasterMatch.asciiMatched}/${asset.rasterMatch.asciiTotal}.</p>`;
      html+="<p>表示用assetはX Consortium系DEC Terminal V2.2の公開許諾版です。"+
        "75dpi/14ptのmetadataを100dpi/10ptと偽装せず、共通する実glyph rasterを8×15セルへ直接描画します。</p>";
      html+=`<p>License: <code>${asset.licensePath}</code> · Provenance: <code>${asset.provenancePath}</code></p>`;
      return html;
    }

    if(exactTargetBDFActive(s,target)){
      html+='<p class="verify-ok"><strong>EXACT ULTRIX TARGET BDF ACTIVE</strong> — research override.</p>';
    }else{
      html+=s.asciiComplete
        ?'<p class="verify-ok">ASCII 0x20–0x7E coverage: complete</p>'
        :`<p class="verify-warn">ASCII coverage incomplete: ${s.missingASCII.length} missing glyphs</p>`;
      html+=`<p class="verify-warn">This override is not the verified bundled historical raster.</p>`;
    }
    return html;
  }

  function renderSpec(){
    const behaviorText=behaviorMode()==="sep1992_conservative"
      ?"1992-09-30 conservative / directly-attested prompt minimum / exact binary revision unknown"
      :"W3 1992-11-03 documented command reference";
    const promptProvenance=behaviorMode()==="sep1992_conservative"
      ?"1992-02-18 figure directly attests reference range / Return for more / Help or Quit; unattested September Back/Up/Find prompt tokens are omitted"
      :"1992-11-03 documentation reference; SOURCE is a prefix, not a standalone current-source command";

    const rows=[
      ["Profile",profile.label],
      ["Evidence",profile.evidenceLevel],
      ["Character grid",profile.cols+" × "+profile.rows],
      ["Framebuffer",profile.framebufferWidth+" × "+profile.framebufferHeight+
        " ("+profile.physicalResolutionStatus+")"],
      ["Browser behavior",behaviorText],
      ["DECterm screen mode",profile.alternateTerminalPalette
        ?effectiveScreenMode()+" · KEK saved resource unknown"
        :"not applicable"],
      ["DECterm window chrome",profile.windowChrome
        ?profile.windowChrome.candidate+" · KEK placement/title not independently captured"
        :"not reconstructed"],
      ["Vertical scrollbar",profile.windowChrome
        ?(profile.verticalScrollbar?"on":"off")+" · KEK saved resource unknown"
        :"not applicable"],
      ["Prompt provenance",promptProvenance],
      ["LMB width policy","80-column display candidate; 1992 command-line documentation says the browser default is 78/79/80 depending on system"],
      ["Font candidate",profile.fontCandidate||"unresolved"],
      ["Font evidence",profile.fontEvidence||"unresolved"],
      ["Target XLFD",profile.targetXLFD||"not established"],
      ["Active font",fontDescription()],
      ["Verified glyph raster",exactHistoricalBitmapActive()?"VERIFIED / ACTIVE":"not fully verified"],
      ["Runtime font path",profile.runtimeFontBranches&&profile.runtimeFontBranches.length
        ?(profile.runtimeSelectionStatus||"unresolved")
        :"not applicable"],
      ["Graphics / X server",profile.graphicsOptionStatus||"not applicable"],
      ["Bitmap pixel mapping",fontBackend&&fontBackend.kind==="bdf"?"1 font pixel = 1 reconstructed framebuffer pixel":"fallback is hard-rasterized to 1-bit logical pixels"],
      ["Presentation filter","nearest-neighbor / no devicePixelRatio re-rasterization / 25% auto steps"]
    ];

    spec.innerHTML=rows.map(
      r=>"<tr><th>"+r[0]+"</th><td>"+r[1]+"</td></tr>"
    ).join("");
    evidence.innerHTML=profile.notes.map(x=>"<li>"+x+"</li>").join("");
    fontState.textContent=fontDescription();
    fontVerify.innerHTML=fontVerificationHTML();
  }

  function presentationScale(){
    const v=sizeSelect.value;
    if(v!=="auto")return Number(v);

    // Never use arbitrary fractional fit scaling. It softens a reconstructed
    // pixel framebuffer. Auto selects only 25% steps and never below 100%.
    const available=Math.max(0,displayPanel.clientWidth-24);
    const fit=available/profile.framebufferWidth;
    const stepped=Math.floor(fit*4)/4;
    return Math.max(1,Math.min(1.75,stepped));
  }

  function lines(){return engine.screen(buffer);}

  function countVisibleCells(screenLines){
    return screenLines.reduce((n,l)=>n+(l||"").length,0);
  }

  function pendingNavigationText(){
    const p=engine&&engine.pendingNavigation;
    if(!p)return "none";
    if(p.kind==="find")return `FIND ${p.query||""} @ ${p.target||""}`.trim();
    if(p.kind==="source")return `SOURCE ${p.command||""} @ ${p.target||""}`.trim();
    const label=p.label?` (${p.label})`:"";
    return `${p.kind||"request"}: ${p.target||""}${label}`;
  }

  function renderNow(visible){
    renderer.setPresentationScale(presentationScale());
    renderer.setProfile(profile);
    renderer.setGrid(gridToggle.checked);
    renderer.setScreenMode(screenModeSelect.value);
    renderer.setFontBackend(fontBackend);
    renderer.draw(lines(),visible);

    address.textContent=engine.current?engine.current.address:"";
    inputEcho.textContent=buffer||" ";
    navigationStatus.textContent=pendingNavigationText();
  }

  function draw(animate){
    cancelAnimationFrame(raf);
    const ls=lines();
    revealTotal=countVisibleCells(ls);

    if(!animate||!animateToggle.checked||!profile.revealCellsPerSecond){
      renderNow(revealTotal);
      return;
    }

    revealStart=performance.now();
    function tick(now){
      const visible=Math.min(
        revealTotal,
        Math.floor((now-revealStart)*profile.revealCellsPerSecond/1000)
      );
      renderNow(visible);
      if(visible<revealTotal)raf=requestAnimationFrame(tick);
    }
    raf=requestAnimationFrame(tick);
  }

  function update(animate){
    renderSpec();
    draw(!!animate);
  }

  async function activateProfileFont(){
    const serial=++profileFontLoadSerial;
    fontBackend=null;
    fontLoadError="";
    const asset=bundledAsset();
    if(!asset)return;
    try{
      const loaded=await HistoricalFonts.loadBDFURL(asset.url,asset.label);
      if(serial!==profileFontLoadSerial)return;
      if(String(loaded.fileSHA256||"").toLowerCase()!==asset.sha256.toLowerCase()){
        throw new Error("bundled BDF fingerprint mismatch");
      }
      fontBackend=loaded;
    }catch(err){
      if(serial!==profileFontLoadSerial)return;
      fontLoadError=err&&err.message?err.message:String(err);
      console.error(err);
    }
  }

  profileSelect.addEventListener("change",async function(){
    profile=TerminalProfiles[this.value];
    syncScreenModeControl(true);
    if(fontFile)fontFile.value="";
    buildEngine();
    await activateProfileFont();
    update(true);
    canvas.focus();
  });

  behaviorSelect.addEventListener("change",()=>{
    buildEngine();update(true);canvas.focus();
  });

  document.getElementById("reset").addEventListener("click",()=>{
    buildEngine();update(true);canvas.focus();
  });

  animateToggle.addEventListener("change",()=>draw(false));
  gridToggle.addEventListener("change",()=>draw(false));
  screenModeSelect.addEventListener("change",()=>{renderSpec();draw(false);canvas.focus();});
  sizeSelect.addEventListener("change",()=>draw(false));

  fullscreenButton.addEventListener("click",async()=>{
    try{
      if(document.fullscreenElement){
        await document.exitFullscreen();
      }else{
        await displayPanel.requestFullscreen();
      }
    }catch(err){
      console.error(err);
    }
  });

  fullscreenExit.addEventListener("click",async()=>{
    if(document.fullscreenElement){
      try{ await document.exitFullscreen(); }catch(err){ console.error(err); }
    }
  });

  document.addEventListener("fullscreenchange",()=>{
    fullscreenButton.textContent=document.fullscreenElement
      ?"全画面を終了"
      :"画面を全画面表示";
    setTimeout(()=>draw(false),50);
  });

  window.addEventListener("resize",()=>{
    if(sizeSelect.value==="auto")draw(false);
  });

  fontFile.addEventListener("change",async function(){
    const file=this.files&&this.files[0];
    if(!file)return;

    try{
      const lower=file.name.toLowerCase();
      fontLoadError="";
      ++profileFontLoadSerial;
      if(lower.endsWith(".bdf")){
        fontBackend=await HistoricalFonts.loadBDF(file);
      }else if(lower.endsWith(".pcf")||lower.endsWith(".pcf.gz")){
        alert(
          "PCFはブラウザで直接読みません。"+
          "tools/pcf_to_bdf.command でBDFへ変換してから読み込んでください。"
        );
        this.value="";
        return;
      }else{
        fontBackend=await HistoricalFonts.loadVectorFont(
          file,"UserHistoricalFont"
        );
      }
      update(false);
      canvas.focus();
    }catch(err){
      console.error(err);
      alert("Font load failed: "+err.message);
      fontBackend=null;
      this.value="";
      update(false);
    }
  });

  clearFont.addEventListener("click",async()=>{
    fontFile.value="";
    await activateProfileFont();
    update(false);
    canvas.focus();
  });

  function onKeyDown(e){
    if(e.metaKey||e.ctrlKey||e.altKey)return;

    if(e.key==="Enter"){
      e.preventDefault();
      engine.execute(buffer);
      buffer="";
      draw(true);
      renderSpec();
      const pending=engine.pendingNavigation;
      if(pending && pending.kind==="reference" && /^https?:\/\//i.test(pending.target||"")){
        // Reference number + RETURN remains the historical interaction.
        // The static archive has no cross-origin proxy, so remote bytes are not
        // fabricated inside the framebuffer; the real destination opens instead.
        window.open(pending.target,"_blank","noopener,noreferrer");
      }
      return;
    }

    if(e.key==="Backspace"){
      e.preventDefault();
      buffer=buffer.slice(0,-1);
      draw(false);
      return;
    }

    if(e.key==="Escape"){
      e.preventDefault();
      buffer="";
      draw(false);
      return;
    }

    if(e.key.length===1&&e.key.charCodeAt(0)>=32&&e.key.charCodeAt(0)<=126){
      e.preventDefault();
      const max=Math.max(0,profile.cols-engine.prompt().length-1);
      if(buffer.length<max)buffer+=e.key;
      draw(false);
    }
  }

  canvas.setAttribute("tabindex","0");
  canvas.addEventListener("keydown",onKeyDown);
  canvas.addEventListener("click",()=>canvas.focus());

  async function initialize(){
    syncScreenModeControl(true);
    buildEngine();
    await activateProfileFont();
    update(true);
    setTimeout(()=>canvas.focus(),50);
  }

  initialize().catch(err=>{
    console.error(err);
    fontLoadError=err&&err.message?err.message:String(err);
    update(true);
  });
})();