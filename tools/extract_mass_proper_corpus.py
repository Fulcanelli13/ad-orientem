"""Extract the embedded Mass Proper corpus from the production monolith.

This does not reinterpret liturgical data. It finds source records already embedded
in index.html, preserves record IDs and section order, and emits a compact JSON
catalogue for regression-fixture selection.
"""
from pathlib import Path
import json
import re

SRC = Path('index.html')
OUT = Path('data/mass-proper-corpus.json')
if not SRC.exists():
    raise SystemExit('index.html missing')
s = SRC.read_text(encoding='utf-8')

# Corpus records in the frozen bundle expose an id/path plus a sections object and
# ordered section identifiers. Keep extraction deliberately conservative: only
# objects that contain the canonical Proper section vocabulary are admitted.
SECTION_WORDS = ('Introitus','Oratio','Lectio','Epistola','Graduale','Alleluia','Tractus','Sequentia','Evangelium','Offertorium','Secreta','Communio','Postcommunio')

# First collect candidate JSON-like object spans around explicit source IDs. The
# embedded corpus is generated JS, so use balanced-brace scanning rather than a
# regex pretending to parse arbitrary nested objects.
def balanced_object(start):
    depth = 0; quote = None; esc = False
    for i in range(start, len(s)):
        c = s[i]
        if quote:
            if esc: esc = False
            elif c == '\\': esc = True
            elif c == quote: quote = None
            continue
        if c in ('"', "'", '`'): quote = c; continue
        if c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0: return s[start:i+1]
    return None

candidates = []
for m in re.finditer(r'\{(?=[^{}]{0,500}(?:"(?:id|path|file|name)"\s*:))', s):
    obj = balanced_object(m.start())
    if not obj or not any(w in obj for w in SECTION_WORDS):
        continue
    if not re.search(r'\b(?:Introitus|Oratio|Evangelium|Secreta|Postcommunio)\b', obj):
        continue
    candidates.append(obj)

# Extract only stable metadata and section identifiers/text. This intentionally
# avoids eval/exec of bundle JavaScript.
def string_field(obj, names):
    for name in names:
        m = re.search(r'["\']?' + re.escape(name) + r'["\']?\s*:\s*(["\'])(.*?)\1', obj, re.S)
        if m: return m.group(2)
    return None

def section_keys(obj):
    found = []
    for m in re.finditer(r'["\']((?:Introitus|Oratio(?:\s+super\s+populum)?|Lectio|Epistola|GradualeP?|Alleluia|Tractus|Sequentia|Evangelium|Offertorium|Secreta|Communio|Postcommunio)\d*)["\']\s*:', obj, re.I):
        key = m.group(1)
        if key not in found: found.append(key)
    return found

records = []
seen = set()
for obj in candidates:
    rid = string_field(obj, ('id','path','file','name','key'))
    keys = section_keys(obj)
    if not rid or len(keys) < 3: continue
    sig = (rid, tuple(keys))
    if sig in seen: continue
    seen.add(sig)
    records.append({'id': rid, 'sectionOrder': keys})

records.sort(key=lambda r: r['id'])
OUT.parent.mkdir(parents=True, exist_ok=True)
payload = {
    'schema': 'ad-orientem.mass-proper-corpus.v1',
    'source': 'index.html embedded corpus',
    'recordCount': len(records),
    'records': records,
}
OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'wrote {OUT}: {len(records)} records')
if not records:
    raise SystemExit('No Proper records extracted; bundle shape needs a source-specific extractor anchor.')
