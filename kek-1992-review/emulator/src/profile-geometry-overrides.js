(function(root){
  "use strict";
  const profiles=root.TerminalProfiles||{};
  const embedded=new URLSearchParams(root.location&&root.location.search||"").get("embed")==="1";

  // Apply embedded-view monitor margins before app.js performs its first render.
  // Previously emulation.html injected these styles after each iframe loaded and
  // then forced a resize, producing a visible second layout pass.
  if(embedded&&!document.querySelector('style[data-embed-monitor-margin]')){
    const style=document.createElement("style");
    style.setAttribute("data-embed-monitor-margin","1");
    style.textContent=`
      .monitor-active{
        padding:8px 10px!important;
        background:#030303!important;
        box-shadow:inset 0 0 0 2px #111,0 0 0 1px #32373a!important;
      }
      .monitor-shell[data-shell="dec-vrt19"] .monitor-active{padding:12px 14px!important}
      .monitor-shell[data-shell="sun-19"] .monitor-active{padding:10px 12px!important}
      .monitor-shell[data-shell="next-megapixel"] .monitor-active{padding:11px 13px!important}
      .monitor-shell[data-shell="ibm-reference"] .monitor-active{padding:10px 12px!important}
      .monitor-shell[data-shell="neutral-plane"] .monitor-active{padding:7px 9px!important}
    `;
    document.head.appendChild(style);
  }

  // X11 xterm: the VT100 widget has an internalBorder between the character
  // grid and the client edge. Use the documented/default 2px value while
  // preserving the existing 80x24 glyph-grid coordinates.
  function addXtermInternalBorder(id){
    const p=profiles[id];
    if(!p||!p.terminalRect)return;
    const r=p.terminalRect;
    p.terminalRect={x:r.x-2,y:r.y-2,w:r.w+4,h:r.h+4};
    p.internalBorder={x:2,y:2,source:"xterm internalBorder default"};
  }
  addXtermInternalBorder("cern_sun4_reference");
  addXtermInternalBorder("cern_next_x11_lmb_green");

  // KEK lecture-image palette candidate: keep the verified DEC Terminal 8x15
  // raster and 80x24 grid unchanged (640x360), but distinguish that grid from
  // the green client area. The 4px client padding is an image-matching aid
  // derived from the KEK-published lecture image, NOT an asserted DECterm
  // factory/default resource value.
  const lecture=profiles.kek_decterm_vrt19_lecture_green;
  if(lecture){
    lecture.terminalRect={x:316,y:266,w:648,h:368};
    lecture.referenceImageClientPadding={x:4,y:4,status:"IMAGE-DERIVED / DECterm DEFAULT UNCONFIRMED"};
    lecture.notes=(lecture.notes||[]).concat([
      "LECTURE IMAGE GEOMETRY: 掲載画像では文字グリッドと緑背景端の間に小さな余白が見えるため、講演資料比較プロファイルのみ4pxのclient paddingを置く。",
      "IMPORTANT: この4pxはDECterm既定resourceとして確認した値ではなく、掲載画像との比較用のimage-derived geometry。80×24×8×15の文字グリッド自体は640×360のまま変更しない。"
    ]);
  }

  // IBM 3278 Model 2 physical-geometry reference.
  //
  // The x3270 BDF is useful as a 3270 glyph-shape reference, but its 9x14
  // bitmap cell is NOT a physical monitor-pixel specification. IBM's 3278
  // maintenance procedure specifies an active horizontal trace of 10.5 inches
  // and a total vertical height of 8 inches for Model 2 and the other non-Model-1
  // displays. Model 2 carries 24 x 80 data characters, with an operator
  // information area outside the data area at the bottom of the screen.
  //
  // Use a 724x552 normalized square-coordinate plane (724/552 = 1.3116,
  // essentially 10.5/8 = 1.3125). The glyph itself remains the packaged 9x14
  // x3270 raster. A 22-unit row pitch separates glyph rows so the 24-line data
  // area occupies 528 units, leaving a small lower band for the unmodelled
  // operator-information area. These are presentation coordinates, not an IBM
  // hardware framebuffer-resolution claim.
  const ibm3278=profiles.cern_3270_alternate;
  if(ibm3278){
    ibm3278.framebufferWidth=724;
    ibm3278.framebufferHeight=552;
    ibm3278.terminalRect={x:0,y:0,w:724,h:528};
    ibm3278.physicalResolutionStatus="IBM 3278 Model 2 physical-geometry reference: active trace 10.5 × 8 in; 724×552 is a normalized presentation coordinate plane, NOT a hardware pixel resolution";
    ibm3278.pixelAspectStatus="physical active-trace geometry normalized to square presentation coordinates; x3270 9×14 is retained only as a glyph raster reference";
    ibm3278.monitorFrame={
      kind:"crt",
      shell:"ibm-reference",
      label:"IBM 3278 Model 2 geometry reference — 10.5 × 8 in active trace",
      status:"PHYSICAL-GEOMETRY REFERENCE ONLY / MORITA TERMINAL UNCONFIRMED"
    };
    ibm3278.notes=(ibm3278.notes||[]).concat([
      "PHYSICAL GEOMETRY: IBM 3278 maintenance information specifies a 10.5-inch horizontal trace and 8-inch vertical display height for Model 2; the visible CRT is therefore about 1.31:1, not the 2.14:1 ratio of an 80×24 grid made from square 9×14 bitmap cells.",
      "ROW PITCH MODEL: x3270の9×14 bitmapは字形参照として維持し、物理CRT上の行間を表すため22-unit pitchで24行を配置する。9×14を物理画面pixel解像度とは扱わない。",
      "3278 STRUCTURE: Model 2 is 24×80. IBM documentation places an Operator Information Area at the bottom outside the data area; this comparison leaves a small lower band but does not fabricate its status symbols.",
      "IMPORTANT: IBM 3278 Model 2 is used here only to correct the physical-geometry reference for the 3270-class comparison. It is not evidence that Morita used a 3278 at CERN."
    ]);
  }

  // The renderer obtains row spacing from a loaded BDF's cellHeight. For the
  // 3278 physical-geometry comparison only, return a light wrapper around the
  // exact same x3270 font: glyph drawing and font verification remain 9x14,
  // while layout cellHeight becomes 22 to model the CRT row pitch. drawChar is
  // bound to the original font object, so no glyph pixels are stretched.
  function installIBM3278FontLayout(fontAPI){
    if(!fontAPI||fontAPI.__ibm3278LayoutInstalled||typeof fontAPI.loadPublicAsset!=="function")return fontAPI;
    const originalLoad=fontAPI.loadPublicAsset.bind(fontAPI);
    fontAPI.loadPublicAsset=async function(asset){
      const loaded=await originalLoad(asset);
      if(!asset||asset.id!=="x3270_3270_14"||!loaded)return loaded;
      const view=Object.create(loaded);
      Object.defineProperty(view,"cellHeight",{value:22,enumerable:true,configurable:false});
      if(typeof loaded.drawChar==="function")view.drawChar=loaded.drawChar.bind(loaded);
      if(typeof loaded.glyphForChar==="function")view.glyphForChar=loaded.glyphForChar.bind(loaded);
      if(typeof loaded.summary==="function"){
        const originalSummary=loaded.summary.bind(loaded);
        view.summary=function(){
          const s=originalSummary();
          return Object.assign({},s,{
            physicalLayoutRowPitch:22,
            physicalLayoutNote:"IBM 3278 Model 2 geometry reference; glyph raster remains 9×14"
          });
        };
      }
      return view;
    };
    fontAPI.__ibm3278LayoutInstalled=true;
    return fontAPI;
  }

  // profile-geometry-overrides.js is parsed immediately before font-backend.js.
  // Intercept the one-time global assignment so the wrapper is installed before
  // app.js first loads the x3270 asset, without introducing a later re-layout.
  if(root.HistoricalFonts){
    installIBM3278FontLayout(root.HistoricalFonts);
  }else{
    let assigned;
    try{
      Object.defineProperty(root,"HistoricalFonts",{
        configurable:true,
        enumerable:true,
        get:function(){return assigned;},
        set:function(v){
          assigned=installIBM3278FontLayout(v);
          Object.defineProperty(root,"HistoricalFonts",{
            value:assigned,writable:true,configurable:true,enumerable:true
          });
        }
      });
    }catch(e){}
  }

  // palette-controls.js needs the emulator's normal app.js listeners to exist
  // first. Loading it at DOMContentLoaded keeps geometry initialization separate
  // while enabling the real foreground/background switcher in both full and
  // embedded views without editing the historical framebuffer renderer.
  root.addEventListener("DOMContentLoaded",function(){
    if(document.querySelector('script[data-palette-controls]'))return;
    const s=document.createElement("script");
    s.src="src/palette-controls.js?v=0.58";
    s.async=false;
    s.setAttribute("data-palette-controls","1");
    document.body.appendChild(s);
  });
})(typeof self!=="undefined"?self:this);
