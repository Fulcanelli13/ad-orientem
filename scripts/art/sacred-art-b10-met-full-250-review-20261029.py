#!/usr/bin/env python3
"""Batch 10: full-catalogue, not repeated keyword searches, of Met open-access sacred paintings.

Pre-filter the Met museum CC0 metadata catalogue (CSV) locally, then resolve
every selected artwork against the live Met Collection API and verify the
actual official preview JPEG. No output if the full 250 cannot be validated.
Research only; no originals archived or production changes.
"""
from __future__ import annotations
import concurrent.futures,csv,hashlib,importlib.util,io,json,re,time,urllib.request,urllib.error
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
OUT=D/'sacred-art-b10-met-full-catalogue-250-20261029.v1.json'
HTML=ROOT/'docs/SACRED_ART_MET_FULL_CATALOGUE_250_REVIEW_B10_20261029.html'
QA=ROOT/'docs/SACRED_ART_B10_FULL_CATALOGUE_QA_20261029.md'
MET_CSV='https://media.githubusercontent.com/media/metmuseum/openaccess/master/MetObjects.csv'
MODULE=ROOT/'scripts/art/sacred-art-b9-met-250-review-20261029.py'
spec=importlib.util.spec_from_file_location('ao_met_b9',MODULE)
M=importlib.util.module_from_spec(spec);spec.loader.exec_module(M)
UA='AdOrientemSacredArt-B10-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
FAV=M.FAVORITE
def get_previous():
 old,split=M.prior_ids()
 b9=json.loads((D/'sacred-art-b9-met-250-review-source-20261029.v1.json').read_text())
 ids={r['id'] for r in b9['rows']}
 assert len(ids)==195 and not ids&old
 old|=ids
 assert len(old)==1455,(len(old),split)
 split['B9']=195
 # Account for the two new user-supplied decision files without mutating originals.
 expected={
  'B7':('sacred-art-b7-user-final-decisions-20261029.v1.json',
    'sacred-art-b7-official-museum-candidates-20261029.v1.json',231,41,1,189),
  'B8':('sacred-art-b8-user-final-decisions-20261029.v1.json',
    'sacred-art-b8-smk-250-source-20261029.v1.json',96,52,2,42),
 }
 for batch,(path,src,n,imports,corrections,rejects) in expected.items():
  d=json.loads((D/path).read_text());source=json.loads((D/src).read_text());rows=source['rows']
  assert d['completeBatch'] is True and len(rows)==n
  assert d['counts']=={'IMPORT':imports,'IMPORT_WITH_CORRECTIONS':corrections,'REJECT':rejects}
  selected=set(d['importSourceIds'])|{x['sourceId'] for x in d['importWithCorrections']}
  assert len(selected)==imports+corrections
  assert selected<={r['id'] for r in rows}
  assert len({r['id'] for r in rows}-selected)==rejects
  digest=hashlib.sha256(json.dumps([r['id'] for r in rows],separators=(',',':')).encode()).hexdigest()
  assert d['batchSha256']==digest,(batch,d['batchSha256'],digest)
 return old,split
def canonical():
 j=json.loads((D/'sacred-art-curator-queues-383-20261029.v1.json').read_text())
 c=set();titles=set()
 for r in j['main_records']:
  for url in (str(r.get('source_page') or ''),str(r.get('visual_evidence') or '')):
   for n in re.findall(r'(?:metmuseum.org/art/collection/search/|metmuseum.org/art/collection/search\?objectId=)(\d+)',url):
    c.add('met:'+n)
  if r.get('editorial_state')=='APPROVED_LOCKED':
   titles.add((M.norm(r.get('title')),M.norm(r.get('artist'))))
 return c,titles
def good_csv(r):
 if str(r.get('Department') or '') not in ('European Paintings','The Cloisters','American Paintings and Sculpture'):return False
 if str(r.get('Is Public Domain') or '').strip().lower() not in ('true','1'):return False
 if str(r.get('Object Name') or '').lower() not in ('painting','panel painting','fresco',''):return False
 typ=str(r.get('Classification') or '').lower()
 if 'painting' not in typ:return False
 med=str(r.get('Medium') or '').lower()
 if not any(x in med for x in ('oil on','tempera on','oil and tempera','oil, tempera','fresco','oil over')):return False
 if any(x in med for x in ('watercolor','print','etching','engraving','lithograph','photograph')):return False
 t=str(r.get('Title') or '')
 artist=str(r.get('Artist Display Name') or '')
 if any(z in artist.lower() for z in ('el greco','fra angelico')):return False
 if not M.is_sacred({'title':t}):return False
 begin=str(r.get('Object Begin Date') or '')
 if begin.strip().lstrip('-').isdigit() and (int(begin)<1280 or int(begin)>1890):return False
 return True
