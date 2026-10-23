(function(root){
  "use strict";
  const profiles=root.TerminalProfiles||{};

  // AIX had a real system-console path distinct from an AIXwindows/aixterm
  // window. IBM documentation describes /dev/console and high-function/graphics
  // displays as console candidates, and a graphics console can operate in text
  // (ASCII) mode as well as a graphical environment.
  //
  // This profile deliberately does NOT claim that the CERN 2013 session used
  // this path. It exists so the reviewer can compare the two technically valid
  // display routes on the same inferred IBM 6091 Model 19 / 1280x1024 display.
  const base=profiles.cern_rs6000_reference;
  if(base){
    const p=Object.assign({},base);
    p.id="cern_rs6000_console_candidate";
    p.label="CERN IBM RS/6000 — AIX graphics-console / HFT full-screen candidate";
    p.evidenceLevel="ATTESTED AIX CONSOLE PATH / EXACT CERN 2013 SESSION MODE UNRESOLVED";
    p.windowChrome=null;
    p.desktop="#000000";
    // The physical display remains the 1280x1024 6091 candidate. With no
    // windowChrome, the renderer paints the whole framebuffer in terminal
    // background and centers the 80x24 Meyrin grid. The 9x14 glyph pixels are
    // not stretched to fill the monitor.
    p.terminalRect={x:0,y:0,w:1280,h:1024};
    p.physicalResolutionStatus="FULL-SCREEN CONSOLE COMPARISON — IBM 6091 Model 19 candidate, 19-inch color / 1280×1024; exact CERN 2013 session mode unresolved";
    p.pixelAspectStatus="1280×1024 physical-display candidate; 80×24 Meyrin 9×14 grid is centered without glyph stretching";
    p.monitorFrame=base.monitorFrame?Object.assign({},base.monitorFrame,{
      label:"IBM 6091 Model 19 candidate — AIX full-screen graphics console path",
      status:"TECHNICALLY VALID AIX CONSOLE ROUTE / NOT IDENTIFIED AS THE CERN 2013 SESSION"
    }):null;
    p.notes=(base.notes||[]).concat([
      "DISPLAY ROUTE: AIXのsystem consoleはAIXwindows/aixtermとは別経路。graphics/high-function displayをtext consoleとして使用できる。",
      "FULL-SCREEN MODEL: window manager decorationを描かず、1280×1024 display全体をterminal backgroundとして扱い、その中央に80×24のMeyrin文字グリッドを置く。",
      "GLYPH DISCIPLINE: Meyrin 9×14 glyphは引き伸ばさない。全画面とは『背景面がモニタ全体』という意味で、80×24文字を1280×1024いっぱいに変形する意味ではない。",
      "UNCERTAINTY: 2013 CERN実機でLine Mode Browserを動かした際にAIXwindows/aixtermだったかgraphics-console/HFTだったかは、このprofileでは確定していない。"
    ]);
    profiles[p.id]=p;
  }

  // Make the already full-screen terminal candidates explicit in their
  // evidence text. These are not GUI terminal windows.
  const priam=profiles.cern_priam_vax_reference;
  if(priam){
    priam.notes=(priam.notes||[]).concat([
      "DISPLAY ROUTE: DMT2200 / Pericom MG200等の物理端末接続候補では、GUI windowではなく端末CRTの文字画面そのものが全画面になる。"
    ]);
  }
  const ibm3270=profiles.cern_3270_alternate;
  if(ibm3270){
    ibm3270.notes=(ibm3270.notes||[]).concat([
      "DISPLAY ROUTE: IBM 3270-class候補はwindowed terminal emulatorではなく、物理3270 displayの全画面文字面として扱う。"
    ]);
  }
})(typeof self!=="undefined"?self:this);
