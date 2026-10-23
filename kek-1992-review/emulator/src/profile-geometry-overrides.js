(function(root){
  "use strict";
  const profiles=root.TerminalProfiles||{};

  // X11 xterm: the VT100 widget has an internalBorder between the character
  // grid and the client edge.  Use the documented/default 2px value while
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
  // the green client area.  The 4px client padding is an image-matching aid
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
})(typeof self!=="undefined"?self:this);
