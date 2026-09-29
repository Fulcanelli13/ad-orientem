"""Extract evidence for Preface and variable-Canon appointment from index.html.

Diagnostic only: this does not create liturgical mappings. It records the exact
bundle snippets where Preface, Communicantes, and Hanc igitur are selected or
consumed so subsequent fixes can be source-driven.
"""
from pathlib import Path
import json, re

SRC = Path('index.html')
OUT = Path('data/mass-appointment-contract.json')
s = SRC.read_text(encoding='utf-8')

TERMS = {
    'preface': [r'preface', r'Praefatio'],
    'communicantes': [r'communicantes'],
    'hancIgitur': [r'hanc\s+igitur', r'hancIgitur'],
}

def snippets(patterns, radius=700, limit=30):
    hits=[]; seen=set()
    rx=re.compile('|'.join(f'(?:{p})' for p in patterns), re.I)
    for m in rx.finditer(s):
        a=max(0,m.start()-radius); b=min(len(s),m.end()+radius)
        text=s[a:b].replace('\r','')
        sig=re.sub(r'\s+',' ',text)[:220]
        if sig in seen: continue
        seen.add(sig)
        hits.append({'offset':m.start(),'match':m.group(0),'context':text})
        if len(hits)>=limit: break
    return hits

payload={
    'schema':'ad-orientem.mass-appointment-contract.v1',
    'source':'index.html',
    'evidence':{name:snippets(patterns) for name,patterns in TERMS.items()},
}
# Report explicit assignment/selector-shaped evidence separately from mere prayer text.
for name, group in payload['evidence'].items():
    for hit in group:
        c=hit['context']
        hit['selectorLike']=bool(re.search(r'(resolve|select|choose|proper|season|feast|variant|key|id|preface|communicantes|hanc)',c,re.I))

OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for name,hits in payload['evidence'].items():
    print(name, len(hits), 'hits;', sum(h['selectorLike'] for h in hits), 'selector-like')
if not payload['evidence']['preface']:
    raise SystemExit('No Preface evidence found in production bundle')
