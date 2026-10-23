(function (root) {
  "use strict";
  root.TerminalProfiles = {
    cern_morita_unknown: {
      id: "cern_morita_unknown",
      label: "CERN 1992 — standard 80×24 LMB comparison (machine unspecified)",
      evidenceLevel: "CONFIRMED BROWSER CLASS / UNKNOWN HARDWARE",
      cols: 80, rows: 24,
      // Physical monitor geometry is unknown. For reviewer-facing CERN candidates,
      // reconstruct only the 80x24 text display plane rather than inventing a monitor.
      framebufferWidth: 480, framebufferHeight: 312,
      terminalRect: { x: 0, y: 0, w: 480, h: 312 },
      cell: { w: 6.0, h: 13.0 },
      // Exact 1992 terminal palette and glyphs are unknown. Use a neutral,
      // high-contrast presentation here rather than inventing a green-screen
      // identity. The CERN 2013 RS/6000 reference remains a separate profile.
      foreground: "#f2f2ec", background: "#050505", desktop: "#111111",
      comparisonFontAssetId: "x11_fixed_6x13",
      fontFamily: '"X11FixedRuntime", fixed, monospace',
      fontCandidate: "period X11 fixed 6×13 used only as a neutral local comparison raster",
      fontEvidence: "UNKNOWN for Morita's actual 1992 terminal. This profile uses a documented period bitmap only to avoid a modern CSS-font fallback; it is not a terminal identification.",
      fallbackRasterThreshold: 72,
      fontPx: 13, baseline: 11,
      cursor: "block", cursorBlink: true,
      phosphorGlow: false, scanlineAlpha: 0, crtVignette: false,
      revealCellsPerSecond: 2800,
      physicalResolutionStatus: "not asserted — 80×24 content plane only; physical monitor intentionally unspecified",
      monitorFrame: { kind:"comparison", shell:"neutral-plane", label:"80×24 comparison plane — physical terminal not identified", status:"UNKNOWN HARDWARE" },
      notes: [
        "CONFIRMED: 森田洋平氏は昼食後にCERNの『端末室』へ行き、ネットワーク経由でKEKへログインした。",
        "CONFIRMED: Line Mode Browserは文字端末向けで、CERNの2013年公式再現は80×24文字を基準としている。",
        "UNKNOWN: 1992-09-30に森田氏が使った端末のメーカー、型番、物理解像度、実フォント。",
        "このプロファイルは機種名・文字色・実フォントを推定せず、80×24のLMB表示内容と操作を確認するための中立表示。",
        "表示色とX11 fixed glyphは比較用の中立表現であり、1992年CERN実機の外観・字形を示す証拠ではない。",
        "DISPLAY RULE: 実画面内には史料で確認できない説明ラベル・機種名・研究注記を描画しない。"
      ]
    },

    cern_rs6000_reference: {
      id: "cern_rs6000_reference",
      label: "CERN reference — IBM RISC System/6000 / AIX (2013 evidence)",
      evidenceLevel: "CONFIRMED 2013 REFERENCE MACHINE; NOT MORITA IDENTIFICATION",
      cols: 80, rows: 24,
      // 2013 reference captures the Line Mode Browser experience, but the
      // physical monitor geometry used by Morita in 1992 is not inferred here.
      framebufferWidth: 720, framebufferHeight: 336,
      terminalRect: { x: 0, y: 0, w: 720, h: 336 },
      cell: { w: 9.0, h: 14.0 },
      foreground: "#52e869", background: "#000402", desktop: "#101310",
      publicFontAssetId: "meyrin_cern_rs6000",
      fontFamily: '"MeyrinRuntime", Meyrin, MeyrinRegular, monospace',
      fontCandidate: "Meyrin — CERN reconstruction from the IBM RISC System/6000 reference terminal",
      fontEvidence: "2013 reconstruction team photographed the IBM System/6000 display; the published reconstruction uses a 9×14 glyph grid and is licensed for reuse.",
      fontPx: 14, baseline: 12,
      cursor: "block", cursorBlink: true,
      phosphorGlow: false, scanlineAlpha: 0, crtVignette: false,
      revealCellsPerSecond: 2500,
      physicalResolutionStatus: "not asserted here — 80×24 text display plane only",
      monitorFrame: { kind:"reference", shell:"ibm-reference", label:"IBM RISC System/6000 reference display — 2013 CERN reconstruction", status:"2013 REFERENCE; 1992 MORITA DISPLAY NOT IDENTIFIED" },
      notes: [
        "CONFIRMED: 2013再現チームは、初期Line Mode Browserが動く古いIBM RISC System/6000 AIX機を実際に参照した。",
        "CONFIRMED: 端末字形はCourierではなく、画面を接写してglyphを再構成した。Meyrinはその成果。",
        "CONFIRMED: 2013再現は文字を1文字ずつ描く見え方も再現した。",
        "IMPORTANT: このRS/6000は2013年の参照実機であり、森田氏が1992年に使った端末だとは確認されていない。"
      ]
    },

    cern_sun4_reference: {
      id: "cern_sun4_reference",
      label: "CERN documented platform — Sun-4 / 1152×900 official monitor configuration candidate",
      evidenceLevel: "DOCUMENTED 1991 LMB PLATFORM / PERIOD SUN DISPLAY CONFIGURATION CANDIDATE",
      cols: 80, rows: 24,
      // Sun's Dec-1988 price list offered several displays for Sun-4. 1152×900
      // was a documented 19-inch monochrome/color configuration. The exact CERN
      // desk monitor is not identified, so this remains a configuration candidate.
      framebufferWidth: 1152, framebufferHeight: 900,
      terminalRect: { x: 336, y: 294, w: 480, h: 312 },
      cell: { w: 6.0, h: 13.0 },
      foreground: "#eeeeea", background: "#101010", desktop: "#8d9a9a",
      windowChrome: {
        kind:"xterm", candidate:"Sun-4 X11/xterm candidate",
        rect:{x:320,y:260,w:512,h:356}, title:"xterm", titleBarHeight:22,
        colors:{frame:"#b8b8b3",title:"#d4d4cd",titleText:"#111111",border:"#111111"}
      },
      publicFontAssetId: "x11_fixed_6x13",
      fontFamily: '"X11FixedRuntime", fixed, monospace',
      fontCandidate: "X11 standard fixed bitmap — 6×13",
      fontEvidence: "Sun-4 is a documented early LMB platform. The X11 comparison uses the standard local 6×13 fixed bitmap. The 1152×900 monitor is an official period Sun configuration candidate, not an identification of Morita's desk monitor.",
      fallbackRasterThreshold: 72,
      fontPx: 13, baseline: 11,
      cursor: "block", cursorBlink: true,
      phosphorGlow: false, scanlineAlpha: 0, crtVignette: false,
      revealCellsPerSecond: 0,
      physicalResolutionStatus: "official 1988 Sun monitor configuration candidate: 19-inch 1152×900; exact CERN unit unconfirmed",
      monitorFrame: { kind:"crt", shell:"sun-19", label:"Sun 19-inch 1152×900 configuration candidate", status:"PERIOD OFFICIAL CONFIGURATION / CERN UNIT UNCONFIRMED" },
      notes: [
        "DOCUMENTED PLATFORM: W3Cの初期WWW史は、1991年3月にLine Mode Browserがsun4で限定公開されたと記録している。",
        "PERIOD SUN CONFIGURATION: 1988年Sun価格表にはSun-4向けとして19-inch 1152×900 monochrome/color/grayscale構成が掲載され、同時に1024×768や1600×1280の別構成も存在する。",
        "UNKNOWN: CERNでLine Mode Browserを使ったSun-4の正確なworkstation型番・モニタ型番は未同定。したがって1152×900を唯一の実機構成とは扱わない。",
        "STANDARD MODEL: X11環境での比較にはX11 fixed 6×13 bitmapをローカル同梱して使用する。",
        "GEOMETRY RULE: 1152×900 framebufferと480×312の80×24 xterm文字面を別々に保持し、文字面をモニター全面へ引き伸ばさない。"
      ]
    },

    cern_priam_vax_reference: {
      id: "cern_priam_vax_reference",
      label: "CERN PRIAM — DEC VAX 8530 / ULTRIX; attached terminal unresolved",
      evidenceLevel: "DOCUMENTED CERN VAX 8530 HOST / ATTACHED TERMINAL UNRESOLVED",
      cols: 80, rows: 24,
      framebufferWidth: 480, framebufferHeight: 312,
      terminalRect: { x: 0, y: 0, w: 480, h: 312 },
      cell: { w: 6.0, h: 13.0 },
      foreground: "#eeeeea", background: "#101010", desktop: "#101010",
      comparisonFontAssetId: "x11_fixed_6x13",
      fontFamily: '"X11FixedRuntime", fixed, monospace',
      fontCandidate: "period X11 fixed 6×13 used as a local comparison raster only; PRIAM host does not determine terminal glyphs",
      fontEvidence: "CERN documentation identifies PRIAM as a VAX 8530 running ULTRIX. The attached display terminal is still unresolved, so no invented 'VAX font' is used. The local X11 fixed raster is only a visible comparison placeholder, explicitly not a terminal identification.",
      fallbackRasterThreshold: 72,
      fontPx: 13, baseline: 11,
      cursor: "block", cursorBlink: true,
      phosphorGlow: false, scanlineAlpha: 0, crtVignette: false,
      revealCellsPerSecond: 0,
      physicalResolutionStatus: "host identified as VAX 8530; attached terminal/monitor not identified",
      monitorFrame: { kind:"comparison", shell:"neutral-plane", label:"PRIAM VAX 8530 — terminal not yet identified", status:"HOST CONFIRMED / DISPLAY UNKNOWN" },
      monitorAlternatives: [
        "DMT2200 — CERN-recommended low-cost alphanumeric terminal, mainly 80 chars/line, VT220-compatible",
        "Pericom MG200 Monterey — CERN-recommended 80/132-column graphics terminal; 17-inch / 1024×780 documented in period sources"
      ],
      notes: [
        "DOCUMENTED HOST: CERNの1988年資料はPRIAMをVAX 8530 / ULTRIXとして記録している。",
        "DOCUMENTED PLATFORM: W3Cの初期WWW史は、1991年3月にLine Mode Browserが'priam' VAXで限定公開されたと記録している。",
        "CERN TERMINAL STANDARD CANDIDATES: CERN 1986年報はDMT2200を主に80 chars/lineの安価な英数字端末、Pericom MG200 Montereyを80/132 chars/line＋graphics用途として推奨し、両者をVT220-compatibleとしている。",
        "UNKNOWN: 1992-09-30にPRIAMへ接続した森田氏の実端末がDMT2200・MG200・その他のどれだったかは未確認。",
        "DISPLAY DISCIPLINE: VAXホスト名から架空のVAXフォントやモニター形状を作らない。具体端末が同定されるまで物理筐体は断定しない。"
      ]
    },



    cern_nextstep_terminal_lmb: {
      id: "cern_nextstep_terminal_lmb",
      label: "CERN candidate — NeXTSTEP Terminal.app + Line Mode Browser",
      evidenceLevel: "TECHNICALLY PLAUSIBLE / MORITA USE UNCONFIRMED",
      cols: 80, rows: 24,
      framebufferWidth: 1120, framebufferHeight: 832,
      terminalRect: { x: 214, y: 182, w: 640, h: 384 },
      cell: { w: 8.0, h: 16.0 },
      foreground: "#111111", background: "#f4f4f0", desktop: "#585858",
      windowChrome: {
        kind: "nextstep",
        candidate: "NeXTSTEP 2.1/3.0 Terminal.app window candidate",
        rect: { x: 196, y: 148, w: 676, h: 452 },
        title: "Terminal",
        titleBarHeight: 24,
        bottomBarHeight: 16,
        colors: { frame: "#a9a9a5", keyTitle: "#050505", titleText: "#f4f4f0", border: "#191919", body: "#f4f4f0" }
      },
      fontFamily: 'Ohlfs',
      requiresHistoricalRaster: true,
      historicalRasterStatus: "RECONSTRUCTION ASSET NOT YET PINNED — DO NOT FALL BACK",
      fontCandidate: "Ohlfs 10pt — NeXTSTEP Terminal standard default",
      fontEvidence: "NeXT documentation records Ohlfs 10pt as the Terminal default. The original Ohlfs font bytes do not have a verified redistribution grant in this project, so this profile records the standard setting without silently substituting a claimed exact raster.",
      fallbackRasterThreshold: 92,
      fontPx: 14, baseline: 13,
      cursor: "block", cursorBlink: true,
      phosphorGlow: false, scanlineAlpha: 0, crtVignette: false,
      revealCellsPerSecond: 0,
      physicalResolutionStatus: "NeXT MegaPixel Display family: 17-inch, 1120×832; exact CERN/Morita unit unconfirmed",
      monitorFrame: { kind:"crt", shell:"next-megapixel", label:"NeXT MegaPixel Display family — 17-inch / 1120×832", status:"DOCUMENTED HARDWARE FAMILY CANDIDATE" },
      pixelAspectStatus: "CERN 2019 reconstruction documents pixels wider than tall on the physical NeXT CRT; exact numeric pixel aspect ratio not recovered, so no unquantified stretch is applied.",
      notes: [
        "CERN DOCUMENTED: Line Mode Browser was designed as a cross-platform browser and could run on many Unix systems.",
        "NeXTSTEP DOCUMENTED: Terminal.app supplied conventional VT100-style terminal windows; its documented default font is Ohlfs 10pt.",
        "UNKNOWN: 森田氏が1992-09-30にNeXT機上でLine Mode Browserを実行した直接証拠はない。",
        "COLOR DISCIPLINE: 1992年のNeXTSTEP 2.1/3.0 native Terminal.appで任意の前景・背景色設定ができたとは現時点で確認できないため、この候補では薄緑背景を採用しない。",
        "DISPLAY RULE: NeXTのGUI候補を示すためのwindow chromeであり、森田氏の実画面配置を断定しない。"
      ]
    },

    cern_next_x11_lmb_green: {
      id: "cern_next_x11_lmb_green",
      label: "CERN candidate — color NeXT + X11/xterm + Line Mode Browser",
      evidenceLevel: "TECHNICALLY POSSIBLE COLOR PATH / MORITA USE UNCONFIRMED",
      cols: 80, rows: 24,
      framebufferWidth: 1120, framebufferHeight: 832,
      terminalRect: { x: 280, y: 214, w: 480, h: 312 },
      cell: { w: 6.0, h: 13.0 },
      foreground: "#f7f7ef", background: "#69bd5b", desktop: "#6d6d84",
      windowChrome: {
        kind: "xterm",
        candidate: "NeXT color workstation + X11R4/xterm candidate",
        rect: { x: 264, y: 184, w: 512, h: 356 },
        title: "xterm",
        titleBarHeight: 22,
        colors: { frame: "#b8b8b8", title: "#8d8d8d", titleText: "#111111", border: "#111111" }
      },
      publicFontAssetId: "x11_fixed_6x13",
      fontFamily: '"X11FixedRuntime", fixed, monospace',
      fontCandidate: "X11 standard fixed bitmap — 6×13",
      fontEvidence: "For this X11/xterm path the standard X11 fixed bitmap is used directly; the individual CERN X resources remain a separate question from the standard glyph source.",
      fallbackRasterThreshold: 92,
      fontPx: 13, baseline: 11,
      cursor: "block", cursorBlink: true,
      phosphorGlow: false, scanlineAlpha: 0, crtVignette: false,
      revealCellsPerSecond: 0,
      physicalResolutionStatus: "color NeXT workstation candidate 1120×832; exact CERN machine and X server unconfirmed",
      monitorFrame: { kind:"crt", shell:"next-megapixel", label:"NeXT 1120×832 display family candidate", status:"DISPLAY FAMILY CANDIDATE" },
      notes: [
        "TECHNICALLY POSSIBLE: 1992年にはNeXT上でX11R4を動かす製品が存在し、xtermはX11R4でforeground/background resourcesを設定できた。",
        "TECHNICALLY POSSIBLE: したがって、color NeXT + X11/xterm上でLine Mode Browserを実行し、薄緑背景・白文字にする構成は技術的には成立する。",
        "UNKNOWN: CERNの森田氏利用端末にX11/xtermが導入されていた証拠、薄緑/白のX resourcesを使った証拠はまだない。",
        "IMPORTANT: この色はKEK講演資料の見た目を検証するための仮説であり、史実として確定したpaletteではない。",
        "DISPLAY RULE: CRTぼかし・発光・走査線などの演出は加えない。"
      ]
    },

    cern_3270_alternate: {
      id: "cern_3270_alternate",
      label: "CERN alternate — IBM 3270-class / x3270 14pt reference",
      evidenceLevel: "ALTERNATE HYPOTHESIS / PERIOD 3270-GLYPH REFERENCE",
      cols: 80, rows: 24,
      framebufferWidth: 720, framebufferHeight: 336,
      terminalRect: { x: 0, y: 0, w: 720, h: 336 },
      cell: { w: 9.0, h: 14.0 },
      foreground: "#67e879", background: "#020703", desktop: "#181b18",
      publicFontAssetId: "x3270_3270_14",
      fontFamily: '"3270", monospace',
      fontCandidate: "x3270 14-point 3270 bitmap — 9×14 character-generator reference",
      fontEvidence: "x3270's upstream 3270.bdf is a 14-point, 9×14 bitmap with 431 glyphs. This package carries that complete x3270 4.1ga10 BDF locally; its header retains the GTRC / Jeff Sparkes / Paul Mattes lineage and permissive redistribution grant.",
      fontPx: 14, baseline: 11,
      cursor: "block", cursorBlink: true,
      phosphorGlow: false, scanlineAlpha: 0, crtVignette: false,
      revealCellsPerSecond: 2500,
      physicalResolutionStatus: "80×24 text plane reconstructed as 720×336 from the x3270 9×14 cell; no specific physical 3270 terminal asserted",
      monitorFrame: { kind:"protocol", shell:"neutral-plane", label:"3270 display class — physical terminal intentionally unspecified", status:"3270 DISPLAY/PROTOCOL REFERENCE; NOT IBM 3278 HARDWARE CLAIM" },
      notes: [
        "CERN職員の後年回顧には、初期LMBを fixed size IBM 3270 display で使った例がある。",
        "STANDARD-GLYPH MODEL: この比較ではCourier等へ置換せず、x3270 4.1ga10の14pt 3270 bitmapから必要なASCII字形を変更せず同梱し、ローカルBDFを1bitのまま使用する。",
        "SOURCE LINEAGE: 3270.bdfのヘッダは1989年Georgia Tech Research Corporation、1990年Jeff Sparkes、後年のPaul Mattesの系譜を記録している。",
        "ただし森田氏の1992-09-30端末を3270と直接結びつける証拠はないため、3270自体は比較候補として扱う。"
      ]
    },

    kek_console_fullscreen_candidate: {
      id: "kek_console_fullscreen_candidate",
      label: "KEK — DECstation 5000/125 / full-screen text console comparison",
      evidenceLevel: "CONFIRMED MACHINE / NO-WINDOW DISPLAY PATH HYPOTHESIS",
      cols: 80, rows: 24,
      framebufferWidth: 1280, framebufferHeight: 1024,
      // Comparison model for a no-window text session on the workstation display.
      // Exact ULTRIX console rows, glyphs and margins on the KEK machine are not recovered.
      terminalRect: { x: 0, y: 0, w: 1280, h: 1024 },
      terminalAlign: "top-left",
      terminalPaddingX: 28, terminalPaddingY: 24,
      cell: { w: 8.0, h: 15.0 },
      foreground: "#e2e2d8", background: "#050505", desktop: "#050505",
      screenModeDefault: "light_on_dark",
      screenModeEvidence: "Comparison-only no-window path. Exact KEK ULTRIX console palette/resource is unconfirmed.",
      alternateTerminalPalette: null,
      verticalScrollbar: false,
      publicFontAssetId: "xconsortium_terminal_v22_verified",
      fontFamily: '"DEC Terminal", Terminal, "Courier New", Courier, monospace',
      fontCandidate: "8×15 DEC Terminal raster used only as a common comparison grid; exact console glyph is unconfirmed",
      fontEvidence: "The DECterm 8×15 raster is verified separately; use on the KEK framebuffer console is not verified.",
      fallbackRasterThreshold: 72,
      fontPx: 14, baseline: 12,
      cursor: "block", cursorBlink: true,
      phosphorGlow: false, scanlineAlpha: 0, crtVignette: false,
      revealCellsPerSecond: 0,
      physicalResolutionStatus: "DEC VRT19-DA/D4-class documented: 20-inch CRT, 1280×1024; exact KEK rear-label sub-model pending",
      monitorFrame: { kind:"crt", shell:"dec-vrt19", label:"DEC VRT19-class — 20-inch / 1280×1024", status:"STRONG HARDWARE FAMILY MATCH / EXACT KEK SUB-MODEL PENDING" },
      notes: [
        "CONFIRMED: KEK公式記事は保存されているDECstation 5000/125を日本初のウェブページを発信したコンピューターとして紹介している。",
        "DOCUMENTED HARDWARE: VRT19系は1280×1024の表示面を持つ。",
        "HYPOTHESIS: X/DECwindowsを使わず、ワークステーションの画面全体を文字端末として使ってLMBを起動した場合を比較するための候補。",
        "UNKNOWN: KEKUXで実際にこの表示経路を使ったか、ULTRIX operating-mode consoleの行列数、console font、余白、色。",
        "DISPLAY DISCIPLINE: 正確なconsole font/geometryが未確認のため、80×24のLMB内容を共通比較面として左上に置く。画面いっぱいに文字を引き伸ばしてはいない。"
      ]
    },

    kek_decterm_vrt19_candidate: {
      id: "kek_decterm_vrt19_candidate",
      label: "KEK — DECstation 5000/125 + DECterm / VRT19-class display",
      evidenceLevel: "CONFIRMED MACHINE / STRONG MONITOR FAMILY CANDIDATE / DISPLAY PATH UNCONFIRMED",
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
      publicFontAssetId: "xconsortium_terminal_v22_verified",
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
      fontEvidence: "Glyph identity and runtime selection are separate evidence domains. ULTRIX 4.3 media directly confirms the 100dpi/10pt terminal10 raster; the public 75dpi term14 metadata matches the Xws/75dpi branch and its normalized 8x15 raster matches the media target 195/195. DEC's 1991 price list shows DECstation 5000/125 + VRT19 packages with both PX 2D and PXG 3D graphics. Therefore neither 75dpi nor 100dpi is promoted as the KEK runtime default until the graphics option or actual X server command is recovered.",
      bitmapPixelScale: 1,
      fontPx: 14, baseline: 12,
      cursor: "block", cursorBlink: true,
      phosphorGlow: false, scanlineAlpha: 0, crtVignette: false,
      revealCellsPerSecond: 0,
      physicalResolutionStatus: "DEC VRT19-DA/D4-class documented: 20-inch CRT, 1280×1024; exact KEK rear-label sub-model pending",
      monitorFrame: { kind:"crt", shell:"dec-vrt19", label:"DEC VRT19-class — 20-inch / 1280×1024", status:"STRONG HARDWARE FAMILY MATCH / EXACT KEK SUB-MODEL PENDING" },
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
        "STRONG MONITOR FAMILY CANDIDATE: VRT19-DA/HA系はSony GDM-1960/1961 OEMとして知られる19-inch Trinitron系で、DEC資料系統では1280×1024。KEK展示モニタの正確な背面型番は現物確認待ち。",
        "UNKNOWN: KEKで実際にLMBをDECterm上で動かしたか、コンソール等だったか。",
        "DISPLAY RULE: 研究用ラベルは画面内へ描画しない。DECtermタイトル・window geometryは同時代資料に基づく候補であり、KEK実機固有値とは区別する。"
      ]
    }
  };

  // Lecture-reference palette candidate for the confirmed KEK DECstation 5000/125.
  // This is intentionally a separate profile so the later reconstruction palette
  // cannot silently become the default historical DECterm resource.
  (function(){
    const base=root.TerminalProfiles.kek_decterm_vrt19_candidate;
    const chrome=Object.assign({}, base.windowChrome, {
      rect:{ x:248, y:214, w:784, h:470 },
      title:"DECterm"
    });
    root.TerminalProfiles.kek_decterm_vrt19_lecture_green=Object.assign({}, base,{
      id:"kek_decterm_vrt19_lecture_green",
      label:"KEK candidate — DECstation 5000/125 + DECterm / lecture green palette",
      evidenceLevel:"CONFIRMED MACHINE / LECTURE-IMAGE PALETTE HYPOTHESIS",
      terminalRect:{ x:320, y:276, w:640, h:360 },
      foreground:"#f7f7ef",
      background:"#69bd5b",
      alternateTerminalPalette:null,
      screenModeDefault:"lecture_reference_green",
      screenModeEvidence:"The green/white palette comes from Morita lecture reconstruction imagery; it is not yet verified as a saved 1992 DECterm resource.",
      windowChrome:chrome,
      notes:(base.notes||[]).concat([
        "LECTURE REFERENCE: 森田氏の講演資料には薄緑背景・白文字の横長『KEK INFORMATION』再現画面が掲載されている。",
        "PROVENANCE UNKNOWN: その再現画面がCERN側の表示、KEK側の表示、または後年の再現作業用表示のどれを意図したかは未確認。",
        "WINDOW HYPOTHESIS: 横長比率は物理モニタ全面ではなく、1280×1024デスクトップ上に開いたDECtermウィンドウとして検証する。",
        "PALETTE DISCIPLINE: 薄緑＋白は講演資料由来の比較仮説であり、1992年KEK実機resourceとして確定した色ではない。"
      ])
    });
  })();
})(typeof self !== "undefined" ? self : this);
