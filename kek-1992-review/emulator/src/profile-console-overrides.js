(function(root){
  "use strict";
  const profiles=root.TerminalProfiles||{};

  // KEK DECstation local graphics-console comparison.
  // Keep this as a separate research path. Its exact console font/geometry is
  // not asserted from the DECterm raster.
  const kekConsole=profiles.kek_console_fullscreen_candidate;
  if(kekConsole){
    kekConsole.label="KEK — DECstation 5000/125 / graphics console (windowless) comparison";
    kekConsole.evidenceLevel="CONFIRMED GRAPHICS-CONSOLE ROUTE / LMB CONSOLE GEOMETRY UNCONFIRMED";
    kekConsole.physicalResolutionStatus="graphics-monitor console path on the DECstation; VRT19-class display candidate, exact ULTRIX console text geometry at KEK unconfirmed";
    kekConsole.pixelAspectStatus="physical display and console character geometry are separate; current KEK console grid remains a comparison model";
    kekConsole.notes=(kekConsole.notes||[]).concat([
      "CONSOLE ROUTE: DECstation 5000ではgraphics monitorをsystem consoleに選択できる。これはDECwindows/DECtermのwindowとは別の表示経路。",
      "IMPORTANT: DECtermで検証した8×15 glyphを、そのままKEK graphics consoleの実fontとは断定しない。"
    ]);
  }

  // AIX Version 3 / RS/6000 HFT console comparison.
  //
  // IMPORTANT MODEL SEPARATION:
  // 1280x1024 belongs to the inferred IBM 6091 display/framebuffer mode.
  // 80x25 belongs to the HFT character screen.  Do NOT place a tiny 720x500
  // character raster literally inside a 1280x1024 canvas and call that the
  // historical appearance.  For reviewer presentation we normalize the 5:4
  // CRT active area to 800x640 and map the 80x25 HFT character screen across
  // most of that area with a modest border.  This represents the relationship
  // "full-screen character console with CRT margins" without pretending that
  // normalized presentation units are hardware framebuffer pixels.
  const base=profiles.cern_rs6000_reference;
  if(base){
    const p=Object.assign({},base);
    p.id="cern_rs6000_console_candidate";
    p.label="CERN IBM RS/6000 — AIX V3 HFT full-screen console candidate";
    p.evidenceLevel="PERIOD AIX V3 HFT 80×25 ATTESTED / EXACT CERN 2013 SESSION MODE UNRESOLVED";
    p.cols=80;
    p.rows=25;
    p.windowChrome=null;
    p.desktop="#000000";

    // Normalized 5:4 CRT presentation plane.  This is deliberately NOT a claim
    // that the console changed the 6091 hardware mode to 800x640.
    p.framebufferWidth=800;
    p.framebufferHeight=640;

    // 80 x 25 at 9 x 20 = 720 x 500.  Place it as the dominant screen area,
    // leaving a visible CRT border: 40 units left/right and 70 top/bottom.
    p.terminalRect={x:40,y:70,w:720,h:500};
    p.terminalAlign="top-left";
    p.terminalPaddingX=0;
    p.terminalPaddingY=0;
    p.cell={w:9,h:20};
    p.fontPx=18;
    p.baseline=17;
    p.fontFamily='"Courier New", Courier, monospace';
    p.fallbackRasterThreshold=92;
    delete p.publicFontAssetId;
    delete p.bundledFontAssetId;
    delete p.comparisonFontAssetId;

    p.fontCandidate="AIX V3 HFT large-display geometry candidate — Rom14.500 9×20; exact raw-console glyph raster not bundled";
    p.fontEvidence="Period AIX V3 HFT terminfo specifies 80×25. AIX V3 font tables record Rom14.500 as 9×20, and aixterm HFT emulation selects Rom14.500 for a large display. This anchors character-cell geometry only; it does not identify the exact CERN 2013 raw-console glyph raster.";
    p.physicalResolutionStatus="IBM 6091 Model 19 candidate remains 19-inch / 1280×1024 at the hardware level; emulator uses an 800×640 normalized 5:4 presentation plane so the 80×25 HFT screen fills the CRT with margins instead of being plotted as a tiny raster in hardware-pixel coordinates";
    p.pixelAspectStatus="NORMALIZED PRESENTATION: 5:4 CRT geometry; 80×25 character screen mapped over most of the active display with margins. 800×640 is not a historical framebuffer-mode claim.";
    p.monitorFrame=base.monitorFrame?Object.assign({},base.monitorFrame,{
      label:"IBM 6091 Model 19 candidate — AIX V3 HFT full-screen console",
      status:"80×25 CHARACTER SCREEN MAPPED TO CRT AREA / 1280×1024 RETAINED AS HARDWARE SPEC ONLY"
    }):null;
    p.notes=(base.notes||[]).concat([
      "PERIOD HFT: 1991–92 AIX V3のHigh Function Terminalは80 columns × 25 lines。",
      "PERIOD FONT GEOMETRY: AIX V3資料ではRom14.500=9×20、Rom10.500=8×14。large-display HFT比較では9×20をgeometry候補とする。",
      "DISPLAY MAPPING: 80×25文字面をCRT有効表示面の大部分へ配置し、周囲に余白を残す。1280×1024を文字配置座標として直接使わない。",
      "HARDWARE VS CONSOLE: 1280×1024は6091候補のhardware/framebuffer specification。80×25はconsole logical screen。両者を同じ座標系として扱わない。",
      "NORMALIZATION: emulatorの800×640は5:4 CRT比率を示すpresentation planeであり、AIXが800×640へmode switchしたという意味ではない。",
      "FONT DISCIPLINE: CERN 2013のMeyrin 9×14はterminal-window側の復元資産であり、raw HFT console fontとは同一視しない。",
      "UNCERTAINTY: CERN 2013実機セッションがaixtermだったかnative HFT consoleだったか、またHFTの正確なglyph bytes・CRT内marginは未確定。"
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

  const kekOption=document.querySelector('#profile option[value="kek_console_fullscreen_candidate"]');
  if(kekOption)kekOption.textContent="KEK — DECstation 5000/125 / graphics console（ウィンドウなし）";
  const aixOption=document.querySelector('#profile option[value="cern_rs6000_console_candidate"]');
  if(aixOption)aixOption.textContent="CERN candidate — IBM RS/6000 / AIX V3 HFT full-screen console（80×25）";

  root.addEventListener("DOMContentLoaded",function(){
    if(document.querySelector('script[data-fullscreen-fit]'))return;
    const s=document.createElement("script");
    s.src="src/fullscreen-fit.js?v=0.62";
    s.setAttribute("data-fullscreen-fit","1");
    document.body.appendChild(s);
  });
})(typeof self!=="undefined"?self:this);
