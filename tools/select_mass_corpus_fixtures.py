"""Select representative regression fixtures from the extracted real Proper corpus.

Selection is evidence-driven from each record's actual section order. Named IDs are
preferred when present (notably Pent18-0), but no calendar identity is invented.
"""
from pathlib import Path
import json
import re

SRC = Path('data/mass-proper-corpus.json')
OUT = Path('data/mass-proper-fixtures.json')
if not SRC.exists():
    raise SystemExit('Run tools/extract_mass_proper_corpus.py first')
data = json.loads(SRC.read_text(encoding='utf-8'))
records = data.get('records') or []
if not records:
    raise SystemExit('Proper corpus is empty')

def keys(r): return r.get('sectionOrder') or []
def has(r, pat): return any(re.fullmatch(pat, k, re.I) for k in keys(r))
def count(r, pat): return sum(bool(re.fullmatch(pat, k, re.I)) for k in keys(r))
def find(pred, prefer=None):
    if prefer:
        for r in records:
            if r.get('id') == prefer and pred(r): return r
    return next((r for r in records if pred(r)), None)

def summary(r):
    return None if not r else {'id': r['id'], 'sectionOrder': keys(r)}

selected = {
    'ordinarySunday': summary(find(lambda r: has(r, r'Graduale\d*') and has(r, r'Alleluia\d*') and not has(r, r'Tractus\d*') and not has(r, r'Sequentia\d*'), 'Pent18-0')),
    'tract': summary(find(lambda r: has(r, r'Tractus\d*'))),
    'doubleAlleluia': summary(find(lambda r: count(r, r'Alleluia\d*') >= 2)),
    'sequence': summary(find(lambda r: has(r, r'Sequentia\d*'))),
    'multiplePrayerSeries': summary(find(lambda r: count(r, r'Oratio\d*') >= 2 or count(r, r'Secreta\d*') >= 2 or count(r, r'Postcommunio\d*') >= 2)),
    'superPopulum': summary(find(lambda r: any(k.lower().startswith('oratio super populum') for k in keys(r)))),
}

# Every category is useful evidence, but absence is reported rather than replaced
# with a fabricated record/calendar assignment.
missing = [name for name, rec in selected.items() if rec is None]
payload = {
    'schema': 'ad-orientem.mass-proper-fixtures.v1',
    'sourceSchema': data.get('schema'),
    'corpusRecordCount': len(records),
    'fixtures': selected,
    'missingCategories': missing,
}
OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
for name, rec in selected.items():
    print(f'{name}: {rec["id"] if rec else "NOT FOUND"}')
if missing:
    print('WARN missing fixture categories:', ', '.join(missing))
# Pent18-0 is an explicit regression target from the Mass audit. If it exists in
# the corpus but fails the ordinary shape predicate, fail rather than silently use it.
pent = next((r for r in records if r.get('id') == 'Pent18-0'), None)
if pent and selected['ordinarySunday'] and selected['ordinarySunday']['id'] != 'Pent18-0':
    raise SystemExit('Pent18-0 exists but does not satisfy the expected ordinary Gradual+Alleluia source shape')
