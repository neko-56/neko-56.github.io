from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]

PAGES = {
    "cern-view.html": "cern-view.html",
    "kek-2002-view.html": "kek-2002-view.html",
    "kek-local.html": "kek-local.html",
    "original-source.html": "original-source.html",
    "references.html": "references.html",
    "link-status.html": "link-status.html",
    "emulator/index.html": "../index.html",
}

for rel, home_href in PAGES.items():
    text = (ROOT / rel).read_text()
    assert text.count('class="site-nav"') == 1, rel
    assert text.count('class="site-nav-home"') == 1, rel
    assert f'href="{home_href}"' in text, (rel, home_href)
    assert '← 表示モデル一覧へ戻る' in text, rel
    for label in ["実機エミュレータ", "CERN", "KEK 2002", "KEK LOCAL", "原文", "根拠資料", "リンク検証"]:
        assert label in text, (rel, label)

index = (ROOT / "index.html").read_text()
assert 'id="models"' in index
assert 'id="resources"' in index
assert index.index('id="models"') < index.index('id="resources"')
print("site navigation: PASS")

emulator = (ROOT / "emulator/index.html").read_text()
assert 'id="fullscreenExit"' in emulator
assert '全画面を終了（Esc）' in emulator
print("fullscreen return affordance: PASS")
