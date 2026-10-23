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

  // AIX had a real system-console path distinct from an AIXwindows/aixterm
  // window. IBM documentation describes /dev/console and high-function/graphics
  // displays as console candidates, and a graphics console can operate in text
  // (ASCII) mode as well as a graphical environment.
  const base=profiles.cern_rs6000_reference;
  if(base){
    const p=Object.assign({},base);
    p.id="cern_rs6000_console_candidate";
    p.label="CERN IBM RS/6000 — AIX graphics-console / HFT windowless candidate";
    p.evidenceLevel="ATTESTED AIX CONSOLE PATH / EXACT CERN 2013 SESSION MODE UNRESOLVED";
    p.windowChrome=null;
    p.desktop="#000000";
    p.terminalRect={x:0,y:0,w:1280,h:1024};
    p.physicalResolutionStatus="WINDOWLESS GRAPHICS-CONSOLE COMPARISON — IBM 6091 Model 19 candidate, 19-inch color / 1280×1024; exact CERN 2013 session mode unresolved";
    p.pixelAspectStatus="1280×1024 physical-display candidate; 80×24 Meyrin 9×14 grid is displayed without glyph stretching";
    p.monitorFrame=base.monitorFrame?Object.assign({},base.monitorFrame,{
      label:"IBM 6091 Model 19 candidate — AIX windowless graphics-console path",
      status:"TECHNICALLY VALID AIX CONSOLE ROUTE / NOT IDENTIFIED AS THE CERN 2013 SESSION"
    }):null;
    p.notes=(base.notes||[]).concat([
      "DISPLAY ROUTE: AIXのsystem consoleはAIXwindows/aixtermとは別経路。graphics/high-function displayをtext consoleとして使用できる。",
      "WINDOWLESS MODEL: window manager decorationを描かず、1280×1024 display全体をterminal backgroundとして扱い、80×24のMeyrin文字グリッドを置く。",
      "GLYPH DISCIPLINE: Meyrin 9×14 glyphは引き伸ばさない。windowless consoleとは『背景面がモニタ全体』という意味で、80×24文字を1280×1024いっぱいに変形する意味ではない。",
      "UNCERTAINTY: 2013 CERN実機でLine Mode Browserを動かした際にAIXwindows/aixtermだったかgraphics-console/HFTだったかは、このprofileでは確定していない。"
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
  if(aixOption)aixOption.textContent="CERN candidate — IBM RS/6000 / AIX graphics console（ウィンドウなし）";

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
