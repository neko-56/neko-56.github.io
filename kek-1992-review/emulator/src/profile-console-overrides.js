(function(root){
  "use strict";
  const profiles=root.TerminalProfiles||{};

  // Full-screen character consoles are modeled against the physical CRT face,
  // not as a small terminal raster pasted 1:1 into the graphics framebuffer.
  // The graphics mode remains evidence/spec metadata; the reviewer-facing canvas
  // below is a normalized physical CRT presentation plane.
  const CRT_W=760;
  const CRT_H=570; // 4:3 physical CRT presentation plane

  // KEK DECstation graphics-console comparison.
  const kek=profiles.kek_console_fullscreen_candidate;
  if(kek){
    kek.label="KEK — DECstation 5000/125 / full-screen graphics console candidate";
    kek.evidenceLevel="CONFIRMED GRAPHICS-CONSOLE ROUTE / EXACT KEK CONSOLE FONT GEOMETRY UNRESOLVED";
    kek.windowChrome=null;
    kek.desktop="#050505";
    kek.framebufferWidth=CRT_W;
    kek.framebufferHeight=CRT_H;

    // Keep the existing 80x24 comparison character screen, but make it the
    // dominant CRT image.  9x22 gives a 720x528 logical console plane with a
    // modest 20px horizontal / 21px vertical presentation margin.
    kek.cols=80;
    kek.rows=24;
    kek.cell={w:9,h:22};
    kek.fontPx=20;
    kek.baseline=19;
    kek.fontFamily='"Courier New", Courier, monospace';
    kek.fallbackRasterThreshold=92;
    kek.terminalRect={x:20,y:21,w:720,h:528};
    kek.terminalAlign="top-left";
    kek.terminalPaddingX=0;
    kek.terminalPaddingY=0;

    // Do not reuse the verified DECterm 8x15 raster as if it were the local
    // graphics-console font.  That was the source of the tiny-text failure.
    delete kek.publicFontAssetId;
    delete kek.bundledFontAssetId;
    delete kek.comparisonFontAssetId;
    delete kek.targetFontId;
    delete kek.runtimeFontBranches;

    kek.fontCandidate="full-screen console presentation geometry — exact ULTRIX graphics-console glyph raster unconfirmed";
    kek.fontEvidence="The DECterm 8×15 raster is verified for DECterm, not for the DECstation local graphics console. This profile therefore uses a neutral hard-raster stand-in and maps the 80×24 character screen across the CRT face with modest margins.";
    kek.physicalResolutionStatus="VRT19-class display candidate; graphics framebuffer mode is hardware metadata, while this emulator uses a normalized 4:3 CRT face for the full-screen character-console presentation";
    kek.pixelAspectStatus="CRT PRESENTATION: 80×24 character screen occupies nearly the full active CRT area with modest margins; normalized 760×570 units are not hardware pixels";
    kek.notes=(kek.notes||[]).concat([
      "CONSOLE PRESENTATION: full-screen consoleは小さい80×24 rasterを1280×1024の左上へ貼るモデルではなく、文字画面がCRT有効表示面の大部分を使うモデルとして表示する。",
      "CRT MODEL: 760×570は4:3の物理CRT面を表す正規化presentation unitsで、DECstationのframebuffer modeを760×570と主張するものではない。",
      "FONT DISCIPLINE: DECtermの8×15 bitmapをgraphics consoleの実fontとして流用しない。exact console glyphは未確認。",
      "MARGINS: 80×24文字面の周囲に小さな余白を残す。余白量は実機測定値ではなく、full-screen consoleの物理表示関係を誤解なく示すpresentation値。"
    ]);
  }

  // AIX Version 3 / RS/6000 HFT console comparison.
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
    p.framebufferWidth=CRT_W;
    p.framebufferHeight=CRT_H;

    // Period large-display HFT geometry candidate: 80x25 using 9x20 cells.
    // 720x500 fills most of a 4:3 CRT presentation plane, leaving 20px L/R
    // and 35px T/B.  1280x1024 remains hardware-mode metadata only.
    p.cell={w:9,h:20};
    p.fontPx=18;
    p.baseline=17;
    p.fontFamily='"Courier New", Courier, monospace';
    p.fallbackRasterThreshold=92;
    p.terminalRect={x:20,y:35,w:720,h:500};
    p.terminalAlign="top-left";
    p.terminalPaddingX=0;
    p.terminalPaddingY=0;
    delete p.publicFontAssetId;
    delete p.bundledFontAssetId;
    delete p.comparisonFontAssetId;

    p.fontCandidate="AIX V3 HFT large-display geometry candidate — Rom14.500 9×20; exact raw-console glyph raster not bundled";
    p.fontEvidence="Period AIX V3 HFT terminfo specifies 80×25 and AIX V3 font tables record Rom14.500 as 9×20. The exact CERN 2013 raw-HFT glyph raster is not identified, so a neutral hard-raster stand-in is used.";
    p.physicalResolutionStatus="IBM 6091 Model 19 candidate / 1280×1024 remains hardware-mode metadata; full-screen HFT presentation is normalized to the physical CRT face so the 80×25 character screen occupies nearly the whole display";
    p.pixelAspectStatus="CRT PRESENTATION: normalized 4:3 physical display face; 80×25 character screen fills most of the active area with modest margins. 760×570 is not a framebuffer-mode claim.";
    p.monitorFrame=base.monitorFrame?Object.assign({},base.monitorFrame,{
      label:"IBM 6091 Model 19 candidate — AIX V3 HFT full-screen console",
      status:"80×25 CHARACTER SCREEN ACROSS CRT FACE / 1280×1024 KEPT AS HARDWARE SPEC ONLY"
    }):null;
    p.notes=(base.notes||[]).concat([
      "PERIOD HFT: 1991–92 AIX V3 High Function Terminalは80 columns × 25 lines。",
      "PERIOD FONT GEOMETRY: large-display HFT比較はRom14.500 9×20 geometry候補を使用する。",
      "CONSOLE PRESENTATION: 80×25文字面をCRT有効表示面の大部分へ配置し、周囲に小さな余白を残す。",
      "HARDWARE VS CRT: 1280×1024は6091候補のgraphics/framebuffer mode情報であり、物理CRT面そのものを1280個×1024個の固定セルとして扱わない。",
      "NORMALIZATION: 760×570は4:3 CRT外観のpresentation plane。AIXが760×570へmode switchするという意味ではない。",
      "FONT DISCIPLINE: CERN 2013 Meyrin 9×14はterminal-window側の復元資産であり、raw HFT console fontとは同一視しない。"
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
  if(kekOption)kekOption.textContent="KEK — DECstation 5000/125 / full-screen graphics console candidate";
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
