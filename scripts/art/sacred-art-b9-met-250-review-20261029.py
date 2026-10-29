#!/usr/bin/env python3
"""B9: large-scale 250-work sacred paintings review from the Met Open Access API.

Research-only: no artwork is licensed by inference, approved, downloaded at
native resolution, or imported into production. Exact source IDs for all 1260
earlier review cards are excluded, preserving every human choice.
"""
from __future__ import annotations
import concurrent.futures, hashlib, json, re, time, urllib.parse, urllib.request, urllib.error
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
DATA=ROOT/'data/calendar'
OUT=DATA/'sacred-art-b9-met-250-review-source-20261029.v1.json'
HTML=ROOT/'docs/SACRED_ART_MET_250_IMPORT_REVIEW_B9_20261029.html'
QA=ROOT/'docs/SACRED_ART_B9_MET_SOURCE_AND_DUPLICATE_QA_20261029.md'
API='https://collectionapi.metmuseum.org/public/collection'
UA='AdOrientem-SacredArtResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
QUERIES=(
 'Crucifixion','Christ','Jesus','Madonna','Virgin','Holy Family',
 'Annunciation','Adoration','Nativity','Pieta','Deposition','Lamentation',
 'Entombment','Resurrection','Transfiguration','Ascension','Pentecost',
 'Ecce Homo','Agony in the Garden','Christ Carrying the Cross',
 'Last Supper','Supper at Emmaus','Flight into Egypt','Presentation in the Temple',
 'Baptism','Saint','St.','Apostle','Evangelist','Magdalene',
 'Saint Sebastian','Saint Catherine','Saint Francis','Saint Jerome',
 'Saint Joseph','Saint Peter','Saint Paul','Saint John','Saint Anthony',
 'Saint Gregory','Saint Agnes','Saint Ursula','Saint Benedict','Saint Dominic',
 'Saint Teresa','Saint Francis Xavier','Saint George','Saint Nicholas',
 'John the Baptist','The Visitation','Immaculate Conception',
 'Assumption','Sacred Heart','Coronation of the Virgin',
 'Abraham','Moses','David','Judith','Susanna','Tobit','Tobias',
 'Prodigal Son','Good Samaritan','Sacrifice of Isaac','Creation of Adam',
 'Adam and Eve','Daniel','Elijah','Solomon','Esther','Isaac',
 'Apocalypse','Revelation','Last Judgment','Holy Trinity'
)
FAVORITE=(
 'rubens','van dyck','murillo','ribera','strozzi','jordaens','caravaggio',
 'champaigne','guercino','carracci','zurbar','tintoretto','veronese',
 'giordano','fetti','reni','velazquez','tiepolo','cavallino','salvator rosa',
 'rembrandt','ter brugghen','gerrit van honthorst','guido reni',
 'govert flinck','pieter lastman','frans hals','sassofer','dou',
 'hans memling','giovanni battista gaulli','barocci','poussin',
 'annibale','guercino','philippe','van oost','jan boeckhorst',
 'alessandro magnasco','lorenzo lotto','van der weyden','fra bartolomeo',
 'pietro da cortona','georges de la tour','matthias stom',
 'luca giordano','federico barocci','giovanni lanfranco','correggio',
 'boltraffio','bartolomé','strozzi','borghese','domenichino','titian',
 'fra filippo lippi','hans holbein','valentin de boulogne'
)
BANNED_ARTISTS=('el greco','fra angelico')
# These are human names, geography, architectural studies and devotional
# objects that must not enter a *painting* collection just because "Saint"
# or "Christ" appears in a generic search result.
NEG_TITLE=(
 'portrait of','view of','church interior','interior of','study for a church',
 'saint petersburg','saint peters','saint mark’s square','saint mark s square',
 'saint-cloud','st. cloud','saint-quentin','christian iv','christian v ',
 'christian vi','christian vii','christian viii','christopher','christina ',
 'saint paul de vence','saint malo','saint marys river','saint-mary',
 'landscape near saint','village of saint','the city of saint',
 'the church of saint','in the church of','church of saint',
 'the cathedral of saint','portrait of the artist',
 'princess','duchess','duke of','prince of','king of','queen of',
 'countess','count of','baron','cardinal portrait','family portrait',
 'saint-denis','st. denis','saint genevieve mountain',
 'st. george street','chapel of','monastery of','abbey of'
)
# Guard title meaning with word boundaries and distinctive devotional
# subjects, avoiding artists named Christian, Maria, Francis etc.
PATTERNS=tuple(re.compile(x,re.I) for x in (
 r'\bchrist\b',r'\bjesus\b',r'\bcrucifixion\b',r'\bmadonna\b',
 r'\bvirgin and child\b',r'\bvirgin mary\b',r'\bblessed virgin\b',
 r'\bholy family\b',r'\bannunciation\b',r'\badoration\b',
 r'\bnativity\b',r'\bpiet[aà]\b',r'\bdeposition\b',
 r'\blamentation\b',r'\bentombment\b',r'\bresurrection\b',
 r'\btransfiguration\b',r'\bascension\b',r'\bpentecost\b',
 r'\becce homo\b',r'\bagony in\b',r'\blast supper\b',
 r'\bemmaus\b',r'\bflight into egypt\b',r'\bvisitation\b',
 r'\bimmaculate conception\b',r'\bassumption of the virgin\b',
 r'\bcoronation of the virgin\b',r'\bsacred heart\b',
 r'\badoration of the\b',r'\bthe magi\b',r'\bshepherds\b',
 r'\bsaint(?:s)?\s+[a-z]+\b',r'\bst\.\s*[a-z]+\b',
 r'\bapostle\b',r'\bapostles\b',r'\bevangelist\b',
 r'\bmagdalen(?:e)?\b',r'\bjohn the baptist\b',
 r'\bpatmos\b',r'\bmoses\b',r'\babraham\b',r'\bisaac\b',
 r'\bjudith\b',r'\bsusanna\b',r'\btobias\b',r'\btobit\b',
 r'\bthe good samaritan\b',r'\bprodigal son\b',
 r'\bthe sacrifice of\b',r'\bthe sacrifice of isaac\b',
 r'\bdavid and (?:goliath|abigail|saul)\b',r'\bking david\b',
 r'\bdaniel in the\b',r'\bthe prophet elijah\b',
 r'\belijah\b',r'\bsamson\b',r'\bthe holy trinity\b',
 r'\bthe trinity\b',r'\bthe last judgment\b',
 r'\badam and eve\b',r'\bcain and abel\b',r'\bnoah\b',
 r'\bhagar and ishmael\b',r'\bsaint peter\b'
))
def norm(x):return re.sub(r'[^a-z0-9]+',' ',str(x or '').lower()).strip()
def http_json(url,timeout=35,maxbytes=2500000):
 p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname!='collectionapi.metmuseum.org' or not p.path.startswith('/public/collection/'):
  raise ValueError('MET_API_HOST_NOT_ALLOWED')
 req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json'})
 for retry in range(3):
  try:
   with urllib.request.urlopen(req,timeout=timeout) as r:
    raw=r.read(maxbytes+1)
   if len(raw)>maxbytes:raise ValueError('MET_RESPONSE_TOO_LARGE')
   return json.loads(raw)
  except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError) as e:
   if isinstance(e,urllib.error.HTTPError) and e.code in (400,404):raise
   if retry==2:raise
   time.sleep(1.5*(retry+1))
