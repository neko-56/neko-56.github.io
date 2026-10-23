from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
ASSET = ROOT / 'emulator/assets/fonts/ibm3270/3270.bdf'
BACKEND = ROOT / 'emulator/src/font-backend.js'

assert ASSET.is_file(), f'missing local IBM 3270 BDF: {ASSET}'
text = ASSET.read_text(encoding='utf-8')
assert re.search(r'^CHARS\s+431\s*$', text, re.M), 'packaged x3270 asset must contain the complete 431-glyph source set'
assert re.search(r'^FONT\s+3270\s*$', text, re.M), 'packaged file must be the upstream FONT 3270 asset'
assert 'CHARSET_REGISTRY "3270cg"' in text
assert 'CHARSET_ENCODING "1a"' in text

js = BACKEND.read_text(encoding='utf-8')
assert 'url:"assets/fonts/ibm3270/3270.bdf"' in js, '3270 runtime URL must be local'
block = re.search(r'x3270_3270_14:\s*\{(.*?)\n\s*\}', js, re.S)
assert block, 'x3270 asset block not found'
assert 'http://' not in block.group(1) and 'https://' not in block.group(1), 'x3270 runtime metadata must not contain an external URL'

url_re = re.compile(r'https?://[^\s\"\'<>]*(?:x3270|3270\.bdf)', re.I)
hits = []
for p in ROOT.rglob('*'):
    if not p.is_file():
        continue
    try:
        s = p.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    for m in url_re.finditer(s):
        hits.append(f'{p.relative_to(ROOT)}:{s.count(chr(10), 0, m.start()) + 1}:{m.group(0)}')
assert not hits, 'external IBM 3270 font URL(s) remain:\n' + '\n'.join(hits)

print('PASS: IBM 3270 font is package-local; external x3270/3270.bdf URLs are zero')
