#!/usr/bin/env python3
"""B6 museum-source verified 250 different Walter Art Museum paintings.
Public Walters CC0 metadata, painting class, artist via creators.csv, exact media.csv image
link. Verify 16-byte JPEG Range signature for every image before building review cards.
No source originals saved, no production uploads, Walter exceptions held for QA.
"""
from __future__ import annotations
import argparse,csv,io,json,re,time,urllib.parse,urllib.request
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
OUT=D/'sacred-art-walters-250-b6-20261029.v1.json'
REPORT=ROOT/'docs/SACRED_ART_WALTERS_250_B6_SOURCE_QA_20261029.md'
URL='https://raw.githubusercontent.com/WaltersArtMuseum/api-thewalters-org/main/'
UA='AdOrientem-SacredArt-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
SUBJECT=('christ','jesus','virgin','madonna','saint ','st. ','saints','apostle',
'annunc','nativity','adoration','crucifix','magdalen','resurrection','assumption',
'ascension','pieta','pietà','ecce homo','pentecost','martyr','baptism','holy family',
'john the baptist','visitation','lamentation','deposition','holy trinity','sacred heart',
'holy mother','archangel','stigmata','the passion','the trinity')
NEG=('saint louis city','saint tropez','view of','landscape near','church at','city of',
'square of','st. petersburg','christopher columbus','christie','saint lawrence river',
'portrait of the church','mosque','buddha','krishna','hindu','ganesha','islam')
BLOCKED_MEDIUM=('watercolor','paper','manuscript','engraving','lithograph','drawn',
'print','stone','stucco','ivory','ceramic','metal','pencil','chalk','ink','parchment',
'vellum','book','gouache','photograph','bronze')
FAV=('rubens','van dyck','champaigne','caravaggio','murillo','ribera',
'zurbar','carracci','guido reni','giordano','guercino','gentileschi',
'jordaens','strozzi','lanfranco','tintoretto','veronese','de crayer',
'cavallino','cossiers','tiepolo','brueghel','francken','velazquez',
'preti','solimena','vouet','le brun','de la tour','poussin','de vos',
'barocci','mignard','honthorst','luca giordano','van oost')
def low(s):return re.sub(r'\s+',' ',str(s or '')).strip().lower()
def csvsource(name):
 url=URL+name
 p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname!='raw.githubusercontent.com':raise ValueError('SOURCE_HOST')
 rq=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'text/csv'})
 f=urllib.request.urlopen(rq,timeout=65)
 return f,csv.DictReader(io.TextIOWrapper(f,encoding='utf-8-sig',newline=''))
def good(o):
 t=low(o.get('Title'));med=low(o.get('Medium'));cl=low(o.get('Classification'))
 if 'painting' not in cl or not any(q in t for q in SUBJECT):return False
 if any(q in t for q in NEG):return False
 if not any(q in med for q in ('oil','tempera','acrylic','distemper')):return False
 if any(q in med for q in BLOCKED_MEDIUM):return False
 if re.search(r'\b(christopher|christie|christiania|st\. peter.s square)\b',t):return False
 start=str(o.get('DateBeginYear') or '').strip()
 end=str(o.get('DateEndYear') or '').strip()
 if start.lstrip('-').isdigit() and int(start)>1900:return False
 if end.lstrip('-').isdigit() and int(end)>1920:return False
 return True
def image_check(url):
 p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname!='art.thewalters.org' or not p.path.startswith('/images/raw/') or not p.path.endswith('.jpg'):
  return False,'UNTRUSTED_IMAGE_URL'
 try:
  rq=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'image/jpeg','Range':'bytes=0-15'})
  with urllib.request.urlopen(rq,timeout=17) as r:
   code=r.status;ctype=r.headers.get('Content-Type','');start=r.read(16)
  return(code in (200,206) and ctype.startswith('image/') and start.startswith(bytes.fromhex('ffd8'))),f'{code} {ctype}'
 except Exception as e:return False,type(e).__name__+': '+str(e)[:145]
