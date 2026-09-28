"""Fetch representative real Proper records from the same pinned upstream corpus
used by the production ProperResolver.

The production app does not embed the daily Proper corpus. It loads pinned
Divinum Officium sources at runtime, with Missale Meum used as a normalized
local layer. This diagnostic therefore records real pinned upstream source
records rather than pretending an embedded catalogue exists.
"""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import json, re

HTML = Path('index.html')
OUT = Path('data/mass-proper-corpus.json')
s = HTML.read_text(encoding='utf-8')

m = re.search(r'divinumOfficium:\s*"([0-9a-f]{40})"', s)
if not m:
    raise SystemExit('Pinned Divinum Officium revision not found in index.html')
REV = m.group(1)
BASE = f'https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/{REV}/web/www/missa'
LANG_DIR = {'la':'Latin','en':'English','fr':'Francais'}

# These are regression exemplars, not invented liturgical mappings. Each one is
# admitted only if its fetched source itself proves the expected structural shape.
CANDIDATES = [
    'Tempora/Pent18-0',   # ordinary Sunday regression target
    'Tempora/Quad1-0',    # Gradual + embedded Tract
    'Tempora/Pasc1-0',    # Eastertide multiple Alleluias in one Graduale section
    'Tempora/Pent01-4',   # appointed Sequence
    'Tempora/Quad1-3',    # preparatory lesson / Ember-style structure
    'Tempora/Quad1-1',    # Super populum
]

def fetch(url):
    req = Request(url, headers={'User-Agent':'ad-orientem-integrity-test/1'})
    try:
        with urlopen(req, timeout=20) as r:
            return r.read().decode('utf-8')
    except HTTPError as exc:
        if exc.code == 404:
            return None
        raise

def parse_sections(text):
    order=[]; sections={}; current='__TOP__'; sections[current]=[]
    for raw in (text or '').splitlines():
        mm=re.fullmatch(r'\s*\[([^\]]+)\]\s*', raw)
        if mm:
            current=mm.group(1).strip()
            if current not in sections:
                order.append(current); sections[current]=[]
            continue
        sections.setdefault(current,[]).append(raw.rstrip())
    return {'order':order,'sections':{k:'\n'.join(v).strip() for k,v in sections.items() if k!='__TOP__'}}

ALLELUIA=re.compile(r'all[eé]l[uú](?:i|í|j)a', re.I)
def semantic_signals(parsed):
    order=parsed['order']; sections=parsed['sections']; grad=sections.get('Graduale','')
    lines=[x.strip() for x in grad.splitlines() if x.strip() and x.strip()!='_']
    double_line=next((i for i,x in enumerate(lines) if len(ALLELUIA.findall(x))>=2), None)
    alleluia_groups=0
    if double_line is not None:
        # The initial double Alleluia is the incipit; each scripture-reference
        # group that follows is one Alleluia chant in the pinned source grammar.
        after=lines[double_line+1:]
        refs=sum(1 for x in after if x.startswith('!'))
        alleluia_groups=max(1,refs)
    return {
        'tractInGraduale': any(re.fullmatch(r'!Tractus',x,re.I) for x in lines),
        'alleluiaGroups': alleluia_groups,
        'hasSequence': 'Sequentia' in sections,
        'preparatoryLessonCount': sum(1 for x in order if re.fullmatch(r'LectioL\d+',x,re.I)),
        'hasSuperPopulum': any(x.lower() in ('super populum','oratio super populum') for x in order),
    }

records=[]
for path in CANDIDATES:
    langs={}
    for language,directory in LANG_DIR.items():
        url=f'{BASE}/{directory}/{path}.txt'
        text=fetch(url)
        if text is None:
            langs[language]={'source':url,'missing':True,'order':[],'sections':{}}
        else:
            parsed=parse_sections(text)
            langs[language]={'source':url,'missing':False,**parsed}
    if langs['la']['missing']:
        raise SystemExit(f'Pinned Latin Proper source missing: {path}')
    records.append({
        'id':path,
        'sectionOrder':langs['la']['order'],
        'signals':semantic_signals(langs['la']),
        'languages':langs,
    })

payload={
    'schema':'ad-orientem.mass-proper-corpus.v2',
    'source':'pinned Divinum Officium runtime corpus',
    'divinumOfficiumRevision':REV,
    'recordCount':len(records),
    'records':records,
}
OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'wrote {OUT}: {len(records)} pinned real-source records at {REV[:12]}')
