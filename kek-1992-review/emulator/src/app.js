(function(){
  "use strict";

  const canvas=document.getElementById("display");
  const displayPanel=document.getElementById("displayPanel");
  const displayScroll=document.getElementById("displayScroll");
  const monitorWrap=document.getElementById("monitorWrap");
  const monitorShell=document.getElementById("monitorShell");
  const monitorCaption=document.getElementById("monitorCaption");
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
  const requestedScreen=params.get("screen");
  if(requestedProfile && TerminalProfiles[requestedProfile]) profileSelect.value=requestedProfile;
  if(requestedBehavior && Array.from(behaviorSelect.options).some(o=>o.value===requestedBehavior)) behaviorSelect.value=requestedBehavior;
  if(requestedScreen && Array.from(screenModeSelect.options).some(o=>o.value===requestedScreen)) screenModeSelect.value=requestedScreen;
  const embedded=params.get("embed")==="1";
  const focusMode=params.get("focus")||"";
  if(embedded) document.body.classList.add("embed-mode");
  if(focusMode==="window") document.body.classList.add("focus-window-mode");
  if(params.get("animate")==="0") animateToggle.checked=false;

  function presentationProfile(base){
    if(!(embedded && focusMode==="window" && base.windowChrome)) return base;
    const p=Object.assign({},base);
    const wr=base.windowChrome.rect;
    const pad=36;
    const x=Math.max(0,wr.x-pad), y=Math.max(0,wr.y-pad);
    const right=Math.min(base.framebufferWidth,wr.x+wr.w+pad);
    const bottom=Math.min(base.framebufferHeight,wr.y+wr.h+pad);
    p.framebufferWidth=right-x; p.framebufferHeight=bottom-y;
    p.terminalRect=Object.assign({},base.terminalRect,{x:base.terminalRect.x-x,y:base.terminalRect.y-y});
    p.windowChrome=Object.assign({},base.windowChrome,{rect:Object.assign({},wr,{x:wr.x-x,y:wr.y-y})});
    p.notes=(base.notes||[]).concat(["PRESENTATION CROP: 埋め込み表示では読みやすさのためwindow周辺だけを切り出す。元の1280×1024上でのwindow比率は変更していない。"]);
    p.physicalResolutionStatus=(base.physicalResolutionStatus||"")+" / embedded view crops around the same window geometry";
    // A cropped terminal-window preview is not a physical-monitor view.
    p.monitorFrame=null;
    return p;
  }

  let profile=presentationProfile(TerminalProfiles[profileSelect.value]);
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

  function profileAsset(){
    const id=profile.publicFontAssetId||profile.bundledFontAssetId||profile.comparisonFontAssetId;
    if(!id)return null;
    return HistoricalFonts.PUBLIC_FONT_ASSETS[id]||null;
  }

  function fontDescription(){
    if(fontBackend){
      const s=fontBackend.summary();
      if(s.kind==="bdf"){
        if(s.provenanceId){
          return `VERIFIED PUBLIC BDF: ${s.source} · ${s.glyphCount} glyphs · `+
            `cell ${s.cellWidth}×${s.cellHeight}`;
        }
        return `RESEARCH BDF OVERRIDE: ${s.source} · ${s.glyphCount} glyphs · `+
          `cell ${s.cellWidth}×${s.cellHeight} · ascent ${s.ascent} / descent ${s.descent}`;
      }
      if(s.provenanceId)return `ANCHORED PUBLIC FONT SOURCE: ${s.source}`;
      return `RESEARCH VECTOR OVERRIDE: ${s.source}`;
    }
    if(fontLoadError)return `PROFILE FONT LOAD FAILED: ${fontLoadError}`;
    if(profile.requiresHistoricalRaster){
      return "HISTORICAL FONT NOT CONNECTED — Ohlfs再構成font未接続・本文描画を停止";
    }
    if(profileAsset())return "PROFILE FONT NOT ACTIVE — 指定font資産は未検証です";
    return "HISTORICAL FONT UNVERIFIED — 実際の端末fontは未特定です";
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
    const asset=profileAsset();

    // Non-DEC profiles can still have a historically anchored public font source.
    if(!profile.targetFontId){
      if(profile.requiresHistoricalRaster&&!fontBackend){
        return '<p class="verify-warn">本文未提供・ウィンドウ形状のみの比較です。Ohlfs再構成fontが未接続のため、本文描画を停止しています。</p>';
      }
      if(!asset){
        return "<p>この表示では、ホスト機種だけから端末字形を一意に決められません。標準仕様または実機由来のfont sourceが確認できた場合のみ固定します。</p>";
      }
      let html=`<p><strong>Profile font source:</strong> ${asset.label}</p>`+
        `<p>${asset.evidence||""}</p>`+
        `<p><strong>License:</strong> ${asset.licenseName||"source license documented"}</p>`;
      if(!fontBackend){
        html+=fontLoadError
          ?`<p class="verify-warn">Font load failed: ${fontLoadError}</p>`
          :'<p class="verify-pending">公開font sourceを読み込み中です。</p>';
        return html;
      }
      const summary=fontBackend.summary();
      if(summary.provenanceId===asset.id){
        html+='<p class="verify-ok"><strong>PROFILE FONT ACTIVE</strong></p>';
        if(summary.sha256)html+=`<p>Loaded SHA-256: <code>${summary.sha256}</code></p>`;
        if(summary.kind==="bdf")html+=`<p>Loaded bitmap cell: ${summary.cellWidth}×${summary.cellHeight}px · glyphs ${summary.glyphCount}</p>`;
      }else{
        html+='<p class="verify-warn">Research override is active instead of the profile font source.</p>';
      }
      return html;
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
      if(fontLoadError){
        html+=`<p class="verify-warn">Public DEC bitmap failed to load: ${fontLoadError}</p>`;
      }else if(asset){
        html+='<p class="verify-pending">公開許諾DEC Terminal bitmapを読み込み中です。</p>';
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
      const decAsset=HistoricalFonts.DEC_PUBLIC_ASSETS[s.provenanceId];
      html+=`<p class="verify-ok"><strong>VERIFIED HISTORICAL GLYPH RASTER ACTIVE</strong></p>`;
      html+=`<p class="verify-ok">ULTRIX 4.3 historical targetとのbitmap照合: `+
        `${decAsset.rasterMatch.matched}/${decAsset.rasterMatch.total} glyphs, `+
        `ASCII ${decAsset.rasterMatch.asciiMatched}/${decAsset.rasterMatch.asciiTotal}.</p>`;
      html+="<p>表示用assetはX Consortium系DEC Terminal V2.2の公開許諾版です。"+
        "75dpi/14ptのmetadataを100dpi/10ptと偽装せず、共通する実glyph rasterを8×15セルへ直接描画します。</p>";
      html+=`<p>License: <code>${decAsset.licensePath}</code> · Provenance: <code>${decAsset.provenancePath}</code></p>`;
      return html;
    }

    if(exactTargetBDFActive(s,target)){
      html+='<p class="verify-ok"><strong>EXACT ULTRIX TARGET BDF ACTIVE</strong> — research override.</p>';
    }else{
      html+=s.asciiComplete
        ?'<p class="verify-ok">ASCII 0x20–0x7E coverage: complete</p>'
        :`<p class="verify-warn">ASCII coverage incomplete: ${s.missingASCII.length} missing glyphs</p>`;
      html+=`<p class="verify-warn">This override is not the verified public historical raster.</p>`;
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
      ["Physical display / frame",profile.monitorFrame
        ?profile.monitorFrame.label+" · "+(profile.monitorFrame.status||"status not stated")
        :"not asserted / cropped window presentation"],
      ["Pixel aspect",profile.pixelAspectStatus||"square framebuffer pixels assumed unless hardware evidence says otherwise"],
      ["Documented display alternatives",profile.monitorAlternatives&&profile.monitorAlternatives.length
        ?profile.monitorAlternatives.join(" / ")
        :"none recorded for this profile"],
      ["Browser behavior",behaviorText],
      ["Terminal screen mode",profile.alternateTerminalPalette
        ?effectiveScreenMode()+" · KEK saved resource unknown"
        :"not applicable"],
      ["Window chrome",profile.windowChrome
        ?profile.windowChrome.candidate+" · exact historical placement/title unconfirmed"
        :"not reconstructed"],
      ["Vertical scrollbar",profile.windowChrome
        ?(profile.verticalScrollbar?"on":"off")+" · saved resource/state may be unknown"
        :"not applicable"],
      ["Prompt provenance",promptProvenance],
      ["LMB width policy","80-column display candidate; 1992 command-line documentation says the browser default is 78/79/80 depending on system"],
      ["Font candidate",profile.fontCandidate||"unresolved"],
      ["Font evidence",profile.fontEvidence||"unresolved"],
      ["Target XLFD",profile.targetXLFD||"not established"],
      ["Active font",fontDescription()],
      ["Glyph / font source",profile.targetFontId
        ?(exactHistoricalBitmapActive()?"VERIFIED HISTORICAL RASTER / ACTIVE":"historical raster not active")
        :(profileAsset()
          ?(fontBackend&&fontBackend.summary().provenanceId===profileAsset().id?"PROFILE SOURCE / ACTIVE":"profile source not active")
          :"not asserted as exact")],
      ["Runtime font path",profile.runtimeFontBranches&&profile.runtimeFontBranches.length
        ?(profile.runtimeSelectionStatus||"unresolved")
        :"not applicable"],
      ["Graphics / X server",profile.graphicsOptionStatus||"not applicable"],
      ["Bitmap pixel mapping",fontBackend&&fontBackend.kind==="bdf"?"1 font pixel = 1 reconstructed framebuffer pixel":"vector/profile glyph is hard-rasterized to the logical cell before framebuffer output"],
      ["Presentation filter",embedded
        ?"embedded review view: fit-to-width presentation / native backing framebuffer"
        :"research view: nearest-neighbor / no devicePixelRatio re-rasterization / 25% auto steps"]
    ];

    spec.innerHTML=rows.map(
      r=>"<tr><th>"+r[0]+"</th><td>"+r[1]+"</td></tr>"
    ).join("");
    evidence.innerHTML=profile.notes.map(x=>"<li>"+x+"</li>").join("");
    fontState.textContent=fontDescription();
    fontVerify.innerHTML=fontVerificationHTML();
  }

  function updateMonitorPresentation(){
    const mf=profile.monitorFrame||null;
    if(!monitorShell||!monitorCaption)return;
    monitorShell.dataset.shell=mf&&mf.shell?mf.shell:"none";
    monitorShell.dataset.kind=mf&&mf.kind?mf.kind:"none";
    monitorWrap.classList.toggle("has-monitor-frame",!!mf);
    monitorWrap.classList.toggle("monitor-is-crop",!mf);
    const rasterBlocked=!!(profile.requiresHistoricalRaster&&!fontBackend);
    document.body.classList.toggle("historical-raster-blocked",rasterBlocked);
    const caption=mf?`${mf.label}${mf.status?" · "+mf.status:""}`:"";
    monitorCaption.textContent=rasterBlocked
      ?`${caption}${caption?" · ":""}本文未提供・ウィンドウ形状のみ（Ohlfs再構成font未接続）`
      :caption;
  }

  function presentationScale(){
    const v=sizeSelect.value;
    if(v!=="auto")return Number(v);

    // Fit the entire comparison/monitor frame, not just the canvas. Otherwise
    // fixed CSS bezel widths push the outer shell beyond a narrow iframe.
    const scrollStyle=getComputedStyle(displayScroll);
    const shellStyle=getComputedStyle(monitorShell);
    const activeStyle=getComputedStyle(document.getElementById("monitorActive"));
    const px=(style,key)=>parseFloat(style[key])||0;
    const extra=(style,axis)=>axis==="x"
      ?px(style,"paddingLeft")+px(style,"paddingRight")+px(style,"borderLeftWidth")+px(style,"borderRightWidth")
      :px(style,"paddingTop")+px(style,"paddingBottom")+px(style,"borderTopWidth")+px(style,"borderBottomWidth");
    const frameW=extra(shellStyle,"x")+extra(activeStyle,"x");
    const frameH=extra(shellStyle,"y")+extra(activeStyle,"y");
    const available=Math.max(1,Math.floor(displayScroll.clientWidth
      -px(scrollStyle,"paddingLeft")-px(scrollStyle,"paddingRight")-frameW));
    const fitW=available/profile.framebufferWidth;

    // Reviewer-facing embedded pages should use the available space instead of
    // leaving a small native-size framebuffer in a large black box.  The canvas
    // backing store remains the historical framebuffer; only its CSS presentation
    // size changes.  Fit both width and the iframe viewport height, and permit
    // enlargement up to 2x for the 640px-wide text-plane profiles.
    if(embedded){
      const availableH=Math.max(1,Math.floor(window.innerHeight-118-frameH));
      const fitH=availableH/profile.framebufferHeight;
      return Math.max(0.1,Math.min(2,fitW,fitH));
    }

    const fit=fitW;
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
    updateMonitorPresentation();
    renderer.setPresentationScale(presentationScale());
    renderer.setProfile(profile);
    renderer.setGrid(gridToggle.checked);
    renderer.setScreenMode(screenModeSelect.value);
    renderer.setFontBackend(fontBackend);
    // Profiles with an anchored historical font asset fail closed: if that asset
    // cannot be loaded, do not silently substitute Courier/system glyphs and
    // present them as a historical reconstruction.  The detail panel reports
    // the fetch/load error instead.
    if((profileAsset()||profile.requiresHistoricalRaster)&&!fontBackend){
      renderer.draw(Array(profile.rows).fill(""),-1);
    }else{
      renderer.draw(lines(),visible);
    }

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
    const asset=profileAsset();
    if(!asset)return;
    try{
      const loaded=await HistoricalFonts.loadPublicAsset(asset);
      if(serial!==profileFontLoadSerial)return;
      if(asset.sha256&&String(loaded.fileSHA256||"").toLowerCase()!==asset.sha256.toLowerCase()){
        throw new Error("public font asset fingerprint mismatch");
      }
      fontBackend=loaded;
    }catch(err){
      if(serial!==profileFontLoadSerial)return;
      fontLoadError=err&&err.message?err.message:String(err);
      console.error(err);
    }
  }

  profileSelect.addEventListener("change",async function(){
    profile=presentationProfile(TerminalProfiles[this.value]);
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
    syncScreenModeControl(false);
    if(requestedScreen && !screenModeSelect.disabled && Array.from(screenModeSelect.options).some(o=>o.value===requestedScreen)){
      screenModeSelect.value=requestedScreen;
    }
    buildEngine();
    await activateProfileFont();
    update(true);
    // A reference thumbnail must not take focus from the respondent's answers.
    if(params.get('preview')!=='1')setTimeout(()=>canvas.focus(),50);
  }

  initialize().catch(err=>{
    console.error(err);
    fontLoadError=err&&err.message?err.message:String(err);
    update(true);
  });
})();
