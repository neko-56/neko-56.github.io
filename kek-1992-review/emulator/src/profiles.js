(function (root) {
  "use strict";
  root.TerminalProfiles = {
    cern_morita_unknown: {
      id: "cern_morita_unknown",
      label: "CERN 1992 — Morita terminal (hardware unknown)",
      evidenceLevel: "CONFIRMED BROWSER CLASS / UNKNOWN HARDWARE",
      cols: 80, rows: 24,
      framebufferWidth: 1024, framebufferHeight: 640,
      terminalRect: { x: 42, y: 34, w: 940, h: 572 },
      cell: { w: 11.0, h: 21.0 },
      foreground: "#55e36a", background: "#010502", desktop: "#101310",
      fontFamily: 'Meyrin, MeyrinRegular, "Courier New", Courier, monospace',
      fontCandidate: "Meyrin only as 2013 reconstruction reference; Morita 1992 glyphs unknown",
      fontEvidence: "UNKNOWN for 1992 hardware",
      fontPx: 18, baseline: 16.5,
      cursor: "block", cursorBlink: true,
      phosphorGlow: false, scanlineAlpha: 0, crtVignette: false,
      revealCellsPerSecond: 2800,
      physicalResolutionStatus: "unknown",
      notes: [
        "CONFIRMED: 森田洋平氏は昼食後にCERNの『端末室』へ行き、ネットワーク経由でKEKへログインした。",
        "CONFIRMED: Line Mode Browserは文字端末向けで、CERNの2013年公式再現は80×24文字を基準としている。",
        "UNKNOWN: 1992-09-30に森田氏が使った端末のメーカー、型番、物理解像度、実フォント。",
        "このプロファイルは機種名を推定せず、80×24のLMB表示だけを再現する安全側の基準。",
        "DISPLAY RULE: 実画面内には史料で確認できない説明ラベル・機種名・研究注記を描画しない。"
      ]
    },

    cern_rs6000_reference: {
      id: "cern_rs6000_reference",
      label: "CERN reference — IBM RISC System/6000 / AIX (2013 evidence)",
      evidenceLevel: "CONFIRMED 2013 REFERENCE MACHINE; NOT MORITA IDENTIFICATION",
      cols: 80, rows: 24,
      framebufferWidth: 1024, framebufferHeight: 640,
      terminalRect: { x: 42, y: 34, w: 940, h: 572 },
      cell: { w: 11.0, h: 21.0 },
      foreground: "#52e869", background: "#000402", desktop: "#101310",
      fontFamily: 'Meyrin, MeyrinRegular, "Courier New", Courier, monospace',
      fontCandidate: "Meyrin (2013 CERN Hackday reconstruction from IBM System/6000 screenshots)",
      fontEvidence: "CONFIRMED 2013 reconstruction reference, not original ROM binary",
      fontPx: 18, baseline: 16.5,
      cursor: "block", cursorBlink: true,
      phosphorGlow: false, scanlineAlpha: 0, crtVignette: false,
      revealCellsPerSecond: 2500,
      physicalResolutionStatus: "not established by the 2013 sources used here",
      notes: [
        "CONFIRMED: 2013再現チームは、初期Line Mode Browserが動く古いIBM RISC System/6000 AIX機を実際に参照した。",
        "CONFIRMED: 端末字形はCourierではなく、画面を接写してglyphを再構成した。Meyrinはその成果。",
        "CONFIRMED: 2013再現は文字を1文字ずつ描く見え方も再現した。",
        "IMPORTANT: このRS/6000は2013年の参照実機であり、森田氏が1992年に使った端末だとは確認されていない。"
      ]
    },

    cern_3270_alternate: {
      id: "cern_3270_alternate",
      label: "CERN alternate — IBM 3270-class hypothesis",
      evidenceLevel: "ALTERNATE HYPOTHESIS",
      cols: 80, rows: 24,
      framebufferWidth: 1024, framebufferHeight: 640,
      terminalRect: { x: 42, y: 34, w: 940, h: 572 },
      cell: { w: 11.0, h: 21.0 },
      foreground: "#67e879", background: "#020703", desktop: "#181b18",
      fontFamily: '"Courier New", Courier, monospace',
      fontCandidate: "IBM 3270 glyph set unresolved",
      fontEvidence: "ALTERNATE HYPOTHESIS",
      fontPx: 18, baseline: 16.5,
      cursor: "block", cursorBlink: true,
      phosphorGlow: false, scanlineAlpha: 0, crtVignette: false,
      revealCellsPerSecond: 2500,
      physicalResolutionStatus: "unknown",
      notes: [
        "CERN職員の後年回顧には、初期LMBを fixed size IBM 3270 display で使った例がある。",
        "ただし森田氏の1992-09-30端末を3270と直接結びつける証拠はない。",
        "そのためPhase 2では第一候補から『alternate hypothesis』へ格下げした。"
      ]
    },

    kek_decterm_vrt19_candidate: {
      id: "kek_decterm_vrt19_candidate",
      label: "KEK — DECstation 5000/125 + DECterm + VRT19 candidate",
      evidenceLevel: "CONFIRMED MACHINE / STRONG DISPLAY-STACK CANDIDATE",
      cols: 80, rows: 24,
      framebufferWidth: 1280, framebufferHeight: 1024,
      // The terminal glyph plane is fixed at the verified 80×24 × 8×15 raster.
      // Window-manager/client chrome is reconstructed around it; it never scales the glyph plane.
      terminalRect: { x: 320, y: 270, w: 640, h: 360 },
      cell: { w: 8.0, h: 15.0 },
      foreground: "#e2e2d8", background: "#171917", desktop: "#819797", titlebar: "#d2d3cb",
      screenModeDefault: "light_on_dark",
      screenModeEvidence: "ULTRIX 4.0 dxterm(1X) documents light-on-dark as the default; exact KEK user/session resources remain unknown.",
      alternateTerminalPalette: { foreground: "#171917", background: "#dddcd4" },
      verticalScrollbar: false,
      verticalScrollbarEvidence: "ULTRIX 4.0 dxterm(1X) documents scrollVertical default Off; contemporary .Xdefaults examples can enable it, so KEK state remains unknown.",
      windowChrome: {
        candidate: "DECwindows dxwm/XUI contemporary structure",
        rect: { x: 303, y: 218, w: 674, h: 424 },
        title: "DECterm",
        titleEvidence: "Contemporary DECterm documentation/screenshots use DECterm/DECterm n titles; exact KEK title string is unconfirmed.",
        titleBarHeight: 22,
        menuBarHeight: 20,
        outerBorder: 2,
        innerBorder: 3,
        scrollbarWidth: 15,
        uiFontFamily: "Helvetica, Arial, sans-serif",
        uiFontPx: 12,
        titleFontPx: 12,
        menuItems: ["File", "Edit", "Commands", "Options", "Print", "Help"],
        colors: {
          surface: "#d2d3cb", activeTitle: "#bfc2ba",
          highlight: "#f5f5ec", shadow: "#555953", border: "#111311", text: "#171917"
        }
      },
      fontFamily: '"DEC Terminal", Terminal, "Courier New", Courier, monospace',
      fontCandidate: "Runtime font selection is unresolved until the KEK graphics option / X server is identified. Xws defaults to 75dpi and DECterm Little Font selects 14pt there; Xwst3d defaults to 100dpi and Little Font selects 10pt there. The public 75dpi term14 asset and the media-confirmed ULTRIX 100dpi terminal10 target share the same verified 8x15 glyph raster (195/195).",
      targetFontId: "kek_vrt19_100dpi_little",
      runtimeSelectionStatus: "UNRESOLVED — KEK graphics option / X server not identified",
      graphicsOptionStatus: "UNKNOWN — DECstation 5000/125 + VRT19 was sold in both PX 2D and PXG 3D configurations",
      runtimeFontBranches: [
        {
          id: "xws_75dpi",
          label: "Xws branch — 75dpi Little Font",
          when: "If the KEK session used Xws (ordinary 2D DECstation graphics path)",
          xServer: "Xws",
          defaultDensity: 75,
          fontId: "kek_75dpi_normal",
          dectermLittlePointSize: 14,
          evidence: "ULTRIX/UWS 4.3 documents Xws as 75dpi by default; Xws can be changed explicitly with -fd/-dpi options."
        },
        {
          id: "xwst3d_100dpi",
          label: "Xwst3d branch — 100dpi Little Font",
          when: "If the KEK session used Xwst3d (a 100dpi-default 3D server); exact PXG server binary on the KEK 5000/125 is unresolved",
          xServer: "Xwst3d",
          defaultDensity: 100,
          fontId: "kek_vrt19_100dpi_little",
          dectermLittlePointSize: 10,
          evidence: "ULTRIX/UWS 4.3 documents Xwst3d as 100dpi by default and ships an X11R4 PXG 3D graphics server subset. The exact KEK 5000/125 server command remains unobserved."
        }
      ],
      targetXLFD: "-DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1",
      bundledFontAssetId: "xconsortium_terminal_v22_verified",
      fontEvidence: "Glyph identity and runtime selection are separate evidence domains. ULTRIX 4.3 media directly confirms the 100dpi/10pt terminal10 raster; the public 75dpi term14 metadata matches the Xws/75dpi branch and its normalized 8x15 raster matches the media target 195/195. DEC's 1991 price list shows DECstation 5000/125 + VRT19 packages with both PX 2D and PXG 3D graphics. Therefore neither 75dpi nor 100dpi is promoted as the KEK runtime default until the graphics option or actual X server command is recovered.",
      bitmapPixelScale: 1,
      fontPx: 14, baseline: 12,
      cursor: "block", cursorBlink: true,
      phosphorGlow: false, scanlineAlpha: 0, crtVignette: false,
      revealCellsPerSecond: 0,
      physicalResolutionStatus: "VRT19 candidate: 1280×1024",
      notes: [
        "CONFIRMED: KEK実機はDECstation 5000/125。",
        "CONFIRMED: KEKへのLine Mode Browser導入記録は1992-04-14。",
        "CONTEMPORARY DEC DOC: DECtermの標準端末サイズは24行×80桁、標準カーソルはブロック。",
        "CONTEMPORARY DXTERM DOC: ULTRIX 4.0 dxterm(1X) はscreenMode既定を light-on-dark と明記。dark-on-lightも選択可能で、KEK実機の保存resourceは未確認。",
        "CONTEMPORARY DXTERM DOC: DECterm Little Fontが既定。75dpiでは14pt、100dpiでは10ptを選択する。",
        "CONTEMPORARY UWS SERVER DOC: Xwsは75dpiを既定使用し、Xwst3dは100dpiを既定使用する。Xwsは -fd/-dpi で明示的に密度を変更できる。",
        "HARDWARE BRANCH EVIDENCE: 1991年12月30日のDEC価格表には、DECstation 5000/125 + VRT19としてPX 8-plane 2D構成 (PM322-KN) とPXG 8-plane 3D構成 (PM323-KN) の両方が存在する。展示機のgraphics optionは未同定。",
        "INSTALLATION EVIDENCE: ULTRIX 4.3のUDWFONT430は75dpi font subset、UDWFONT15430は100dpi font subset、UDWWSTSER430はX11R4 PXG 3D graphics server subset。graphics/server未同定の現状では75dpi/100dpiを一意に順位付けしない。",
        "ULTRIX 4.3 MEDIA CONFIRMED: UDWFONT15430 の terminal10.pcf は -DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1 と完全一致。",
        "MEDIA EVIDENCE: ULTRIX 4.3 RISC ISO SHA-256 5b9df38d8babad0976cc84624aa78e4d4aa5f840b5f779c1e82176b87c6d7532 から /RISC/BASE/UDWFONT15430 を直接抽出。",
        "FONT METRICS CONFIRMED: terminal10.pcf は FONTBOUNDINGBOX 8×15、ascent 12 / descent 3、DWIDTH 8。rendererは80×24を640×360pxとして1:1描画し、window chrome追加後もglyph planeを変更しない。",
        "CONTEMPORARY DECWINDOWS DOC: dxwm bannerは左からshrink-to-icon、title bar、push-to-back、resize。DECterm menu barはFile/Edit/Commands/Options/Print/Help。v0.21ではこの構造だけを候補chromeとして再現。",
        "SCROLLBAR DISCIPLINE: dxtermのscrollVertical既定はOff。一方で同時代.Xdefaults例はOnにできるため、KEK既定表示ではOFFとし、実機状態は未確定扱い。",
        "PUBLIC RASTER VERIFIED: X Consortium系 term14.bdf (DECterm Fonts V2.2) は、8×15セルへ正規化するとULTRIX targetと195/195 glyphs・ASCII 95/95で一致。GitHub Pagesではこの公開許諾系統を自動読込する。",
        "LICENSE DISCIPLINE: 公開75dpi metadataを100dpi targetへ書き換えて同一ファイルと称さない。historical targetとrendered glyph sourceをUI/資料で分離する。",
        "RUNTIME BRANCH A: Xwsを使用していた場合、既定は75dpiでDECterm Little Fontは14pt。公開term14はこのmetadataと一致する。",
        "RUNTIME BRANCH B: Xwst3d/PXG 3D server系を使用していた場合、資料上100dpi既定。ULTRIX媒体のterminal10はこの100dpi/10pt glyph targetを直接確認済み。",
        "OPEN RUNTIME ITEM: KEK実機のgraphics option、/etc/ttysのX server command、起動中server名のいずれかを確認するまでruntime branchは未確定。",
        "OPEN EVIDENCE ITEM: ULTRIX 4.3媒体のUDWFONT430/terminal14.pcfを直接抽出し、公開term14およびterminal10と3者比較すれば媒体側75dpi証拠も閉じられる。",
        "STRONG CANDIDATE: VRT19系はTrinitron、1280×1024。KEK展示モニタの背面型番は未確認。",
        "UNKNOWN: KEKで実際にLMBをDECterm上で動かしたか、コンソール等だったか。",
        "DISPLAY RULE: 研究用ラベルは画面内へ描画しない。DECtermタイトル・window geometryは同時代資料に基づく候補であり、KEK実機固有値とは区別する。"
      ]
    }
  };
})(typeof self !== "undefined" ? self : this);
