from pathlib import Path
import re

HTML = Path('index.html')
if not HTML.exists():
    raise SystemExit('index.html missing')
s = HTML.read_text(encoding='utf-8')

checks = []
def require(name, pattern, flags=0):
    ok = re.search(pattern, s, flags) is not None
    checks.append((name, ok))
    if not ok:
        raise AssertionError(name)

def require_order(name, patterns):
    positions = []
    for p in patterns:
        m = re.search(p, s)
        if not m:
            raise AssertionError(f'{name}: missing {p}')
        positions.append(m.start())
    ok = positions == sorted(positions)
    checks.append((name, ok))
    if not ok:
        raise AssertionError(f'{name}: wrong order {positions}')

for marker in [
    'mass-source-fetch-resilience-20260929-v1',
    'mass-text-proper-integrity-pregospel-20260927-v2',
    'mass-pregospel-graph-integrity-20260928-v1',
    'mass-text-proper-integrity-gospel-20260927-v1',
    'mass-reader-projection-integrity-20260927-v1',
    'mass-sequence-graph-integrity-20260927-v1',
    'today-mass-overview-integrity-20260928-v1',
]:
    require(f'marker {marker}', re.escape(marker))


# Proper source transport must survive a failed primary GitHub transport without
# changing the pinned source revision or silently dropping the Proper.
require('Mass source transport mirror', r'cdn\.jsdelivr\.net/gh/')
require('Mass source fetcher uses resilient wrapper', r'MemoryTextFetcher\(sourceFetch\)')
require('Mass source tryGet continues fallbacks', r'Source transport failed; trying fallback')

# Prayer series and source bindings.
require('base Secret parser keeps unnumbered Secreta', r'secrets:\s*numbered\(sources,\s*"Secreta",\s*true\)')
require('base Postcommunion parser keeps unnumbered Postcommunio', r'postcommunions:\s*numbered\(sources,\s*"Postcommunio",\s*true\)')
require('commemoration Secret keeps unnumbered Secreta', r"numbered\)\(sources,\s*'Secreta',\s*true\)\[0\]")
require('commemoration Postcommunion keeps unnumbered Postcommunio', r"numbered\)\(sources,\s*'Postcommunio',\s*true\)\[0\]")
require('Super populum source bound to canonical field', r'superPopulum:\s*\(\(\) => \{ const id = firstExisting\(sources, \["Oratio super populum", "Super populum"\]\)')

# Pre-Gospel source normalization and graph materialization.
require('pre-Gospel semantic splitter', r'const splitPreGospelLines = \(lines, defaultKind\) =>')
require('embedded Tract splitter', r'const tractIndex = raw\.findIndex\(line => /\^!Tractus\$/i\.test\(line\)\)')
require('multiple Alleluia splitter', r'matches\.length >= 2')
require('semantic pre-Gospel array', r'const preGospelChants = authority\.map')
require('numbered chant resolver', r'const numberedMatch = numbered')
require('data-driven pre-Gospel graph', r'function materializePreGospelSteps\(')
require('pre-Gospel graph removes fixed two-slot pair', r'step\.id !== "gradual" && step\.id !== "alleluia"')

# Sequence and Gospel.
require('Sequence conditional insert', r'function insertSequence\(')
require('Sequence Gospel anchor', r'findIndex\(step => step\.id === "gospel-announcement"\)')
require('Sequence canonical text', r'canonicalText:\s*text')
require('Gospel heading normalizer', r'function stripGospelSourceHeading\(')
require('Gospel normalized at Proper construction', r'gospel:\s*stripGospelSourceHeading')

# Persistent reader is independent from VOX/audibility.
require('canonical reader field', r'out\.canonicalText\s*=\s*resolved')
require('Missal prefers canonical reader text', r'const canonical = step\.canonicalText \|\| step\.text')
require('Secret audible conclusion remains separate', r'out\.audibleFragment\s*=\s*secretConclusion')

# Today's Mass complete Proper overview.
require('Today Mass all Collects', r"addSeries\('Collect',\s*'Collecte',\s*p\?\.collects\)")
require('Today Mass ordered chants', r'p\?\.preGospelChants')
require('Today Mass Sequence', r'p\?\.sequence')
require('Today Mass all Secrets', r"addSeries\('Secret',\s*'Secrète',\s*p\?\.secrets\)")
require('Today Mass Preface', r'p\?\.preface')
require('Today Mass all Postcommunions', r"addSeries\('Postcommunion',\s*'Postcommunion',\s*p\?\.postcommunions\)")
require('Today Mass super populum', r'p\?\.superPopulum')

require_order('Today Mass liturgical order', [
    r"add\('Introit'",
    r"addSeries\('Collect'",
    r"p\?\.epistle",
    r"p\?\.preGospelChants",
    r"p\?\.sequence",
    r"p\?\.gospel",
    r"p\?\.offertory",
    r"addSeries\('Secret'",
    r"p\?\.preface",
    r"p\?\.communion",
    r"addSeries\('Postcommunion'",
    r"p\?\.superPopulum",
])

# Report unresolved/special branch evidence without inventing support.
requiem_flag = bool(re.search(r'proper\?\.isRequiem|proper\.isRequiem', s))
requiem_classifier = bool(re.search(r'isRequiem\s*:', s))
canon_variants = {
    'communicantes': bool(re.search(r'properCommunicantes|communicantes.*proper', s, re.I | re.S)),
    'hanc': bool(re.search(r'properHanc|hanc.*proper', s, re.I | re.S)),
}

print(f'PASS: {len(checks)} Mass text/Proper integrity assertions')
print('BRANCH AUDIT:')
print(f'  Requiem consumer hook: {requiem_flag}')
print(f'  Requiem normalized classifier: {requiem_classifier}')
print(f'  Canon variants detected: {canon_variants}')
if requiem_flag and not requiem_classifier:
    print('  GAP: Requiem branch is consumed but no normalized isRequiem classifier was detected.')
if not all(canon_variants.values()):
    print('  GAP: appointed Canon variants remain incomplete or unverified.')
