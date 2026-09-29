"""Representative source-level fixtures for the 1962 Mass Proper normalizer.

These fixtures test the contracts repaired by TEXT_PROPER_INTEGRITY without
inventing calendar assignments. They deliberately model the section shapes that
occur in the authoritative source corpus: ordinary Gradual+Alleluia, penitential
Tract, Eastertide multiple Alleluias, Sequence, numbered prayer series and
Oratio super populum.
"""
from dataclasses import dataclass
import re

@dataclass
class Sources:
    order: list[str]
    sections: dict[str, str]

def collect_series(src: Sources, base: str) -> list[str]:
    out = []
    if src.sections.get(base):
        out.append(src.sections[base])
    numbered = []
    for key, value in src.sections.items():
        m = re.fullmatch(re.escape(base) + r'(\d+)', key)
        if m and value:
            numbered.append((int(m.group(1)), value))
    out.extend(value for _, value in sorted(numbered))
    return out

def pre_gospel(src: Sources) -> list[tuple[str, str]]:
    ids = []
    for key in src.order:
        if re.fullmatch(r'(?:Graduale|GradualeP|Tractus|Alleluia)(?:\d+)?', key) and key not in ids:
            ids.append(key)
    def kind(key):
        if key.startswith('Tractus'): return 'tract'
        if key.startswith('Alleluia'): return 'alleluia'
        return 'gradual'
    return [(kind(key), src.sections[key]) for key in ids if src.sections.get(key)]

def normalized_fixture(src: Sources):
    return {
        'collects': collect_series(src, 'Oratio'),
        'chants': pre_gospel(src),
        'sequence': src.sections.get('Sequentia'),
        'secrets': collect_series(src, 'Secreta'),
        'postcommunions': collect_series(src, 'Postcommunio'),
        'superPopulum': src.sections.get('Oratio super populum'),
    }

def check(name, src, expected):
    got = normalized_fixture(src)
    for key, value in expected.items():
        assert got[key] == value, f'{name}: {key}: expected {value!r}, got {got[key]!r}'
    print('PASS', name)

# 1. Ordinary Sunday shape: Gradual followed by Alleluia; unnumbered prayer series.
check('ordinary Sunday Gradual + Alleluia', Sources(
    ['Introitus','Oratio','Lectio','Graduale','Alleluia','Evangelium','Offertorium','Secreta','Communio','Postcommunio'],
    {'Oratio':'C1','Graduale':'G1','Alleluia':'A1','Secreta':'S1','Postcommunio':'P1'}), {
    'collects':['C1'], 'chants':[('gradual','G1'),('alleluia','A1')],
    'secrets':['S1'], 'postcommunions':['P1']})

# 2. Penitential/Lenten shape: Tract replaces Alleluia.
check('Lent Tract', Sources(
    ['Oratio','Lectio','Graduale','Tractus','Evangelium','Secreta','Postcommunio'],
    {'Oratio':'C1','Graduale':'G1','Tractus':'T1','Secreta':'S1','Postcommunio':'P1'}), {
    'chants':[('gradual','G1'),('tract','T1')], 'sequence':None})

# 3. Eastertide shape: multiple Alleluias must remain distinct and ordered.
check('Eastertide double Alleluia', Sources(
    ['Oratio','Lectio','Alleluia','Alleluia2','Evangelium','Secreta','Postcommunio'],
    {'Oratio':'C1','Alleluia':'A1','Alleluia2':'A2','Secreta':'S1','Postcommunio':'P1'}), {
    'chants':[('alleluia','A1'),('alleluia','A2')]})

# 4. Sequence feast: Sequence is distinct from the pre-Gospel chant complex.
check('Sequence feast', Sources(
    ['Oratio','Lectio','Graduale','Alleluia','Sequentia','Evangelium','Secreta','Postcommunio'],
    {'Oratio':'C1','Graduale':'G1','Alleluia':'A1','Sequentia':'SEQ','Secreta':'S1','Postcommunio':'P1'}), {
    'chants':[('gradual','G1'),('alleluia','A1')], 'sequence':'SEQ'})

# 5. Ember/commemoration-shaped prayer series: retain base + numbered prayers.
check('multiple lessons/prayer series', Sources(
    ['Oratio','Oratio2','Oratio3','Lectio','Secreta','Secreta2','Secreta3','Postcommunio','Postcommunio2','Postcommunio3'],
    {'Oratio':'C1','Oratio2':'C2','Oratio3':'C3','Secreta':'S1','Secreta2':'S2','Secreta3':'S3','Postcommunio':'P1','Postcommunio2':'P2','Postcommunio3':'P3'}), {
    'collects':['C1','C2','C3'], 'secrets':['S1','S2','S3'], 'postcommunions':['P1','P2','P3']})

# 6. Penitential Prayer over the People: independent appointed slot after Postcommunion.
check('Oratio super populum', Sources(
    ['Oratio','Lectio','Tractus','Evangelium','Secreta','Postcommunio','Oratio super populum'],
    {'Oratio':'C1','Tractus':'T1','Secreta':'S1','Postcommunio':'P1','Oratio super populum':'OSP'}), {
    'chants':[('tract','T1')], 'postcommunions':['P1'], 'superPopulum':'OSP'})

print('PASS: 6 representative liturgical source-shape fixtures')