def rank(o):
 a=low(o['artist']);t=low(o['title']);start=o.get('start',0)
 year=int(start) if str(start).lstrip('-').isdigit() else 0
 return(0 if any(x in a for x in FAV) else 1,
  0 if 1550<=year<=1800 else 1 if 1400<=year<=1900 else 2,
  0 if 'oil on canvas' in low(o['medium']) else 1,
  0 if any(t.startswith(q) for q in ('christ','the virgin','saint','st.','holy family','madonna')) else 1,
  t,o['id'])
def main():
 p=argparse.ArgumentParser()
 p.add_argument('--target',type=int,default=250)
 p.add_argument('--max-checks',type=int,default=360)
 p.add_argument('--delay',type=float,default=.08)
 args=p.parse_args()
 assert 200<=args.target<=300 and 260<=args.max_checks<=500
 b3=json.loads((D/'sacred-art-250-review-source-b3-20261029.v1.json').read_text())
 b4=json.loads((D/'sacred-art-b4-multimuseum-working-review-20261029.v1.json').read_text())
 b5=json.loads((D/'sacred-art-nga-open-250-b5r-20261029.v1.json').read_text())
 b3choices=json.loads((D/'sacred-art-b3-final-user-decisions-20261029.v1.json').read_text())
 prev60=json.loads((D/'sacred-art-20261029-user-60-import-reject-ledger.v1.json').read_text())
 canon=json.loads((D/'sacred-art-curator-queues-383-20261029.v1.json').read_text())
 assert len(b3['rows'])==250 and len(b4['rows'])==123 and len(b5['rows'])==250
 assert b3choices['sourceCardCount']==250 and prev60['sourceRecordCount']==60 and len(canon['main_records'])==383
 exclude={o['id'] for group in (b3['rows'],b4['rows'],b5['rows']) for o in group}
 exclude|={o['sourceId'] for q in ('imports','rejects') for o in prev60[q]}
 assert len(exclude)==683
 # Preserve any canonical exact Walters object IDs or accession matches when present.
 cids=set();cacc=set()
 for obj in canon['main_records']:
  blob=json.dumps(obj,ensure_ascii=False)
  for m in re.finditer(r'(?:walters\.org/(?:art/|.*?object/))(\d+)',blob,re.I):cids.add(m.group(1))
  for m in re.finditer(r'walters\.org/art/([A-Za-z0-9.]+)/',blob,re.I):cacc.add(m.group(1))
 creator={}
 f,records=csvsource('creators.csv')
 try:
  for r in records:
   id=r.get('id') or ''
   if id:creator[id]=r.get('name') or r.get('sort_name') or ''
 finally:f.close()
 art=[];scanned=0
 f,records=csvsource('art.csv')
 try:
  for r in records:
   scanned+=1
   if not good(r):continue
   id=str(r.get('ObjectID',''))
   if 'walters:'+id in exclude or id in cids or str(r.get('AccessionNumber')) in cacc:continue
   art.append(r)
 finally:f.close()
 art_ids={o['ObjectID'] for o in art}
 images={};source_media_rows=0
 f,records=csvsource('media.csv')
 try:
  for m in records:
   source_media_rows+=1
   id=m.get('ObjectID','')
   if id not in art_ids:continue
   if low(m.get('MediaType')) not in ('image',''):continue
   url=m.get('ImageURL','')
   if not url.startswith('https://art.thewalters.org/images/raw/'):continue
   primary=low(m.get('IsPrimary')) in ('1','true')
   if id not in images or primary and not images[id]['primary']:
    images[id]={'url':url,'primary':primary,'mediaView':m.get('MediaView')}
 finally:f.close()
 queue=[]
 for o in art:
  id=o['ObjectID']
  if id not in images:continue
  c=[creator.get(i,'') for i in re.split(r'[\|,;]',o.get('Creators') or '')]
  name='; '.join(i for i in c if i)
  if any(k in low(name) for k in ('el greco','fra angelico')):continue
  queue.append({'id':'walters:'+id,'objectId':id,'accession':o.get('AccessionNumber'),
   'title':o['Title'],'artist':name,'medium':o.get('Medium'),
   'start':o.get('DateBeginYear'),'end':o.get('DateEndYear'),
   'objectUrl':o.get('ResourceURL') or 'https://purl.thewalters.org/art/'+str(o.get('AccessionNumber'))+'/',
   'previewURL':images[id]['url'],'museum':'The Walters Art Museum'})
 queue.sort(key=rank)
 result=[];errors=[];checked=0;seen_urls=set()
 for x in queue:
  if len(result)>=args.target or checked>=args.max_checks:break
  if x['previewURL'] in seen_urls:continue
  checked+=1
  ok,reason=image_check(x['previewURL'])
  if not ok:
   errors.append({'id':x['id'],'error':reason,'stage':'PREVIEW'})
   continue
  seen_urls.add(x['previewURL'])
  result.append({'id':x['id'],'provider':'Walters','sourceInstitution':x['museum'],
   'objectId':x['objectId'],'accession':x['accession'],'title':x['title'],
   'artist':x['artist'],'medium':x['medium'],'date':x['start'],
   'objectUrl':x['objectUrl'],'previewURL':x['previewURL'],
   'rightsBasis':'WALTERS_OPEN_DATA_IMAGE_PUBLIC_DOMAIN_POLICY__EXACT_RIGHTS_QA_PENDING',
   'rightsHold':True,'editorialSelection':None,'productionImported':False})
  time.sleep(args.delay)
 assert not ({x['id'] for x in result}&exclude)
 assert len(result)==len({x['id'] for x in result})==len({x['previewURL'] for x in result})
 doc={'schema':'AO_SACRED_ART_WALTERS_B6_250_MUSEUM_IMAGES_V1','date':'2026-10-29',
  'batchId':'B6','targetSize':args.target,'batchReady':len(result)>=200,
  'counts':{'newReviewablePaintings':len(result),'WaltersObjectsScanned':scanned,
   'paintingCandidateRecords':len(art),'imageLinkedCandidates':len(queue),
   'mediaRowsScanned':source_media_rows,'imageHeadersChecked':checked,
   'imageAccessProblems':len(errors),'previous633AndOriginal60Excluded':683,
   'preservedCanonical383':True,'newUserApprovals':0,'newUserRejections':0,
   'productionImports':0},
  'gates':{'officialMuseumArtAndMediaJoin':True,'noNewReuseOfPriorReviewIDs':True,
   'wholeObjectImageExactURL':True,'previewJpegHeadersVerified':True,
   'originalPhotoFilesDownloadedAndStored':0,'strictProductionImageRightsHeld':True,
   'notAutomaticallyApproved':True,'noPhotoNativeQualityGateYet':True},
  'errors':errors[:100],'rows':result}
 OUT.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 REPORT.write_text('# Sacred Art B6 — Walters source provenance and review\n\n'
  '- New reviewable paintings **'+str(len(result))+'**, target '+str(args.target)+'.\n'
  '- Exact artworks from Walters official art.csv + official media.csv + creators.csv.\n'
  '- Per-work source image valid JPEG checks: '+str(checked)+'; errors '+str(len(errors))+'.\n'
  '- No overlap with B3 250, B4R 123, B5R 250 and completed first 60 = **683 excluded**.\n'
  '- Walters default CC0 image policy subject to exceptions: **hold production photo rights** pending individual review.\n'
  '- No native source images downloaded, no corrections/ratings/imports inferred; cost €0.\n',encoding='utf8')
 print(json.dumps({'counts':doc['counts'],'ready':doc['batchReady'],
  'sample':[(x['id'],x['title'],x['artist']) for x in result[:8]],
  'errorSample':errors[:5]},ensure_ascii=False)[:4200])
if __name__=='__main__':main()
