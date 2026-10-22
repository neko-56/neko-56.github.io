from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

PAGES = [
    "cern-view.html",
    "kek-local.html",
    "review.html",
    "environment-reference.html",
    "references.html",
    "reconstruction-policy.html",
]

for rel in PAGES:
    text = (ROOT / rel).read_text()
    assert text.count('class="site-nav') >= 1, rel
    assert text.count('class="site-nav-home"') == 1, rel
    assert 'href="index.html"' in text, rel
    assert '← ご確認用トップ' in text, rel

index = (ROOT / "index.html").read_text()
for href in [
    'href="review.html"',
    'href="environment-reference.html"',
    'href="research.html"',
    'href="reconstruction-policy.html"',
]:
    assert href in index, href
assert 'ご確認フォーム' in index
assert 'CERN側' in index and 'KEK側' in index

for rel in ["cern-view.html", "kek-local.html"]:
    text = (ROOT / rel).read_text()
    assert 'data-candidate-switcher' in text, rel
    assert 'data-candidate-frame' in text, rel
    assert 'candidate-tab' in text, rel
    assert '研究用エミュレータ' in text, rel

emulator = (ROOT / "emulator/index.html").read_text()
assert 'id="fullscreenExit"' in emulator
assert '全画面を終了（Esc）' in emulator
print("reviewer-first navigation / candidate switching: PASS")