def prior_ids():
 old=json.loads((DATA/'sacred-art-20261029-user-60-import-reject-ledger.v1.json').read_text())
 prior={z['sourceId'] for k in ('imports','rejects') for z in old[k]}
 sources=[
 ('B3','sacred-art-250-review-source-b3-20261029.v1.json',250),
 ('B4R','sacred-art-b4-multimuseum-working-review-20261029.v1.json',123),
 ('B5R','sacred-art-nga-open-250-b5r-20261029.v1.json',250),
 ('B6','sacred-art-walters-250-b6-20261029.v1.json',250),
 ('B7','sacred-art-b7-official-museum-candidates-20261029.v1.json',231),
 ('B8','sacred-art-b8-smk-250-source-20261029.v1.json',96)]
 assert len(prior)==60
 summary={'original60':60}
 for batch,path,count in sources:
  d=json.loads((DATA/path).read_text());rows=d['rows']
  ids={r['id'] for r in rows}
  assert len(ids)==len(rows)==count,(batch,len(ids),len(rows))
  assert not ids&prior,('prior review overlap',batch)
  prior|=ids;summary[batch]=count
 assert len(prior)==1260,(len(prior),summary)
 return prior,summary
def search_ids():
 ids=[];seen=set();counts={};err=[]
 for term in QUERIES:
  q={'q':term,'departmentId':'11','hasImages':'true','title':'true','limit':'500','offset':'0'}
  url=API+'/v1.1/search?'+urllib.parse.urlencode(q)
  try:
   d=http_json(url,maxbytes=3000000)
   items=d.get('objectIDs') or []
   if isinstance(items,list):
    counts[term]={'total':d.get('total',len(items)),'fetched':len(items)}
    for id in items:
     if isinstance(id,int) and id not in seen:seen.add(id);ids.append(id)
   else:err.append({'term':term,'message':'objectIDs absent'})
  except Exception as e:
   err.append({'term':term,'error':type(e).__name__+': '+str(e)[:120]})
  time.sleep(.07)
 return ids,counts,err
