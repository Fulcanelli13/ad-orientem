from pathlib import Path
import re

src = Path('index.html').read_text(encoding='utf-8')
out = []

TARGETS = [
    ('normalizeProper', r'normalizeProper'),
    ('mergeCommemorations', r'mergeCommemorations'),
    ('numbered helper', r'numbered\('),
    ('preGospelChants', r'preGospelChants'),
    ('Gradual step', r'"id":"gradual"'),
    ('Alleluia step', r'"id":"alleluia"'),
    ('Sequence references', r'proper\.sequence|"sequence"'),
    ('gospel-announcement', r'gospel-announcement'),
    ('gospel step', r'"id":"gospel"'),
    ('projectStep', r'projectStep'),
    ('audibleFragment', r'audibleFragment'),
    ('Today Mass title', r"Today.?s Mass|Today’s Mass|Messe du jour"),
    ('today proper render', r'today.*proper|proper.*today'),
    ('Requiem', r'Requiem|requiem'),
    ('Communicantes', r'Communicantes'),
    ('Hanc igitur', r'Hanc igitur'),
    ('Oratio super populum', r'superPopulum|SuperPopulum|Oratio super populum'),
]

WINDOW = 2600
for label, pattern in TARGETS:
    out.append('\n' + '=' * 100)
    out.append(label)
    out.append('=' * 100)
    matches = list(re.finditer(pattern, src, re.I))
    out.append(f'matches={len(matches)}')
    for i, m in enumerate(matches[:12], 1):
        a = max(0, m.start() - WINDOW)
        b = min(len(src), m.end() + WINDOW)
        excerpt = src[a:b]
        line = src.count('\n', 0, m.start()) + 1
        out.append(f'\n--- match {i} @ char {m.start()} line {line} ---\n')
        out.append(excerpt)

Path('docs/MASS-TEXT-PROPER-DIAGNOSTIC.txt').write_text('\n'.join(out), encoding='utf-8')
print('wrote diagnostic', len('\n'.join(out).encode('utf-8')), 'bytes')
