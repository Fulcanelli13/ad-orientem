"""Cross-check pinned real Proper records against the production resolver/graph contract."""
from pathlib import Path
import json, re

HTML=Path('index.html').read_text(encoding='utf-8')
CORPUS=json.loads(Path('data/mass-proper-corpus.json').read_text(encoding='utf-8'))
FIX=json.loads(Path('data/mass-proper-fixtures.json').read_text(encoding='utf-8'))
fixtures=FIX.get('fixtures') or {}
records={r['id']:r for r in (CORPUS.get('records') or [])}

required_contract={
    'Secret base section':r'secrets:\s*numbered\(sources,\s*"Secreta",\s*true\)',
    'Postcommunion base section':r'postcommunions:\s*numbered\(sources,\s*"Postcommunio",\s*true\)',
    'semantic pre-Gospel splitter':r'const splitPreGospelLines = \(lines, defaultKind\) =>',
    'combined Tract recognition':r'\^!Tractus\$',
    'multiple Alleluia recognition':r'matches\.length >= 2',
    'semantic chant array':r'const preGospelChants = authority\.map',
    'data-driven chant graph':r'function materializePreGospelSteps\(',
    'Sequence graph':r'function insertSequence\(',
    'Gospel normalization':r'function stripGospelSourceHeading\(',
    'Super populum source binding':r'firstExisting\(sources, \["Oratio super populum", "Super populum"\]\)',
    'Super populum graph':r'function insertSuperPopulum\(',
    'preparatory lessons normalizer':r'preparatoryLessons',
    'preparatory lessons graph':r'function insertPreparatoryLessons\(',
    'canonical reader':r'out\.canonicalText\s*=\s*resolved',
}
for name,pat in required_contract.items():
    assert re.search(pat,HTML),f'production resolver contract missing: {name}'

# Every selected fixture must point to a fetched pinned source record with Latin;
# these common regression records must also have real English and French sources.
for category,rec in fixtures.items():
    assert rec, f'{category}: no pinned source fixture selected'
    rid=rec['id']
    source=records.get(rid)
    assert source, f'{category}/{rid}: fixture not present in fetched corpus'
    for lang in ('la','en','fr'):
        assert not source['languages'][lang]['missing'], f'{category}/{rid}: pinned {lang} source missing'
    print('SOURCE',category,rid,source['signals'])

ordinary=records[fixtures['ordinarySunday']['id']]
assert ordinary['id']=='Tempora/Pent18-0'
assert 'Graduale' in ordinary['sectionOrder']
assert not ordinary['signals']['tractInGraduale']
assert ordinary['signals']['alleluiaGroups']==1, 'Pent18 must expose Gradual + one Alleluia from combined Graduale'

tract=records[fixtures['tract']['id']]
assert tract['signals']['tractInGraduale'], 'real Lenten fixture must prove embedded !Tractus'

easter=records[fixtures['doubleAlleluia']['id']]
assert easter['signals']['alleluiaGroups']>=2, 'real Eastertide fixture must prove multiple Alleluias in one Graduale'

sequence=records[fixtures['sequence']['id']]
assert sequence['signals']['hasSequence'] and 'Sequentia' in sequence['sectionOrder']

prep=records[fixtures['preparatoryLessons']['id']]
assert prep['signals']['preparatoryLessonCount']>0
assert any(re.fullmatch(r'LectioL\d+',x,re.I) for x in prep['sectionOrder'])
assert any(re.fullmatch(r'OratioL\d+',x,re.I) for x in prep['sectionOrder'])

osp=records[fixtures['superPopulum']['id']]
assert osp['signals']['hasSuperPopulum']
assert any(x.lower() in ('super populum','oratio super populum') for x in osp['sectionOrder'])

print('PASS: pinned real-source fixtures prove ordinary Gradual+Alleluia, embedded Tract, double Alleluia, Sequence, preparatory lessons and Super populum contracts')
