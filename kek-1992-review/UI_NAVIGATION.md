# KEK 1992 review — model page UI policy (v0.27)

## Goal

All four display models must feel like the same site, even when the historical display hardware shown inside the model is different.

## Shared page skeleton

Every display-model page uses the same order:

1. persistent site navigation
2. model title + evidence/confidence badge
3. historical display area
4. compact operation bar
5. collapsed settings/details

The historical display area remains model-specific. A CRT cabinet, DECwindows frame, or bare framebuffer is shown only when it belongs to that model's evidence/hypothesis; it is not a site-wide decorative effect.

## Navigation rules

1. The primary return action is always `← 表示モデル一覧へ戻る`.
2. Direct model switching and research-document links are separate groups.
3. Navigation is outside the reconstructed historical framebuffer.
4. Navigation remains visible while the page is scrolled.
5. Historical keyboard behavior is not repurposed for site navigation.

## Emulator-specific rule

The KEK Web Display Emulator must not look like a separate research application on first load. The framebuffer is the primary content. Profile selection, browser-evidence mode, scale, grid, font override and diagnostics live under `表示設定・研究用設定`. Evidence/specification text lives under `詳細情報・根拠を見る`.

The emulator does not receive a fictional CRT cabinet. Its Canvas remains a direct framebuffer view.

## Fullscreen

The emulator fullscreen view exposes `全画面を終了（Esc）` outside the historical framebuffer. Browser Escape behavior is retained.