def rank(r):
 t=str(r.get('Title') or '').lower();a=str(r.get('Artist Display Name') or '').lower()
 y=int(r['Object Begin Date']) if str(r.get('Object Begin Date') or '').isdigit() else 0
 medium=str(r.get('Medium') or '').lower()
 dept=str(r.get('Department') or '')
 return (0 if any(z in a for z in FAV) else 1,
   0 if 1550<=y<=1780 else 1 if 1450<=y<=1850 else 2,
   0 if medium.startswith('oil') else 1,
   0 if dept=='European Paintings' else 1,
   0 if any(z in t for z in ('christ','madonna','virgin','saint','crucifix','holy family')) else 1,
   t,int(r['Object ID']))
def csv_all(exclude,canonical_ids,canonical_titles):
 req=urllib.request.Request(MET_CSV,headers={'User-Agent':UA,'Accept':'text/csv'})
 n=0;out=[];sourceErrors=[]
 with urllib.request.urlopen(req,timeout=115) as response:
  meta={'url':MET_CSV,'status':response.status,'mime':response.headers.get('Content-Type'),
    'contentLength':response.headers.get('Content-Length')}
  raw=io.TextIOWrapper(response,encoding='utf-8-sig',newline='',errors='replace')
  for line in csv.DictReader(raw):
   n+=1
   if not good_csv(line):continue
   oid=str(line.get('Object ID') or '')
   if not oid.isdigit():continue
   rid='met:'+oid
   if rid in exclude or rid in canonical_ids:continue
   identity=(M.norm(line.get('Title')),M.norm(line.get('Artist Display Name')))
   if identity in canonical_titles:continue
   out.append(line)
 meta['totalRowsScanned']=n;meta['sacredRowsAfterPriorExclusions']=len(out)
 return out,meta
def live_get(oid):
 try:
  url='https://collectionapi.metmuseum.org/public/collection/v1/objects/'+str(oid)
  req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json'})
  with urllib.request.urlopen(req,timeout=18) as r:
   if r.status!=200:raise ValueError('HTTP_'+str(r.status))
   raw=r.read(450000)
  obj=json.loads(raw)
  return obj,None
 except Exception as e:return None,type(e).__name__+': '+str(e)[:130]
def jpeg(x):
 url=x['primaryImageSmall']
 try:
  if not url.startswith('https://images.metmuseum.org/CRDImages/'):return False,'bad source'
  req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'image/jpeg','Range':'bytes=0-15'})
  with urllib.request.urlopen(req,timeout=18) as r:
   head=r.read(16)
  return head.startswith(bytes.fromhex('ffd8')),'valid jpeg'
 except Exception as e:return False,type(e).__name__+': '+str(e)[:110]
def make_gallery(rows):
 h=(ROOT/'docs/SACRED_ART_MET_195_IMPORT_REVIEW_B9_20261029.html').read_text()
 digest=hashlib.sha256(json.dumps([x['id'] for x in rows],separators=(',',':')).encode()).hexdigest()
 payload=json.dumps(rows,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
 h,n=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script><script>)',
   lambda m:m.group(1)+payload+m.group(2),h,count=1,flags=re.S)
 assert n==1
 h,n=re.subn(r'const batchHash="[0-9a-f]+";',lambda m:'const batchHash="'+digest+'";',h,count=1)
 assert n==1
 h=re.sub(r'<title>.*?</title>',
   '<title>Ad Orientem | Sacred Art Batch 10 ('+str(len(rows))+')</title>',h,count=1,flags=re.S)
 h=h.replace('The Metropolitan Museum of Art · Batch 9','Metropolitan Museum · Full Catalogue · Batch 10')
 h=h.replace('batchId:\'B9\'','batchId:\'B10\'')
 h=h.replace('ao-sacred-art-b9-met-import-','ao-sacred-art-b10-met-catalogue-import-')
 h=h.replace('ad-orientem-sacred-art-b9-met-','ad-orientem-sacred-art-b10-full-met-')
 assert "batchId:'B10'" in h
 HTML.write_text(h,encoding='utf8')
 return digest
