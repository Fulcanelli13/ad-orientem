from pathlib import Path
import re

src = Path('index.html').read_text(encoding='utf-8')
out = []

def add(label, pattern, before=1200, after=12000, flags=re.I):
    m = re.search(pattern, src, flags)
    out.append('\n' + '=' * 100)
    out.append(label)
    out.append('=' * 100)
    if not m:
        out.append('NOT FOUND')
        return
    a = max(0, m.start() - before)
    b = min(len(src), m.end() + after)
    line = src.count('\n', 0, m.start()) + 1
    out.append(f'@ char {m.start()} line {line}')
    out.append(src[a:b])

add('NORMALIZE PROPER', r'function normalizeProper', 1000, 11000)
add('MERGE COMMEMORATIONS', r'async function mergeCommemorations', 1000, 7000)
add('PROPER TEXT + ATTACH PROPER', r'function properText', 1000, 13000)
add('BUILD MASS SEQUENCE', r'function buildMassSequence', 1500, 14000)
add('PROJECT STEP', r'function projectStep', 1500, 10000)
add('FIXED GRADUAL / ALLELUIA / GOSPEL STEPS', r'"id":"gradual"', 2500, 12000)
add('TODAYS MASS OVERVIEW', r"Today.?s Mass|Today’s Mass|Messe du jour", 5000, 12000)
add('REQUIEM PROFILE', r'requiem_mass_1962', 4000, 12000)
add('REQUIEM TEXT OVERRIDES', r'Requiescant|dona eis requiem', 4000, 12000)
add('COMMUNICANTES FIXED STEP', r'"id":"communicantes"', 2500, 9000)
add('HANC FIXED STEP', r'"id":"hanc"', 2500, 9000)
add('SUPER POPULUM', r'function insertSuperPopulum|superPopulum', 3000, 10000)

text = '\n'.join(out)
Path('docs/MASS-TEXT-PROPER-COMPACT.txt').write_text(text, encoding='utf-8')
print('wrote compact diagnostic', len(text.encode('utf-8')), 'bytes')
