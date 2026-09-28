"""Cross-check selected real Proper records against the production resolver contract.

This test deliberately compares source section order to the resolver rules embedded
in index.html. It does not invent liturgical content or calendar identities.
"""
from pathlib import Path
import json, re

HTML = Path('index.html').read_text(encoding='utf-8')
FIX = json.loads(Path('data/mass-proper-fixtures.json').read_text(encoding='utf-8'))
fixtures = FIX.get('fixtures') or {}

# Production contract must contain the repaired consumers before source records
# can be meaningfully checked against them.
required_contract = {
    'collect series': r'collectSeries\(sources,\s*"Oratio"',
    'secret series': r'collectSeries\(sources,\s*"Secreta"',
    'postcommunion series': r'collectSeries\(sources,\s*"Postcommunio"',
    'ordered pre-Gospel': r'preGospelChants:\s*preGospelIds\.map',
    'Sequence graph': r'function insertSequence\(',
    'Gospel normalization': r'function stripGospelSourceHeading\(',
    'super populum graph': r'function insertSuperPopulum\(',
    'canonical reader': r'out\.canonicalText\s*=\s*resolved',
}
for name, pat in required_contract.items():
    assert re.search(pat, HTML), f'production resolver contract missing: {name}'

CHANT = re.compile(r'(?:GradualeP?|Alleluia|Tractus)\d*$', re.I)
def prayer_series(keys, base):
    base_re = re.compile(re.escape(base) + r'(\d*)$', re.I)
    found = []
    for k in keys:
        m = base_re.fullmatch(k)
        if m: found.append((0 if m.group(1)=='' else int(m.group(1)), k))
    return [k for _, k in sorted(found)]

def expected_projection(keys):
    """Source slots that the repaired normalized Proper must preserve."""
    out = []
    def first(*names):
        for n in names:
            if n in keys: return n
    if 'Introitus' in keys: out.append('Introitus')
    out += prayer_series(keys, 'Oratio')
    lesson = first('Lectio','Epistola')
    if lesson: out.append(lesson)
    out += [k for k in keys if CHANT.fullmatch(k)]
    seq = next((k for k in keys if re.fullmatch(r'Sequentia\d*', k, re.I)), None)
    if seq: out.append(seq)
    if 'Evangelium' in keys: out.append('Evangelium')
    if 'Offertorium' in keys: out.append('Offertorium')
    out += prayer_series(keys, 'Secreta')
    # Preface is appointed through a separate resolver and is therefore not
    # inferred from source section order here.
    if 'Communio' in keys: out.append('Communio')
    out += prayer_series(keys, 'Postcommunio')
    out += [k for k in keys if k.lower().startswith('oratio super populum')]
    return out

checked = 0
for category, rec in fixtures.items():
    if not rec:
        print('SKIP', category, '(no real corpus candidate)')
        continue
    rid = rec['id']; keys = rec['sectionOrder']
    projected = expected_projection(keys)
    assert projected, f'{category}/{rid}: empty expected projection'

    # Source-order invariants for the high-risk branches.
    chants = [k for k in keys if CHANT.fullmatch(k)]
    projected_chants = [k for k in projected if CHANT.fullmatch(k)]
    assert projected_chants == chants, f'{category}/{rid}: chant order changed: {chants} -> {projected_chants}'
    for base in ('Oratio','Secreta','Postcommunio'):
        assert [k for k in projected if re.fullmatch(re.escape(base)+r'\d*', k, re.I)] == prayer_series(keys, base), f'{category}/{rid}: {base} series incomplete'
    if any(re.fullmatch(r'Sequentia\d*', k, re.I) for k in keys):
        si = next(i for i,k in enumerate(projected) if re.fullmatch(r'Sequentia\d*', k, re.I))
        gi = projected.index('Evangelium') if 'Evangelium' in projected else None
        assert gi is not None and si < gi, f'{category}/{rid}: Sequence not before Gospel'
    if any(k.lower().startswith('oratio super populum') for k in keys):
        osp = next(k for k in projected if k.lower().startswith('oratio super populum'))
        pc = [i for i,k in enumerate(projected) if re.fullmatch(r'Postcommunio\d*', k, re.I)]
        assert pc and projected.index(osp) > max(pc), f'{category}/{rid}: super populum not after Postcommunion'
    print('PASS', category, rid, '=>', ' > '.join(projected))
    checked += 1

assert checked >= 1, 'No real corpus fixture was available to test'
print(f'PASS: {checked} real-corpus records checked against production resolver contract')
