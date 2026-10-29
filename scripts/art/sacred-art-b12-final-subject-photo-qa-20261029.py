#!/usr/bin/env python3
"""B12 final content sweep: replace six obvious non-original/school/photo exceptions.

Revisit high-yield already verified source categories only. Each replacement
needs unique source+title/artist and actual PD/CC0 JPEG byte validation.
Preserve initial 250-card original source as immutable research evidence.
"""
from __future__ import annotations
import hashlib,importlib.util,json,re,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
SRC=D/'sacred-art-b12-commons-250-reviewed-20261029.v1.json'
OUT=D/'sacred-art-b12-final-250-quality-corrected-20261029.v2.json'
HTML=ROOT/'docs/SACRED_ART_NEXT_250_IMPORT_REVIEW_B12_FINAL_20261029.html'
QA=ROOT/'docs/SACRED_ART_B12_FINAL_VISUAL_SUBJECT_QA_20261029.md'
spec=importlib.util.spec_from_file_location('ao_b12',ROOT/'scripts/art/sacred-art-b12-commons-250-review-20261029.py')
B=importlib.util.module_from_spec(spec);spec.loader.exec_module(B)
M=B.M
EXACT_HOLDS={
 'A young woman sitting in a stable. A paraphrase of the Penitent Mary Magdalene':'modern allegory rather than a direct religious scene',
 'Danish: Studie til Kristus. Alma Bloch | Study for Christ. Alma Bloch. " "':'study rather than complete old-master painting',
 'Abraham Janssens (1573-1632) Christus van het kruis afgenomen - Sint-Janskerk (Mechelen) 13-09-2018':'church-location photograph rather than vetted faithful art reproduction',
 'Sarg des Heiligen Grabes in der Frauenkirche zu Memmingen: Schlafender Grabwächter mit Streitkolben und Schwert':'church furnishing and not the claimed oil painting',
 'The Sermon of Antonius':'1892 symbolic scene outside preferred old-master style',
 'Assumption of the Virgin - Francesco Bassano The Younger -1589; Chiesa di San Luigi dei Francesi, Rome':'in situ church photograph held for visual reproduction QA',
}
def norm(s):return re.sub(r'\s+',' ',str(s or '').lower()).strip()
def main():
 initial=json.loads(SRC.read_text())
 assert initial['completeBatchReady'] and len(initial['rows'])==250
 hold=[];keep=[]
 for x in initial['rows']:
  if x['title'] in EXACT_HOLDS:
   hold.append({'sourceId':x['id'],'title':x['title'],'reason':EXACT_HOLDS[x['title']]})
  else:keep.append(x)
 assert len(hold)==6,(len(hold),hold)
 priorids,priorwork,_=B.prior()
 seenID=priorids|{x['id'] for x in initial['rows']}
 seenWork=priorwork|{M.workkey(x['title'],x['artist']) for x in initial['rows']}
 # Focus on source categories already verified in the first scan. The 10
 # surplus discovery artworks have never been shown; restore and verify them.
 cats=sorted(initial['catalogueCategories'].items(),
  key=lambda kv:(-kv[1].get('candidateCards',0),kv[0]))
 categories=[c for c,v in cats if v.get('candidateCards',0)>=4][:110]
 pool=[];seenPool=set();evidence={}
 for i,cat in enumerate(categories):
  rs,st=M.image_cards(cat,maxPages=2)
  evidence[cat]={'imageRecords':len(rs),'pages':st['pages'],'errors':st['errors']}
  for x in rs:
   if x['id'] in seenID or x['id'] in seenPool or not B.photo_qualifies(x):continue
   wk=M.workkey(x['title'],x['artist'])
   if wk in seenWork:continue
   seenPool.add(x['id']);pool.append(x)
  if i%20==0:
   print('B12_PATCH_CATEGORY',json.dumps({'index':i+1,'pool':len(pool)}),flush=True)
 # Prefer a proper source/artwork title to user-upload in situ photos.
 pool.sort(key=lambda x:(M.score(x),0 if any(z in x['fileTitle'].lower() for z in
  ('google art project','museum of fine arts','national gallery','louvre','kunsthistorisches','gemäldegalerie')) else 1))
 picked=[];errors=[];distinctworks=set()
 for x in pool:
  if len(picked)>=6:break
  wk=M.workkey(x['title'],x['artist'])
  if wk in distinctworks:continue
  ok,why=B.check_slow(x)
  if ok:
   picked.append(x);distinctworks.add(wk)
  else:
   errors.append({'id':x['id'],'error':why})
  if len(errors)>=3 and any('429' in z['error'] for z in errors):
   break
 print('B12_PATCH_REPLACEMENTS',json.dumps({'target':6,'found':len(picked),'pool':len(pool),'errors':errors[:6],
  'choices':[(x['title'],x['artist']) for x in picked]},ensure_ascii=False),flush=True)
 assert len(picked)==6,('six good source-backed replacement artworks unavailable',len(picked))
 rows=keep+picked
 assert len(rows)==250 and len({x['id'] for x in rows})==250
 sha=hashlib.sha256(json.dumps([x['id'] for x in rows],separators=(',',':')).encode()).hexdigest()
 h=(ROOT/'docs/SACRED_ART_NEXT_250_IMPORT_REVIEW_B12_20261029.html').read_text()
 payload=json.dumps(rows,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
 h,n=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script><script>)',
   lambda m:m.group(1)+payload+m.group(2),h,count=1,flags=re.S)
 assert n==1
 h,n=re.subn(r'const batchHash="[0-9a-f]+";',lambda m:'const batchHash="'+sha+'";',h,count=1)
 assert n==1
 h=re.sub(r'<title>.*?</title>','<title>Ad Orientem | Sacred Art Batch 12 Final Quality Screen (250)</title>',
  h,count=1,flags=re.S)
 assert "batchId:'B12'" in h
 HTML.write_text(h,encoding='utf8')
 out={'schema':'AO_B12_FINAL_250_QUALITY_CORRECTED_REVIEW_V2','date':'2026-10-29','batchId':'B12',
  'batchReady':True,'target':250,'batchSha256':sha,
  'counts':{'reviewable':250,'technicalOriginalSourceImages':250,
    'manualMetadataDisqualifications':len(hold),'verifiedSubstitutionImages':len(picked),
    'previousBatchesReviewCardsExcluded':1955,'productionImports':0,'originalImagesDownloaded':0},
  'heldPriorCandidates':hold,'replacementSourceIds':[x['id'] for x in picked],
  'additionalCategoryEvidence':evidence,'newImageFailures':errors,
  'limits':'Automated source- and subject-specific screening only; no frame-free or colour-fidelity guarantee without human review.',
  'rows':rows}
 OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 QA.write_text('# Sacred Art B12 — Final subject-reproduction audit\n\n'
  f"Final review **250** works. Held {len(hold)} identifiable non-finished or doubtful photograph/subject records "
  f"and substituted {len(picked)} new file-level PD/CC0 and JPEG-verified works.\n\n"
  f"Excluded all 1,955 previous review source IDs, plus work+artist matches; photo originals not saved, no production imports.\n\n"
  'Licence, native dimensions, visible preview and source title verified; historical authorship, frames, true-colour and detailed aesthetic quality remain curator review obligations.\n\n'
  f'Final SHA256 review identity {sha}.\n',encoding='utf8')
 print('B12_PATCH_FINAL',json.dumps({'sha':sha,'held':hold,
  'replacement':[(x['id'],x['title'],x['artist']) for x in picked]},ensure_ascii=False)[:6500],flush=True)
if __name__=='__main__':main()