def object_one(objectid):
 try:
  d=http_json(API+'/v1/objects/'+str(objectid),timeout=20,maxbytes=500000)
  return d,None
 except Exception as e:return None,type(e).__name__+': '+str(e)[:120]
def is_sacred(d):
 t=str(d.get('title') or '')
 low=t.lower().replace('’',"'")
 if not t or any(z in low for z in NEG_TITLE):return False
 if re.search(r'\bsaint\s+(?:cloud|germain|denis|gallen|malo|tropez|petersburg)\b',low):return False
 if not any(p.search(t) for p in PATTERNS):return False
 # Generic "St. Michael's School" etc is not an image of the saint.
 if re.search(r'\b(?:church|chapel|abbey|cathedral|basilica|town|village)\b',low) and not re.search(r'\b(?:saint|christ|madonna)\b.*\b(?:martyr|adoring|praying|blessing|crucified)\b',low):
  return False
 return True
def eligible(d):
 if not isinstance(d,dict) or d.get('isPublicDomain') is not True:return False
 if d.get('department')!='European Paintings':return False
 if str(d.get('objectName') or '').lower() not in ('painting','panel painting'):return False
 if 'painting' not in str(d.get('classification') or 'Paintings').lower():return False
 medium=str(d.get('medium') or '').lower()
 if not any(x in medium for x in ('oil on','tempera on','oil and tempera','oil, tempera','fresco')):return False
 if any(x in medium for x in ('photograph','etching','engraving','lithograph','watercolor','drawing','stained glass')):return False
 y=int(d.get('objectBeginDate') or 0)
 if y and (y<1290 or y>1899):return False
 artist=str(d.get('artistDisplayName') or '').lower()
 if any(x in artist for x in BANNED_ARTISTS):return False
 if not is_sacred(d):return False
 p=str(d.get('primaryImage') or '')
 s=str(d.get('primaryImageSmall') or '')
 if not p.startswith('https://images.metmuseum.org/CRDImages/') or not s.startswith('https://images.metmuseum.org/CRDImages/'):return False
 if urllib.parse.urlparse(p).hostname!='images.metmuseum.org':return False
 if urllib.parse.urlparse(s).hostname!='images.metmuseum.org':return False
 return True
def priority(d):
 artist=str(d.get('artistDisplayName') or '').lower()
 t=str(d.get('title') or '').lower()
 y=int(d.get('objectBeginDate') or 0)
 return (0 if any(a in artist for a in FAVORITE) else 1,
         0 if 1575<=y<=1750 else 1 if 1450<=y<=1850 else 2,
         0 if str(d.get('medium') or '').lower().startswith('oil') else 1,
         0 if d.get('isHighlight') else 1,
         0 if any(z in t for z in ('christ','crucifix','saint','madonna','virgin','mary')) else 1,
         t,int(d['objectID']))
