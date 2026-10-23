(function(root){
  "use strict";
  const profiles=root.TerminalProfiles||{};

  // KEK DECstation local graphics-console comparison.
  //
  // DECstation firmware can route the system console to the workstation graphics
  // monitor (setenv console *), and ULTRIX Worksystem Software documents a dumb
  // terminal display driver which writes /dev/console text directly to the
  // workstation screen when it is not redirected through /dev/xcons. That is a
  // real windowless display route: it does NOT mean that an 80x24 character grid
  // is scaled up to fill every framebuffer pixel.
  const kekConsole=profiles.kek_console_fullscreen_candidate;
  if(kekConsole){
    kekConsole.label="KEK — DECstation 5000/125 / graphics console (windowless) comparison";
    kekConsole.evidenceLevel="CONFIRMED GRAPHICS-CONSOLE ROUTE / LMB CONSOLE GEOMETRY UNCONFIRMED";
    kekConsole.physicalResolutionStatus="graphics-monitor console path on the DECstation; 1280×1024 VRT19-class framebuffer candidate, while the exact ULTRIX console text geometry used at KEK is unconfirmed";
    kekConsole.pixelAspectStatus="framebuffer/display candidate only; current 80×24 / 8×15 text grid is a comparison model and is not asserted as the exact KEK console font geometry";
    kekConsole.notes=(kekConsole.notes||[]).concat([
      "CONSOLE ROUTE: DECstation 5000ではgraphics monitorをsystem consoleに選択できる。これはDECwindows/DECtermのwindowとは別の表示経路。",
      "ULTRIX DISPLAY DRIVER: ULTRIX Worksystem Softwareは通常のconsole outputをdumb terminal display driverでworkstation screenへ直接描画し、X server稼働中ならconsole文字がX displayの一部を上書きし得ると説明している。",
      "POSITION: graphics consoleの文字はwindow中央へ置くのではなく、glass-tty型consoleとして画面左上側から始まるモデルを維持する。",
      "IMPORTANT: 現在の80×24・8×15は比較用。8×15 DEC Terminal rasterがDECterm用として検証済みであることと、同じglyphがKEKのgraphics consoleで使われたことは別であり、console実fontは未確認。",
      "WORDING: 『全画面』は文字をframebuffer全面へ引き伸ばす意味ではないため、公開UIでは『graphics console（ウィンドウなし）』と呼ぶ。"
    ]);
  }

  // AIX Version 3 / RS/6000 console comparison.
  //
  // Period AIX V3 terminfo identifies the native HFT as 80 columns x 25 lines.
  // The AIX V3 font table documents Rom14.500 as a 9x20 bitmap, and aixterm's
  // HFT emulation uses Rom14.500 by default on a large display.  That is a much
  // better period geometry anchor for the 19-inch / 1280x1024 6091 candidate
  // than reusing the CERN-2013 Meyrin 9x14 / 80x24 browser-window raster.
  //
  // Exact raw-HFT console glyph bytes and the CERN 2013 session route remain
  // unresolved, so the renderer uses a hard 1-bit monospace stand-in at the
  // documented 9x20 cell geometry rather than claiming Meyrin is the HFT font.
  const base=profiles.cern_rs6000_reference;
  if(base){
    const p=Object.assign({},base);
    p.id="cern_rs6000_console_candidate";
    p.label="CERN IBM RS/6000 — AIX V3 HFT graphics-console candidate";
    p.evidenceLevel="PERIOD AIX V3 HFT 80×25 ATTESTED / EXACT CERN 2013 SESSION MODE UNRESOLVED";
    p.cols=80;
    p.rows=25;
    p.windowChrome=null;
    p.desktop="#000000";
    p.terminalRect={x:0,y:0,w:1280,h:1024};
    p.cell={w:9,h:20};
    p.fontPx=18;
    p.baseline=17;
    p.fontFamily='"Courier New", Courier, monospace';
    p.fallbackRasterThreshold=92;
    delete p.publicFontAssetId;
    delete p.bundledFontAssetId;
    delete p.comparisonFontAssetId;
    p.fontCandidate="AIX V3 HFT large-display geometry candidate — Rom14.500 9×20; exact raw-console glyph raster not bundled";
    p.fontEvidence="Period AIX V3 HFT terminfo specifies 80×25. AIX V3 font tables record Rom14.500 as 9×20, and aixterm HFT emulation selects Rom14.500 for a large display. This anchors cell geometry only; it does not prove the exact CERN 2013 console glyph raster.";
    p.physicalResolutionStatus="WINDOWLESS AIX V3 HFT COMPARISON — IBM 6091 Model 19 candidate, 19-inch color / 1280×1024; exact CERN 2013 session route unresolved";
    p.pixelAspectStatus="1280×1024 display candidate; period HFT logical screen is 80×25, using a 9×20 large-display cell candidate without stretching glyphs to fill the monitor";
    p.monitorFrame=base.monitorFrame?Object.assign({},base.monitorFrame,{
      label:"IBM 6091 Model 19 candidate — AIX V3 HFT console path",
      status:"PERIOD HFT 80×25 GEOMETRY / NOT IDENTIFIED AS THE CERN 2013 SESSION"
    }):null;
    p.notes=(base.notes||[]).concat([
      "PERIOD HFT: 1991–92 AIX V3のHigh Function Terminalはterminfo上80 columns × 25 lines。80×24ではない。",
      "PERIOD FONT GEOMETRY: AIX V3のXfonts表ではRom14.500=9×20、Rom10.500=8×14。aixterm HFT emulationはlarge displayでRom14.500を既定とする。",
      "CONSOLE MODEL: 6091 Model 19候補の1280×1024表示面上に80×25・9×20のHFT logical screenを置く。文字bitmapを1280×1024へ引き伸ばさない。",
      "FONT DISCIPLINE: CERN 2013のMeyrin 9×14は参照実機のterminal字形復元であり、raw HFT console fontとは同一視しない。このconsole候補ではMeyrinを使用しない。",
      "UNCERTAINTY: 2013 CERN実機でLine Mode Browserを動かしたセッションがAIXwindows/aixtermだったかnative HFT consoleだったか、またraw HFTの正確なfont bytes・foreground色・screen placementは未確定。"
    ]);
    profiles[p.id]=p;
  }

  const priam=profiles.cern_priam_vax_reference;
  if(priam){
    priam.notes=(priam.notes||[]).concat([
      "DISPLAY ROUTE: DMT2200 / Pericom MG200等の物理端末接続候補では、GUI windowではなく端末CRTの文字画面そのものが表示面になる。"
    ]);
  }
  const ibm3270=profiles.cern_3270_alternate;
  if(ibm3270){
    ibm3270.notes=(ibm3270.notes||[]).concat([
      "DISPLAY ROUTE: IBM 3270-class候補はwindowed terminal emulatorではなく、物理3270 displayの文字面として扱う。"
    ]);
  }

  // Update reviewer-facing wording without changing the historical profile ids.
  const kekOption=document.querySelector('#profile option[value="kek_console_fullscreen_candidate"]');
  if(kekOption)kekOption.textContent="KEK — DECstation 5000/125 / graphics console（ウィンドウなし）";
  const aixOption=document.querySelector('#profile option[value="cern_rs6000_console_candidate"]');
  if(aixOption)aixOption.textContent="CERN candidate — IBM RS/6000 / AIX V3 HFT console（ウィンドウなし・80×25）";

  // app.js historically keeps standalone auto display at >=100% for pixel-level
  // inspection. In browser Fullscreen that can crop a 1280x1024 framebuffer plus
  // its physical bezel. Load a presentation-only fitter after app.js has installed
  // its own fullscreen redraw listener; backing framebuffer pixels stay unchanged.
  root.addEventListener("DOMContentLoaded",function(){
    if(document.querySelector('script[data-fullscreen-fit]'))return;
    const s=document.createElement("script");
    s.src="src/fullscreen-fit.js?v=0.62";
    s.setAttribute("data-fullscreen-fit","1");
    document.body.appendChild(s);
  });
})(typeof self!=="undefined"?self:this);
