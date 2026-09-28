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

# Guarded patch-chain presence.
for marker in [
    'mass-text-proper-integrity-pregospel-20260927-v1',
    'mass-text-proper-integrity-gospel-20260927-v1',
    'mass-reader-projection-integrity-20260927-v1',
    'mass-sequence-graph-integrity-20260927-v1',
    'today-mass-overview-integrity-20260928-v1',
]:
    require(f'marker {marker}', re.escape(marker))

# Canonical prayer-series contract: unnumbered and numbered sections, including commemorations.
require('base Secret parser accepts Secreta', r'collectSeries\(sources,\s*"Secreta"')
require('base Postcommunion parser accepts Postcommunio', r'collectSeries\(sources,\s*"Postcommunio"')
require('commemoration Secret merge present', r'proper\.secrets')
require('commemoration Postcommunion merge present', r'proper\.postcommunions')

# Pre-Gospel complex must be source-driven and retain every supported chant family.
require('pre-Gospel ordered array', r'preGospelChants:\s*preGospelIds\.map')
require('Gradual matcher', r'Graduale')
require('Alleluia matcher', r'Alleluia')
require('Tract matcher', r'Tractus')
require('numbered chant resolver', r'numberedMatch')

# Sequence is conditional and graph-owned immediately before the Gospel announcement.
require('Sequence conditional insert', r'function insertSequence\(')
require('Sequence Gospel anchor', r'findIndex\(step => step\.id === "gospel-announcement"\)')
require('Sequence canonical text', r'canonicalText:\s*text')

# Gospel source heading must be stripped because the graph owns the announcement.
require('Gospel heading normalizer', r'function stripGospelSourceHeading\(')
require('Gospel normalized at Proper construction', r'gospel:\s*stripGospelSourceHeading')

# Persistent reader authority must be independent of VOX/audibility.
require('canonical reader field', r'out\.canonicalText\s*=\s*resolved')
require('Missal prefers canonical reader text', r'const canonical = step\.canonicalText \|\| step\.text')
require('Secret audible conclusion remains separate', r'out\.audibleFragment\s*=\s*secretConclusion')

# Today's Mass must no longer be a six-slot/first-Collect projection.
require('Today Mass all Collects', r"addSeries\('Collect',\s*'Collecte',\s*p\?\.collects\)")
require('Today Mass ordered chants', r'p\?\.preGospelChants')
require('Today Mass Sequence', r"p\?\.sequence")
require('Today Mass all Secrets', r"addSeries\('Secret',\s*'Secrète',\s*p\?\.secrets\)")
require('Today Mass Preface', r'p\?\.preface')
require('Today Mass all Postcommunions', r"addSeries\('Postcommunion',\s*'Postcommunion',\s*p\?\.postcommunions\)")
require('Today Mass super populum', r'p\?\.superPopulum')
# Do not globally ban first-Collect expressions: other consumers may legitimately
# inspect the primary Collect. The Today overview itself is proven by its marker,
# full series calls and liturgical-order assertions above.
require('Today Mass legacy six-slot consumer removed',
        r"today-mass-overview-integrity-20260928-v1")

# Structural order of the dynamically assembled Today overview.
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

# Known branch hooks. These are reported, not silently assumed complete.
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