def previewcheck(d):
 url=d['primaryImageSmall']
 try:
  if urllib.parse.urlparse(url).hostname!='images.metmuseum.org':return False,'UNTRUSTED_URL'
  req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'image/jpeg','Range':'bytes=0-32'})
  with urllib.request.urlopen(req,timeout=19) as r:
   magic=r.read(16)
   status=r.status
  return magic.startswith(bytes.fromhex('ffd8')),str(status)
 except Exception as e:return False,type(e).__name__+': '+str(e)[:90]
def make_gallery(rows):
 h=(ROOT/'docs/SACRED_ART_SMK_96_IMPORT_REVIEW_B8_20261029.html').read_text()
 digest=hashlib.sha256(json.dumps([x['id'] for x in rows],separators=(',',':')).encode()).hexdigest()
 safe=json.dumps(rows,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
 h,n=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script><script>)',
  lambda m:m.group(1)+safe+m.group(2),h,count=1,flags=re.S)
 assert n==1
 h,n=re.subn(r'const batchHash="[0-9a-f]+";',
             lambda m:'const batchHash="'+digest+'";',h,count=1)
 assert n==1
 h=h.replace('SMK Sacred Art · Batch 8 (96)','Metropolitan Sacred Art · Batch 9 ('+str(len(rows))+')')
 h=h.replace('SMK National Gallery of Denmark · Batch 8',
             'The Metropolitan Museum of Art · Batch 9')
 h,n=re.subn(r'<select id="museum"[^>]*>.*?</select>',
  '<select id="museum" aria-label="Museum"><option value="all">All paintings</option><option value="Met">The Metropolitan Museum of Art</option></select>',
  h,count=1,flags=re.S)
 assert n==1
 h=h.replace("batchId:'B8'","batchId:'B9'")
 h=h.replace('ao-sacred-art-b8-smk-import-','ao-sacred-art-b9-met-import-')
 h=h.replace('ad-orientem-sacred-art-b8-smk-','ad-orientem-sacred-art-b9-met-')
 h=h.replace('No changes to the 107 historic approvals or rating archive.',
             'Earlier human decisions remain frozen. Batch 9 is research-only.')
 assert "batchId:'B9'" in h and 'const PAGE_SIZE=50;' in h
 HTML.write_text(h)
 return digest
