"""Select representative regression fixtures from the fetched pinned Proper corpus.

Selection is driven by the source evidence recorded in mass-proper-corpus.json.
No calendar identity or section structure is synthesized here.
"""
from pathlib import Path
import json

SRC=Path('data/mass-proper-corpus.json')
OUT=Path('data/mass-proper-fixtures.json')
data=json.loads(SRC.read_text(encoding='utf-8'))
records=data.get('records') or []
if not records:
    raise SystemExit('Proper corpus is empty')

def find(pred, prefer=None):
    if prefer:
        for r in records:
            if r.get('id')==prefer and pred(r):
                return r
    return next((r for r in records if pred(r)),None)

def summary(r):
    if not r: return None
    return {
        'id':r['id'],
        'sectionOrder':r.get('sectionOrder') or [],
        'signals':r.get('signals') or {},
    }

selected={
    'ordinarySunday':summary(find(lambda r: 'Graduale' in (r.get('sectionOrder') or []) and not r['signals'].get('tractInGraduale') and not r['signals'].get('hasSequence'),'Tempora/Pent18-0')),
    'tract':summary(find(lambda r:r['signals'].get('tractInGraduale'))),
    'doubleAlleluia':summary(find(lambda r:(r['signals'].get('alleluiaGroups') or 0)>=2)),
    'sequence':summary(find(lambda r:r['signals'].get('hasSequence'))),
    'preparatoryLessons':summary(find(lambda r:(r['signals'].get('preparatoryLessonCount') or 0)>0)),
    'superPopulum':summary(find(lambda r:r['signals'].get('hasSuperPopulum'))),
}
missing=[k for k,v in selected.items() if v is None]
if missing:
    raise SystemExit('Missing pinned real-source fixture categories: '+', '.join(missing))

pent=next((r for r in records if r.get('id')=='Tempora/Pent18-0'),None)
if not pent or selected['ordinarySunday']['id']!='Tempora/Pent18-0':
    raise SystemExit('Tempora/Pent18-0 did not satisfy the ordinary-Sunday source-shape contract')

payload={
    'schema':'ad-orientem.mass-proper-fixtures.v2',
    'sourceSchema':data.get('schema'),
    'divinumOfficiumRevision':data.get('divinumOfficiumRevision'),
    'corpusRecordCount':len(records),
    'fixtures':selected,
    'missingCategories':[],
}
OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for name,rec in selected.items():
    print(f'{name}: {rec["id"]} {rec["signals"]}')
