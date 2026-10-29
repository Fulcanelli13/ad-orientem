#!/usr/bin/env python3
"""Ad Orientem Batch B4: exact public-domain MET painting intake, 250 research cards.

Uses the official 2026 v1.1 collection API search, v1 detailed objects, museum's
isPublicDomain, classification Paintings, primaryImageSmall and 16-byte JPEG response.
No image originals stored. Never recycles B3 or first finalized 60, and prevents
existing MET 383-canonical identities from being falsely treated as newly discovered.
"""
from __future__ import annotations
import argparse,json,re,time,urllib.parse,urllib.request
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
B3=D/'sacred-art-250-review-source-b3-20261029.v1.json'
PRIOR=D/'sacred-art-20261029-user-60-import-reject-ledger.v1.json'
CANON=D/'sacred-art-curator-queues-383-20261029.v1.json'
OUTPUT=D/'sacred-art-met-250-b4-20261029.v1.json'
REPORT=ROOT/'docs/SACRED_ART_MET_250_B4_SOURCE_REPORT_20261029.md'
HOST='https://collectionapi.metmuseum.org/public/collection/'
MET_IMG='https://images.metmuseum.org/'
UA='AdOrientem-MET-OpenAccess-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
TERMS=[
'Crucifixion','Christ','Saint Jerome','Saint Mary Magdalene','Magdalene',
'Saint Peter','Saint John','Saint Paul','Saint Joseph','Saint Francis',
'Annunciation','Deposition','Ecce Homo','Holy Family','The Virgin',
'Virgin and Child','Saint Sebastian','Saint Catherine','Saint Teresa',
'Adoration of the Magi','Adoration of the Shepherds','Nativity',
'Baptism of Christ','Resurrection','Lamentation','The Virgin and Child',
'Madonna and Child','Christ Carrying the Cross','Saint Andrew',
'The Assumption','Saint Augustine','Saint Agnes','Saint Lucy',
'The Ascension','The Transfiguration','Saint Dominic','Saint Benedict',
'John the Baptist','The Last Supper','The Pieta','Sacred Heart','Saint Ambrose',
'Saint Gregory','Saint Stephen','Saint Anthony','Saint Michael',
'The Visitation','Holy Trinity','Saint Christopher','Saint Philip',
'The Holy Family','The Madonna','Saints','The Baptism','Adoration',
'Christ and the Virgin','Saint Nicholas','Saint Margaret','Saint Barbara',
'The Virgin Mary','The Crucifixion','Saint',
]
FAV=('rubens','van dyck','champaigne','caravaggio','ribera','zurbar',
'murillo','carracci','preti','solimena','guido reni','luca giordano',
'vouet','la tour','jordaens','guercino','gentileschi','tiepolo',
'tintoretto','cavallino','strozzi','poussin','veronese','lanfranco',
'giordano','cossiers','velazquez','velázquez','rigaud',
'boucher','le brun','batoni','mattia','preti','reni','dolci','cavedone')
RELEVANT=('christ','virgin','madonna','mary','maria','saint','sainte','st. ',
'jesus','holy','annunciat','nativity','adoration','crucifix','resurrection',
'resurrect','baptism','pentecost','ascension','assumption','pieta',
'magdalen','john the baptist','angels','archangel','the trinity','ecce homo',
'deposition','lamentation','supper at emmaus','transfiguration','apostle',
'martyr','immaculate conception','the visitation','sacred heart','saints',
'holy family')
BAD_TITLE=('saint peter square','saint peter basilica','saint petersburg',
'saint-cloud','saint tropez','st. louis','saint-germain','mount saint',
'portrait of saint louis king of france','view of the','landscape with the castle',
'church of saint','cathedral of saint','church at','saint paul city')
BAD_ARTIST=('el greco','fra angelico')
def low(x):return re.sub(r'\s+',' ',str(x or '').strip()).lower()
def req(url,timeout=17,image=False):
 u=urllib.parse.urlparse(url)
 if u.scheme!='https' or u.hostname not in ('collectionapi.metmuseum.org','images.metmuseum.org'):
  raise ValueError('UNKNOWN_ARTWORK_SOURCE')
 if image and u.hostname!='images.metmuseum.org':raise ValueError('UNKNOWN_IMAGE_SOURCE')
 h={'User-Agent':UA,'Accept':'image/jpeg' if image else 'application/json'}
 if image:h['Range']='bytes=0-15'
 request=urllib.request.Request(url,headers=h)
 with urllib.request.urlopen(request,timeout=timeout) as r:
  if image:return r.status,r.headers.get('Content-Type',''),r.read(16)
  b=r.read(1300000)
 return json.loads(b.decode('utf8'))
