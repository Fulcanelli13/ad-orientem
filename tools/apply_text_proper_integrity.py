from pathlib import Path

PATH = Path('index.html')
SENTINEL = 'mass-text-proper-integrity-20260927-v1'


def replace_count(text, old, new, expected, label):
    n = text.count(old)
    if n != expected:
        raise RuntimeError(f'{label}: expected {expected} matches, found {n}')
    return text.replace(old, new)


s = PATH.read_text(encoding='utf-8')
if SENTINEL in s:
    print('TEXT_PROPER_INTEGRITY already applied')
    raise SystemExit(0)

# P0: the Divinum Officium source normally uses unnumbered [Secreta] and
# [Postcommunio]. They must be collected on the same terms as [Oratio].
s = replace_count(
    s,
    'secrets: numbered(sources, "Secreta"),',
    'secrets: numbered(sources, "Secreta", true),',
    1,
    'primary Secret base-section parsing',
)
s = replace_count(
    s,
    'postcommunions: numbered(sources, "Postcommunio"),',
    'postcommunions: numbered(sources, "Postcommunio", true),',
    1,
    'primary Postcommunion base-section parsing',
)

# The commemoration merger had the identical asymmetry. Without this fix the
# principal Mass works while commemorated Secret/Postcommunion texts vanish.
s = replace_count(
    s,
    "const secret = (0, proper_resolver_1.numbered)(sources, 'Secreta')[0];",
    "const secret = (0, proper_resolver_1.numbered)(sources, 'Secreta', true)[0];",
    1,
    'commemoration Secret base-section parsing',
)
s = replace_count(
    s,
    "const postcommunion = (0, proper_resolver_1.numbered)(sources, 'Postcommunio')[0];",
    "const postcommunion = (0, proper_resolver_1.numbered)(sources, 'Postcommunio', true)[0];",
    1,
    'commemoration Postcommunion base-section parsing',
)

# Marker is deliberately a JS comment so the production bundle remains valid.
anchor = 'function normalizeProper(meta, sources, preface, diagnostic) {'
if s.count(anchor) != 1:
    raise RuntimeError(f'integrity marker anchor: expected 1 match, found {s.count(anchor)}')
s = s.replace(anchor, f'/* {SENTINEL} */\n' + anchor, 1)

# Guard the exact defect class before writing.
for forbidden in (
    'secrets: numbered(sources, "Secreta"),',
    'postcommunions: numbered(sources, "Postcommunio"),',
    "numbered)(sources, 'Secreta')[0]",
    "numbered)(sources, 'Postcommunio')[0]",
):
    if forbidden in s:
        raise RuntimeError(f'legacy Proper parser survived patch: {forbidden}')

PATH.write_text(s, encoding='utf-8')
print('Applied TEXT_PROPER_INTEGRITY v1: Secret/Postcommunion + commemorations')
