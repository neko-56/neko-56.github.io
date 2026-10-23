(function(){
  "use strict";

  const KEK_FG="#f7f7ef";
  const KEK_BG="#69bd5b";
  const profiles=window.TerminalProfiles||{};
  const embedded=new URLSearchParams(location.search).get("embed")==="1";

  const ids={
    decterm:new Set(["kek_decterm_vrt19_candidate","kek_decterm_vrt19_lecture_green"]),
    xterm:new Set(["cern_sun4_reference","cern_next_x11_lmb_green"])
  };

  // Geometry (80x24 grid, xterm internalBorder, KEK-image client padding) is
  // defined separately in profile-geometry-overrides.js. Palette switching must
  // never resize the terminal, otherwise a color comparison also changes layout.
  const original={};
  Object.keys(profiles).forEach(id=>{
    const p=profiles[id];
    original[id]={foreground:p.foreground,background:p.background};
  });

  function activeId(){
    const s=document.getElementById("profile");
    return s?s.value:"";
  }

  function terminalKind(id){
    if(ids.decterm.has(id))return "decterm";
    if(ids.xterm.has(id))return "xterm";
    return "";
  }

  function standardPalette(kind,id){
    if(kind==="xterm")return {foreground:"#000000",background:"#ffffff"};
    // ULTRIX dxterm documents light-on-dark as the default screen mode. Exact
    // site-specific RGB resources are not recovered, so retain the constrained
    // base DECterm profile values instead of inventing a universal RGB pair.
    const base=original.kek_decterm_vrt19_candidate||original[id];
    return {foreground:base.foreground,background:base.background};
  }

  function profilePalette(id){
    const o=original[id];
    return o?{foreground:o.foreground,background:o.background}:null;
  }

  function dispatchScreenModeChangeWithoutFocus(screen){
    if(!embedded){
      screen.dispatchEvent(new Event("change",{bubbles:true}));
      return;
    }

    // app.js normally focuses the canvas after a screen-mode change. In an
    // embedded comparison card that focus scrolls the parent page to the iframe.
    // Suppress only that synthetic initialization focus; a real canvas click
    // still focuses normally.
    const canvas=document.getElementById("display");
    if(!canvas){
      screen.dispatchEvent(new Event("change",{bubbles:true}));
      return;
    }
    const hadOwn=Object.prototype.hasOwnProperty.call(canvas,"focus");
    const previous=canvas.focus;
    canvas.focus=function(){};
    try{
      screen.dispatchEvent(new Event("change",{bubbles:true}));
    }finally{
      if(hadOwn)canvas.focus=previous;
      else delete canvas.focus;
    }
  }

  function applyPalette(mode){
    const id=activeId();
    const kind=terminalKind(id);
    const p=profiles[id];
    if(!kind||!p)return;

    let palette;
    if(mode==="kek") palette={foreground:KEK_FG,background:KEK_BG};
    else if(mode==="standard") palette=standardPalette(kind,id);
    else palette=profilePalette(id);
    if(!palette)return;

    p.foreground=palette.foreground;
    p.background=palette.background;

    // Reset DECterm's light/dark selector to profile so the explicit foreground
    // and background above are what the renderer actually uses.
    const screen=document.getElementById("screenMode");
    if(screen){
      screen.value="profile";
      dispatchScreenModeChangeWithoutFocus(screen);
    }
    updateHowTo(mode);
  }

  function settingText(kind,mode){
    const isKEK=mode==="kek";
    const fg=isKEK?KEK_FG:(kind==="xterm"?"black":"<profile foreground>");
    const bg=isKEK?KEK_BG:(kind==="xterm"?"white":"<profile background>");
    const provenance=isKEK
      ?"※ #69bd5b / #f7f7ef はKEK掲載画像に合わせた比較用近似値。1992年の保存resource値そのものは未確認。"
      :"";

    if(kind==="xterm"){
      return [
        "xterm — 実機での設定例",
        "",
        "command line:",
        `  xterm -fg '${fg}' -bg '${bg}' -b 2 &`,
        "",
        "X resources (.Xdefaults / xrdb):",
        `  XTerm*foreground: ${fg}`,
        `  XTerm*background: ${bg}`,
        "  XTerm*internalBorder: 2",
        "",
        "-fg / foreground = 文字色",
        "-bg / background = 端末クライアント領域の背景色",
        "-b / internalBorder = 文字グリッドと端末端の内側余白（xterm既定2px）",
        provenance
      ].filter(Boolean).join("\n");
    }

    return [
      "DECterm (dxterm) — 実機での設定例",
      "",
      "command line:",
      `  dxterm -fg '${fg}' -bg '${bg}' &`,
      "",
      "X resources (.Xdefaults / xrdb):",
      `  DXterm*foreground: ${fg}`,
      `  DXterm*background: ${bg}`,
      "",
      "-fg / foreground = 文字色",
      "-bg / background = DECterm端末クライアント領域の背景色",
      "DECtermの既定screenModeは light-on-dark。foreground/background はX resourceで変更可能。",
      provenance
    ].filter(Boolean).join("\n");
  }

  let select,howto,details,note;
  function updateHowTo(mode){
    if(!select||!howto)return;
    const id=activeId();
    const kind=terminalKind(id);
    const supported=!!kind;
    select.disabled=!supported;
    if(details)details.hidden=!supported;
    if(note)note.hidden=!supported;
    if(!supported){
      howto.textContent="この候補では当時の前景色・背景色の実機設定方法を確定していません。";
      return;
    }
    howto.textContent=settingText(kind,mode||select.value);
    if(note){
      note.textContent=(mode||select.value)==="kek"
        ?"KEK資料配色：掲載画像との比較用。RGB値は画像合わせで、保存された1992年設定値ではありません。"
        :"配色だけを切り替えます。文字数・フォント・ウィンドウ寸法・余白は変えません。";
    }
  }

  function syncForProfile(){
    const id=activeId();
    const kind=terminalKind(id);
    if(!select)return;
    if(!kind){
      select.value="profile";
      updateHowTo("profile");
      return;
    }
    // Dedicated green profiles start in the KEK comparison palette.
    if(id==="kek_decterm_vrt19_lecture_green"||id==="cern_next_x11_lmb_green"){
      select.value="kek";
      applyPalette("kek");
    }else{
      select.value="profile";
      applyPalette("profile");
    }
  }

  function buildUI(){
    const bar=document.querySelector(".model-operation-bar");
    if(!bar||document.getElementById("paletteMode"))return;

    const style=document.createElement("style");
    style.textContent=`
      .palette-switch{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px}
      .palette-switch label{display:flex;align-items:center;gap:6px;white-space:nowrap}
      .palette-note{flex-basis:100%;color:#9ea9b0;font-size:11px;line-height:1.4}
      .palette-howto{font-size:11px;color:#aeb8be}
      .palette-howto summary{cursor:pointer;color:#c5d7ff;white-space:nowrap}
      .palette-howto pre{white-space:pre-wrap;max-width:680px;margin:7px 0 0;padding:8px;background:#080b0d;border:1px solid #2e3940;border-radius:5px;color:#cdd5da;font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
      body.embed-mode .palette-howto pre{max-width:420px}
    `;
    document.head.appendChild(style);

    const box=document.createElement("div");
    box.className="palette-switch";
    box.innerHTML=`
      <label>配色
        <select id="paletteMode">
          <option value="profile">現在の候補配色</option>
          <option value="standard">実機標準配色</option>
          <option value="kek">KEK資料配色（薄緑＋白）</option>
        </select>
      </label>
      <details class="palette-howto" id="paletteHowTo"><summary>実機での色指定方法</summary><pre id="paletteHowToText"></pre></details>
      <div class="palette-note" id="paletteNote"></div>
    `;

    const actions=bar.querySelector(".model-operation-actions");
    if(actions)bar.insertBefore(box,actions);
    else bar.appendChild(box);

    select=box.querySelector("#paletteMode");
    details=box.querySelector("#paletteHowTo");
    howto=box.querySelector("#paletteHowToText");
    note=box.querySelector("#paletteNote");
    select.addEventListener("change",()=>applyPalette(select.value));

    const profileSelect=document.getElementById("profile");
    if(profileSelect)profileSelect.addEventListener("change",()=>setTimeout(syncForProfile,0));

    const requested=new URLSearchParams(location.search).get("palette");
    syncForProfile();
    if(requested&&["profile","standard","kek"].includes(requested)&&!select.disabled){
      select.value=requested;
      applyPalette(requested);
    }
  }

  buildUI();
})();
