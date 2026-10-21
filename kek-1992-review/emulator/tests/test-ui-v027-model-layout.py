from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MODELS = [
    ROOT / "cern-view.html",
    ROOT / "kek-2002-view.html",
    ROOT / "kek-local.html",
    ROOT / "emulator" / "index.html",
]

for page in MODELS:
    text = page.read_text()
    for token in [
        'class="model-page-shell"',
        'class="model-header"',
        'class="model-stage',
        'class="model-operation-bar"',
        'class="model-disclosure"',
    ]:
        assert token in text, (page.name, token)
    assert text.index('class="model-header"') < text.index('class="model-stage'), page
    assert text.index('class="model-stage') < text.index('class="model-operation-bar"'), page
    assert text.index('class="model-operation-bar"') < text.index('class="model-disclosure"'), page

emulator = (ROOT / "emulator" / "index.html").read_text()
assert 'class="model-stage model-stage-emulator"' in emulator
assert '表示設定・研究用設定' in emulator
assert '詳細情報・根拠を見る' in emulator
# Research controls must be after the framebuffer and operation bar.
assert emulator.index('id="display"') < emulator.index('id="profile"')
assert emulator.index('id="display"') < emulator.index('id="fontFile"')
# The shared page must not wrap the emulator framebuffer in one of the static hardware shells.
for forbidden in ['ibm-terminal-shell', 'dec-monitor-shell', 'class="monitor"']:
    assert forbidden not in emulator, forbidden

css = (ROOT / "model-layout.css").read_text()
assert '.model-page-shell' in css
assert '.model-stage-emulator' in css
assert 'fictional CRT' in css

print("v0.27 unified model layout: PASS")
