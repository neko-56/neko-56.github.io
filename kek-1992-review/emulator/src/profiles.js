(function (root) {
  "use strict";
  root.TerminalProfiles = {
    cern_morita_unknown: {
      id: "cern_morita_unknown",
      label: "CERN 1992 — Morita terminal (hardware unknown)",
      evidenceLevel: "CONFIRMED BROWSER CLASS / UNKNOWN HARDWARE",
      cols: 80, rows: 24,
      framebufferWidth: 1000, framebufferHeight: 700,
      terminalRect: { x: 70, y: 90, w: 860, h: 520 },
      cell: { w: 9.75, h: 19.5 },
      foreground: "#55e36a", background: "#010502", desktop: "#101310",
      fontFamily: 'Meyrin, MeyrinRegular, "Courier New", Courier, monospace',
      fontCandidate: "Meyrin only as 2013 reconstruction reference; Morita 1992 glyphs unknown",
      fontEvidence: "UNKNOWN for 1992 hardware",
      fontPx: 16, baseline: 14.8,
      cursor: "block", cursorBlink: true,
      phosphorGlow: true, scanlineAlpha: 0.05, crtVignette: true,
      revealCellsPerSecond: 2800,
      physicalResolutionStatus: "unknown",
      notes: [
        "CONFIRMED: 森田洋平氏は昼食後にCERNの『端末室』へ行き、ネットワーク経由でKEKへログインした。",
        "CONFIRMED: Line Mode Browserは文字端末向けで、CERNの2013年公式再現は80×24文字を基準としている。",
        "UNKNOWN: 1992-09-30に森田氏が使った端末のメーカー、型番、物理解像度、実フォント。",
        "このプロファイルは機種名を推定せず、80×24のLMB表示だけを再現する安全側の基準。"
      ]
    },

    cern_rs6000_reference: {
      id: "cern_rs6000_reference",
      label: "CERN reference — IBM RISC System/6000 / AIX (2013 evidence)",
      evidenceLevel: "CONFIRMED 2013 REFERENCE MACHINE; NOT MORITA IDENTIFICATION",
      cols: 80, rows: 24,
      framebufferWidth: 1000, framebufferHeight: 700,
      terminalRect: { x: 70, y: 90, w: 860, h: 520 },
      cell: { w: 9.75, h: 19.5 },
      foreground: "#52e869", background: "#000402", desktop: "#101310",
      fontFamily: 'Meyrin, MeyrinRegular, "Courier New", Courier, monospace',
      fontCandidate: "Meyrin (2013 CERN Hackday reconstruction from IBM System/6000 screenshots)",
      fontEvidence: "CONFIRMED 2013 reconstruction reference, not original ROM binary",
      fontPx: 16, baseline: 14.8,
      cursor: "block", cursorBlink: true,
      phosphorGlow: true, scanlineAlpha: 0.055, crtVignette: true,
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
      framebufferWidth: 1000, framebufferHeight: 700,
      terminalRect: { x: 70, y: 90, w: 860, h: 520 },
      cell: { w: 9.75, h: 19.5 },
      foreground: "#67e879", background: "#020703", desktop: "#181b18",
      fontFamily: '"Courier New", Courier, monospace',
      fontCandidate: "IBM 3270 glyph set unresolved",
      fontEvidence: "ALTERNATE HYPOTHESIS",
      fontPx: 16, baseline: 14.8,
      cursor: "block", cursorBlink: true,
      phosphorGlow: true, scanlineAlpha: 0.055, crtVignette: true,
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
      terminalRect: { x: 112, y: 132, w: 790, h: 500 },
      cell: { w: 9.05, h: 18.0 },
      foreground: "#171917", background: "#dddcd4", desktop: "#819797", titlebar: "#d2d3cb",
      fontFamily: '"DEC Terminal", Terminal, "Courier New", Courier, monospace',
      fontCandidate: "DECwindows TERMINAL14.PCF at 75dpi / TERMINAL10_100DPI.PCF at 100dpi",
      fontEvidence: "CONTEMPORARY DECwindows font family/file evidence; exact KEK DPI/font file unknown",
      fontPx: 14, baseline: 13.4,
      cursor: "block", cursorBlink: true,
      phosphorGlow: false, scanlineAlpha: 0.018, crtVignette: true,
      revealCellsPerSecond: 0,
      verticalScrollbar: true,
      physicalResolutionStatus: "VRT19 candidate: 1280×1024",
      notes: [
        "CONFIRMED: KEK実機はDECstation 5000/125。",
        "CONFIRMED: KEKへのLine Mode Browser導入記録は1992-04-14。",
        "CONTEMPORARY DEC DOC: DECtermの標準端末サイズは24行×80桁、標準カーソルはブロック。",
        "CONTEMPORARY DEC DOC: 1988/1989 DECwindows資料ではDECterm標準は『dark text on light background』。Phase 1の白文字/黒背景から修正。",
        "CONTEMPORARY DEC DOC: 80-column通常フォントを使用。UWS 4.0資料では通常14-point（100dpi系では10-point）の記述がある。",
        "STRONG CANDIDATE: VRT19系はTrinitron、1280×1024。KEK展示モニタの背面型番は未確認。",
        "UNKNOWN: KEKで実際にLMBをDECterm上で動かしたか、コンソール等だったか。"
      ]
    }
  };
})(typeof self !== "undefined" ? self : this);
