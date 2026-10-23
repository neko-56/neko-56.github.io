(function(){
  "use strict";

  const KEK_FG="#f7f7ef";
  const KEK_BG="#69bd5b";
  const profiles=window.TerminalProfiles||{};

  const ids={
    decterm:new Set(["kek_decterm_vrt19_candidate","kek_decterm_vrt19_lecture_green"]),
    xterm:new Set(["cern_sun4_reference","cern_next_x11_lmb_green"])
  };

  const original={};
  Object.keys(profiles).forEach(id=>{
    const p=profiles[id];
    original[id]={
      foreground:p.foreground,
      background:p.background,
      terminalRect:p.terminalRect?Object.assign({},p.terminalRect):null
    };
  });

  function expandClient(id,pad){
    const p=profiles[id];
    if(!p||!p.terminalRect||p.__clientPaddingApplied)return;
    const r=p.terminalRect;
    p.terminalRect={x:r.x-pad,y:r.y-pad,w:r.w+pad*2,h:r.h+pad*2};
    p.__clientPaddingApplied=pad;
  }

  // xterm documents internalBorder=2px by default. Keep the 80x24 glyph grid
  // unchanged and add the border outside it.
  expandClient("cern_sun4_reference",2);
  expandClient("cern_next_x11_lmb_green",2);

  // The KEK lecture image visibly has a small green margin outside the glyph
  // grid. 4px is an image-matching comparison value, not an asserted DECterm
  // factory/default resource.
  expandClient("kek_decterm_vrt19_lecture_green",4);

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
    // DECterm's documented default screenMode is light-on-dark. Exact site
    // resource colors vary, so use the existing historically constrained profile
    // colors rather than inventing a universal RGB default.
    const base=original.kek_decterm_vrt19_candidate||original[id];
    return {foreground:base.foreground,background:base.background};
  }

  function profilePalette(id){
    const o=original[id];
    return o?{foreground:o.foreground,background:o.background}:null;
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

    // KEK lecture comparison: preserve the image-derived green client margin.
    // Other DECterm profiles retain their normal client geometry.
    if(id==="kek_decterm_vrt19_lecture_green"){
      const r0=original[id].terminalRect;
      p.terminalRect=mode==="kek"||mode==="profile"
        ?{x:r0.x-4,y:r0.y-4,w:r0.w+8,h:r0.h+8}
        :Object.assign({},r0);
    }

    // xterm internalBorder=2 is independent of foreground/background.
    if(kind==="xterm"){
      const r0=original[id].terminalRect;
      p.terminalRect={x:r0.x-2,y:r0.y-2,w:r0.w+4,h:r0.h+4};
    }

    const screen=document.getElementById("screenMode");
    if(screen){
      screen.value="profile";
      screen.dispatchEvent(new Event("change",{bubbles:true}));
    }
    updateHowTo(mode);
  }

  function settingText(kind,mode){
    const fg=mode==="kek"?KEK_FG:(kind==="xterm"?"black":"<profile foreground>");
    const bg=mode==="kek"?KEK_BG:(kind==="xterm"?"white":"<profile background>");
    if(kind==="xterm"){
      return [
        "xterm command line:",
        `  xterm -fg '${fg}' -bg '${bg}' -b 2 &`,
        "",
        "X resources (.Xdefaults / xrdb):",
        `  XTerm*foreground: ${fg}`,
        `  XTerm*background: ${bg}`,
        "  XTerm*internalBorder: 2",
        "",
        "-b / internalBorder は文字グリッドとクライアント端の距離。xtermの既定は2px。"
      ].join("\n");
    }
    return [
      "DECterm (dxterm) command line:",
      `  dxterm -fg '${fg}' -bg '${bg}' &`,
      "",
      "X resources (.Xdefaults / xrdb):",
      `  DXterm*foreground: ${fg}`,
      `  DXterm*background: ${bg}`,
      "",
      "DECtermの既定screenModeは light-on-dark。foreground/background はX resourceで変更可能。",
      "KEK配色のRGBは掲載画像との比較用近似値で、1992年の保存resource値とは未確認。"
    ].join("\n");
  }

  let select,howto,details;
  function updateHowTo(mode){
    if(!select||!howto)return;
    const id=activeId();
    const kind=terminalKind(id);
    const supported=!!kind;
    select.disabled=!supported;
    if(details)details.hidden=!supported;
    if(!supported){
      howto.textContent="この候補では当時の前景色・背景色の実機設定方法を確定していません。";
      return;
    }
    howto.textContent=settingText(kind,mode||select.value);
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
    // The dedicated lecture-green and NeXT+xterm-green profiles already start
    // in the KEK-reference palette; label that state explicitly in the switcher.
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
      .palette-switch{display:flex;align-items:center;gap:7px;flex-wrap:wrap;font-size:12px}
      .palette-switch label{display:flex;align-items:center;gap:6px;white-space:nowrap}
      .palette-howto{font-size:11px;color:#aeb8be}
      .palette-howto summary{cursor:pointer;color:#c5d7ff;white-space:nowrap}
      .palette-howto pre{white-space:pre-wrap;max-width:640px;margin:7px 0 0;padding:8px;background:#080b0d;border:1px solid #2e3940;border-radius:5px;color:#cdd5da;font:11px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}
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
      <details class="palette-howto" id="paletteHowTo"><summary>実機での設定方法</summary><pre id="paletteHowToText"></pre></details>
    `;

    const actions=bar.querySelector(".model-operation-actions");
    if(actions)bar.insertBefore(box,actions);
    else bar.appendChild(box);

    select=box.querySelector("#paletteMode");
    details=box.querySelector("#paletteHowTo");
    howto=box.querySelector("#paletteHowToText");
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