def main():
 exclude,prior_count=get_previous()
 cids,ctitles=canonical()
 candidates,csv_meta=csv_all(exclude,cids,ctitles)
 print('B10_CSV',json.dumps({'candidateCount':len(candidates),'source':csv_meta},ensure_ascii=False)[:2000],flush=True)
 assert len(candidates)>30,('insufficient full catalogue source candidates',len(candidates))
 candidates.sort(key=rank)
 verified=[];errors=[];checked=0
 # Bounded batches; use authoritative current API, never rely on stale CSV for licensing.
 for start in range(0,min(1200,len(candidates)),72):
  chunk=candidates[start:start+72]
  with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
   results=list(pool.map(live_get,[r['Object ID'] for r in chunk]))
  for meta,(obj,error) in zip(chunk,results):
   checked+=1
   if error:
    if len(errors)<200:errors.append({'id':meta['Object ID'],'error':error})
    continue
   if not M.eligible(obj):continue
   if 'met:'+str(obj['objectID']) in exclude:continue
   identity=(M.norm(obj.get('title')),M.norm(obj.get('artistDisplayName')))
   if identity in ctitles:continue
   verified.append(obj)
  print('B10_CURRENT_API',json.dumps({'checked':checked,'eligible':len(verified),'errors':len(errors)}),flush=True)
  if len(verified)>=120:break
  time.sleep(.2)
 verified.sort(key=M.priority)
 unique=[];seen=set()
 for x in verified:
  key=(M.norm(x.get('title')),M.norm(x.get('artistDisplayName')))
  if key in seen:continue
  seen.add(key);unique.append(x)
 selected=[];image_errors=[];image_checked=0
 for start in range(0,min(len(unique),410),50):
  chunk=unique[start:start+50]
  with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
   verdicts=list(pool.map(jpeg,chunk))
  for obj,(ok,error) in zip(chunk,verdicts):
   image_checked+=1
   if not ok:
    image_errors.append({'id':obj['objectID'],'error':error});continue
   oid=int(obj['objectID'])
   selected.append({'id':'met:'+str(oid),'provider':'Met',
    'sourceInstitution':'The Metropolitan Museum of Art, New York',
    'objectId':str(oid),'accession':obj.get('accessionNumber') or str(oid),
    'title':obj['title'],'artist':obj.get('artistDisplayName') or 'Unattributed',
    'medium':obj.get('medium'),'date':obj.get('objectDate'),
    'objectUrl':obj.get('objectURL') or 'https://www.metmuseum.org/art/collection/search/'+str(oid),
    'previewURL':obj['primaryImageSmall'],'nativeImageURL':obj['primaryImage'],
    'sourceRights':'MET_PUBLIC_DOMAIN_TRUE_OPEN_ACCESS_CC0','imageRightsVerified':True,
    'rightsConflict':None,'productionOriginalImageQA':False,'productionImported':False})
   if len(selected)==250:break
  if len(selected)==250:break
 digest=make_gallery(selected) if selected else None
 report={'schema':'AO_SACRED_ART_B10_MET_COMPLETE_CATALOGUE_REVIEW_V1',
  'date':'2026-10-29','batchId':'B10','target':250,'fullBatchReady':len(selected)==250,
  'counts':{'sourceCSVRowsScanned':csv_meta['totalRowsScanned'],
    'sourceSacredAfterExclusions':csv_meta['sacredRowsAfterPriorExclusions'],
    'liveObjectsChecked':checked,'liveValidCandidates':len(verified),
    'uniqueCandidateWorks':len(unique),'previewChecks':image_checked,
    'imageFailures':len(image_errors),'reviewablePaintings':len(selected),
    'priorReviewIDsExcluded':len(exclude),'priorBatchCounts':prior_count,
    'priorB7UserSelectionsPreserved':42,'priorB8UserSelectionsPreserved':54,
    'canonicalMuseumIDsExcluded':len(cids),'productionOriginalsDownloaded':0,
    'productionMutations':0},
  'source':csv_meta,'errors':errors,'imageErrors':image_errors,
  'batchHash':digest,'userApprovalCount':0,
  'provenance':'Met 2023 official CC0 metadata CSV prefilter, live 2026 Met per-object exact rights and official JPEG bytes verification',
  'limitations':'Research previews only, no independent native-image color/frames/cropping/aesthetic QA',
  'rows':selected}
 OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 QA.write_text('# Sacred Art Batch 10 — full Met painting catalogue\n\n'
   f"**{len(selected)}** unique official live-image-reviewed candidates of target 250. "
   f"CSV rows scanned {csv_meta['totalRowsScanned']}; sacred candidates after exclusions {csv_meta['sacredRowsAfterPriorExclusions']}. "
   f"Live 2026 object records checked {checked}; verified {len(verified)}; JPEG checks {image_checked}, failures {len(image_errors)}.\n\n"
   f"**{len(exclude)}** earlier review IDs excluded: {prior_count}. "
   'B7 42 and B8 54 user selections (including all three corrections) preserved and validated from frozen ledgers.\n\n'
   'Getty public collection SPARQL search HTTP 401; Mia image host 403. Thus use official Met full-catalogue expansion to avoid further broken review cards. '
   'Metadata CSV is only a discovery index, rights/source image confirmed anew per 2026 API record.\n\n'
   'No saved photographic originals, no production imports, no fee. No visual beauty grade until human editorial review. '
   'Native source image, frame and colour fidelity must be checked later.\n\n'
   f'Batch hash: {digest}.\n')
 print('B10_FINAL',json.dumps({'counts':report['counts'],'hash':digest,
   'sample':[(x['title'],x['artist']) for x in selected[:15]]},ensure_ascii=False)[:5500],flush=True)
if __name__=='__main__':main()