def main():
 prior,previous=prior_ids()
 ids,search_counts,search_errors=search_ids()
 print('MET_SEARCH',json.dumps({'uniqueIds':len(ids),'queries':len(search_counts),'errors':search_errors[:10]},ensure_ascii=False),flush=True)
 if len(ids)<350:raise RuntimeError('MET_SEARCH_TOO_SMALL: '+str(len(ids)))
 records=[];fetch_errors=[];processed=0;excluded=Counter()
 # Search returns title-matched object IDs. Resolve source metadata in
 # moderate bounded groups; reach a surplus so image failures can be skipped.
 for offset in range(0,min(len(ids),3000),70):
  chunk=[k for k in ids[offset:offset+70] if 'met:'+str(k) not in prior]
  excluded['priorIDs']+=len(ids[offset:offset+70])-len(chunk)
  with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
   result=list(pool.map(object_one,chunk))
  for id,(d,e) in zip(chunk,result):
   if e:
    fetch_errors.append({'objectID':id,'error':e})
   elif eligible(d):
    records.append(d)
   else:
    excluded['ineligible']+=1
  processed+=len(chunk)
  if len(records)>=450:break
  if offset%350==0:
   print('MET_FETCH_PROGRESS',json.dumps({'processed':processed,'eligibles':len(records),'errors':len(fetch_errors)}),flush=True)
  time.sleep(.2)
 if len(records)<250:print('MET_UNDERSUPPLY',len(records),flush=True)
 records.sort(key=priority)
 distinct=[];seen_ident=set()
 for r in records:
  identity=(norm(r.get('title')),norm(r.get('artistDisplayName')))
  if identity in seen_ident:continue
  seen_ident.add(identity);distinct.append(r)
 tocheck=distinct[:425]
 with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
  checks=list(pool.map(previewcheck,tocheck))
 selected=[];preview_errors=[]
 for d,(ok,why) in zip(tocheck,checks):
  if not ok:
   preview_errors.append({'objectID':d['objectID'],'reason':why});continue
  oid=int(d['objectID']);id='met:'+str(oid)
  assert id not in prior
  selected.append({'id':id,'provider':'Met','sourceInstitution':'The Metropolitan Museum of Art, New York',
    'objectId':str(oid),'accession':d.get('accessionNumber') or str(oid),
    'title':d.get('title'),'artist':d.get('artistDisplayName') or 'Unattributed',
    'medium':d.get('medium'),'date':d.get('objectDate'),'objectUrl':d.get('objectURL') or 'https://www.metmuseum.org/art/collection/search/'+str(oid),
    'previewURL':d.get('primaryImageSmall'),'nativeImageURL':d.get('primaryImage'),
    'sourceRights':'MET_PUBLIC_DOMAIN_TRUE_OPEN_ACCESS_CC0','imageRightsVerified':True,
    'rightsConflict':None,'productionOriginalImageQA':False,'productionImported':False})
  if len(selected)==250:break
 digest=make_gallery(selected) if selected else None
 summary={'schema':'AO_SACRED_ART_MET_250_B9_SOURCE_V1','date':'2026-10-29',
  'batchId':'B9','targetSize':250,'completeReviewSet':len(selected)==250,
  'counts':{'searchQueriesRun':len(search_counts),'uniqueSearchIDs':len(ids),
    'objectRecordsFetched':processed,'sourceEligibleObjects':len(records),
    'distinctTitleArtistCandidates':len(distinct),'previewChecks':len(tocheck),
    'previewFailures':len(preview_errors),'reviewableCards':len(selected),
    'previousReviewIDsExcluded':len(prior),'previousBatchBreakdown':previous,
    'sourceObjectsAlreadyReviewed':excluded['priorIDs'],
    'productionImports':0,'originalImageDownloads':0,'nativePhotoQAComplete':0},
  'queryCounts':search_counts,'searchErrors':search_errors[:30],
  'objectErrors':fetch_errors[:80],'imageErrors':preview_errors[:80],
  'selectionHash':digest,'rightsPolicy':'Per-object isPublicDomain=true with exact Met Open Access primaryImage and thumbnail URLs',
  'limits':'Metadata/preview validity, not aesthetic approval or native-resolution photo QA; user decides selection',
  'rows':selected}
 OUT.write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
 QA.write_text('# Sacred Art Batch 9 — Metropolitan Museum of Art\n\n'
  f"- Image-visible research cards: **{len(selected)}** of target 250.\n"
  f"- Source-title search: **{len(search_counts)}** queries, **{len(ids)}** distinct source IDs.\n"
  f"- Object records fetched **{processed}**, eligible sacred paintings **{len(records)}**.\n"
  f"- Met official CC0 isPublicDomain=true required. Preview JPEG checks **{len(tocheck)}**, failures **{len(preview_errors)}**.\n"
  f"- Source IDs from prior batches excluded **{len(prior)}** ({previous}).\n"
  "- Provenance: Met museum object URLs, original image addresses, public domain flags; no third-party pictures.\n"
  "- No native source downloads, licence exceptions, user selections, production imports or fees.\n"
  "- Preview and metadata pass does not constitute an aesthetic judgment; inspect frame/crop, colour and full native resolution after user selection.\n"
  f"- Gallery source ID hash: {digest}\n",encoding='utf8')
 print('MET_B9_FINAL',json.dumps({'counts':summary['counts'],'hash':digest,
  'sample':[(r['title'],r['artist']) for r in selected[:18]],'imageErrors':preview_errors[:4]},ensure_ascii=False)[:9000],flush=True)
if __name__=='__main__':main()
