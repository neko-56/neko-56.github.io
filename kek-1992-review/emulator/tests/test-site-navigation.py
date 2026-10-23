from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PRIMARY = ["森田様への質問", "各種機種での再現エミュレート", "各種資料"]

# The three top-level reviewer pages expose exactly the same three primary tabs.
for rel in ["review.html", "emulation.html", "research.html", "environment-reference.html"]:
    text = (ROOT / rel).read_text(encoding="utf-8")
    assert 'class="primary-tabs"' in text, rel
    for label in PRIMARY:
        assert label in text, (rel, label)

# Detailed reconstruction pages must still expose routes to all three pillars.
for rel in ["cern-view.html", "kek-local.html", "reconstruction-policy.html"]:
    text = (ROOT / rel).read_text(encoding="utf-8")
    assert 'class="site-nav' in text, rel
    for label in PRIMARY:
        assert label in text, (rel, label)

for rel in ["cern-view.html", "kek-local.html"]:
    text = (ROOT / rel).read_text(encoding="utf-8")
    assert 'data-candidate-switcher' in text, rel
    assert 'data-candidate-frame' in text, rel
    assert 'candidate-tab' in text, rel
    assert '研究用エミュレータ' in text, rel

index = (ROOT / "index.html").read_text(encoding="utf-8")
assert 'url=review.html' in index
assert '森田様への質問' in index

emulator = (ROOT / "emulator/index.html").read_text(encoding="utf-8")
assert 'id="fullscreenExit"' in emulator
assert '全画面を終了（Esc）' in emulator
print("three-pillar reviewer navigation / candidate switching: PASS")
