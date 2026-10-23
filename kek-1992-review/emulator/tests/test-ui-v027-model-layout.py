from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# Reviewer candidate pages must expose simple switching, not dense research controls.
for rel in ["cern-view.html", "kek-local.html"]:
    text = (ROOT / rel).read_text()
    for token in [
        'candidate-comparison',
        'candidate-tabs',
        'data-candidate-frame',
        'candidate-summary',
    ]:
        assert token in text, (rel, token)
    assert '詳細調整は研究用エミュレータへ' in text, rel

# CERN page carries evidence-labelled NeXT/LMB candidates and workflow uncertainty.
cern = (ROOT / "cern-view.html").read_text()
assert 'NeXTSTEP Terminal.app + Line Mode Browser' in cern
assert 'NeXT + 緑色候補' in cern
assert 'CERNでの作業の流れ' in cern
assert '未確認' in cern

# KEK page keeps the confirmed host model fixed and varies display hypotheses.
kek = (ROOT / "kek-local.html").read_text()
assert 'DECstation 5000/125' in kek
assert '講演資料配色' in kek

# Historical display remains Canvas/emulator based; no fictional CRT effects are introduced.
emulator = (ROOT / "emulator/index.html").read_text()
assert 'id="display"' in emulator
assert '表示設定・研究用設定' in emulator
css = (ROOT / "emulator/style.css").read_text()
assert 'image-rendering' in css

print("v0.38 reviewer candidate UI: PASS")