def good(d):
 if d.get('isPublicDomain') is not True:return False
 if low(d.get('classification'))!='paintings':return False
 t=low(d.get('title'));medium=low(d.get('medium'))
 if not any(z in t for z in RELEVANT) or any(z in t for z in BAD_TITLE):return False
 if any(z in low(d.get('artistDisplayName')) for z in BAD_ARTIST):return False
 if not any(z in medium for z in ('oil on','tempera on','tempera transferred',
    'oil and tempera on','distemper on','oil,','oil paint on')):return False
 if any(z in medium for z in ('ink on','vellum','parchment','manuscript','print','engraving',
    'fresco fragment','chalk on')):return False
 im=d.get('primaryImageSmall') or ''
 if not im.startswith(MET_IMG) or '.jpg' not in im.lower():return False
 return True
def score(d):
 artist=low(d.get('artistDisplayName'))
 year=int(d.get('objectBeginDate') or 0)
 medium=low(d.get('medium'))
 return (0 if any(a in artist for a in FAV) else 1,
  0 if 1550<=year<=1825 else 1 if 1450<=year<=1900 else 2,
  0 if 'oil on canvas' in medium else 1,
  0 if d.get('isHighlight') else 1,
  low(d.get('title')),int(d['objectID']))
def image_valid(url):
 try:
  status,ctype,head=req(url,18,image=True)
  return status in (200,206) and ctype.startswith('image/') and head.startswith(bytes.fromhex('ffd8')),\
    str(status)+' '+ctype
 except Exception as e:return False,type(e).__name__+': '+str(e)[:120]
def main():
 p=argparse.ArgumentParser()
 p.add_argument('--target',type=int,default=250)
 p.add_argument('--max-object-lookups',type=int,default=1550)
 p.add_argument('--max-matches',type=int,default=600)
 p.add_argument('--max-preview-checks',type=int,default=550)
 p.add_argument('--delay',type=float,default=.08)
 a=p.parse_args()
 assert 200<=a.target<=300 and 500<=a.max_object_lookups<=2200
 b3=json.loads(B3.read_text(encoding='utf8'));prior=json.loads(PRIOR.read_text(encoding='utf8'))
 canon=json.loads(CANON.read_text(encoding='utf8'))
 assert len(b3['rows'])==250 and prior['sourceRecordCount']==60 and len(canon['main_records'])==383
 priorids={x['id'] for x in b3['rows']}|{x['sourceId'] for n in ('imports','rejects') for x in prior[n]}
 assert len(priorids)==310
 canonicalMET=set()
 for x in canon['main_records']:
  for txt in (x.get('artwork_id'),x.get('source_page'),x.get('source_url')):
   s=str(txt or '')
   for pattern in (r'(?i)^met-(\d+)$',r'metmuseum\.org/art/collection/search/(\d+)',
                   r'collectionapi\.metmuseum\.org/public/collection/v1/objects/(\d+)'):
    y=re.search(pattern,s)
    if y:canonicalMET.add(int(y.group(1)))
 candidates=[];seen=set();searchlog=[];errors=[]
 for q in TERMS:
  params={'q':q,'title':'true','departmentId':'11','hasImages':'true','offset':'0','limit':'500'}
  u=HOST+'v1.1/search?'+urllib.parse.urlencode(params)
  try:
   data=req(u)
   ids=data.get('objectIDs') or []
   n=0
   for id in ids:
    if not isinstance(id,int) or id in seen or id in canonicalMET or 'met:'+str(id) in priorids:continue
    seen.add(id);candidates.append(id);n+=1
   searchlog.append({'query':q,'total':data.get('total'),'firstPageIds':len(ids),'newIds':n})
  except Exception as e:errors.append({'stage':'SEARCH','query':q,'error':type(e).__name__+': '+str(e)[:155]})
  if len(candidates)>=a.max_object_lookups:break
  time.sleep(a.delay)
 detail=[];lookup=0
 for id in candidates[:a.max_object_lookups]:
  if len(detail)>=a.max_matches:break
  lookup+=1
  try:
   d=req(HOST+'v1/objects/'+str(id))
   if d.get('objectID')!=id or not good(d):continue
   detail.append(d)
  except Exception as e:errors.append({'stage':'OBJECT','id':id,'error':type(e).__name__+': '+str(e)[:135]})
  time.sleep(a.delay)
 detail.sort(key=score)
 result=[];checked=0
 for d in detail:
  if len(result)>=a.target or checked>=a.max_preview_checks:break
  checked+=1
  preview=d['primaryImageSmall']
  ok,why=image_valid(preview)
  if not ok:
   errors.append({'stage':'IMAGE_PREVIEW','id':d['objectID'],'error':why})
   continue
  result.append({'id':'met:'+str(d['objectID']),'provider':'MetMuseum',
    'museum':'The Metropolitan Museum of Art','objectId':str(d['objectID']),
    'accession':d.get('accessionNumber'),'title':d.get('title'),
    'artist':d.get('artistDisplayName') or d.get('artistDisplayBio') or '',
    'date':d.get('objectDate'),'medium':d.get('medium'),
    'objectUrl':d.get('objectURL') or 'https://www.metmuseum.org/art/collection/search/'+str(d['objectID']),
    'previewURL':preview,'fullOriginalSourceURL':d.get('primaryImage'),
    'rightsBasis':'MET_IS_PUBLIC_DOMAIN_TRUE_EXACT_SOURCE_OBJECT_AND_IMAGE',
    'rightsForProduction':'MET_CC0_PUBLIC_DOMAIN__NATIVE_QA_AND_PROVENANCE_PENDING',
    'aestheticGrade':None,'editorialSelection':None,'productionImported':False})
  time.sleep(a.delay)
 ids={x['id'] for x in result}
 assert len(ids)==len(result) and not ids&priorids
 payload={'schema':'AO_SACRED_ART_MET_B4_250_OFFICIAL_IMAGE_VERIFIED_V1','date':'2026-10-29',
  'batchId':'B4','targetSize':a.target,'batchReady':len(result)>=200,
  'source':'The Metropolitan Museum of Art official public Collection API v1.1, Open Access CC0',
  'counts':{'distinctImageVisiblePaintings':len(result),
   'metadataSearchTermsAttempted':len(searchlog),'candidateObjectIds':len(candidates),
   'detailLookups':lookup,'religiousPaintingMetadataMatches':len(detail),
   'previewJPEGsChecked':checked,'imagePreviewFailed':sum(x['stage']=='IMAGE_PREVIEW' for x in errors),
   'overlapWithB3_250AndPrior60':0,'previouslyCataloguedMetExcluded':len(canonicalMET),
   'newUserDecisions':0,'newProductionImports':0,'sourceFailures':len(errors)},
  'gates':{'isPublicDomainPerExactObject':True,'classificationPaintings':True,
     'materialPaintedSupport':True,'individualPreviewJPEGHeaderValidated':True,
     'noImageOriginalsArchived':True,'noB3OrPrior60MetadataChanged':True,
     'noAestheticGradeAssigned':True,'productionSourceQualityCertified':False},
  'searchLog':searchlog,'errors':errors[:180],'rows':result}
 OUTPUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 REPORT.write_text('# Sacred Art — MET Batch 4\n\n'
 '- Verified reviewable painting previews: **'+str(len(result))+'** (target '+str(a.target)+').\n'
 '- Source: official Met v1.1 title searches and object records, public domain flags, exact JPEG checks.\n'
 '- Distinct from 250 Batch 3 and earlier finalized 60. Existing canonical Met IDs also excluded.\n'
 '- **No** native source originals saved, no automatic aesthetic grade, no user rejected works re-offered.\n'
 '- Native photo fidelity, frame and mobile crop must be evaluated after editorial choices.\n'
 '- Cost: €0.\n',encoding='utf8')
 print(json.dumps({'counts':payload['counts'],'batchReady':payload['batchReady'],
   'sample':[(r['id'],r['title'],r['artist']) for r in result[:6]],
   'errorExamples':errors[:5]},ensure_ascii=False)[:4500])
if __name__=='__main__':main()
