#!/usr/bin/env python3
"""B11: 250 new original oil/tempera sacred paintings, NGA Washington + Cleveland.

Sources: exact NGA published_images.openaccess=1 join and CMA exact per-object
share_license_status CC0; art photo preview actual JPEG bytes validated.
Previous 1705 mass-review cards, historical Rijks ratings, and the 57 prior
Cleveland initial cards are excluded. No originals or production changes.
"""
from __future__ import annotations
import concurrent.futures,csv,hashlib,importlib.util,io,json,re,time,urllib.parse,urllib.request,urllib.error
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
OUT=D/'sacred-art-b11-250-official-verified-20261029.v1.json'
HTML=ROOT/'docs/SACRED_ART_NEXT_250_IMPORT_REVIEW_B11_20261029.html'
QA=ROOT/'docs/SACRED_ART_B11_250_OFFICIAL_SOURCE_QA_20261029.md'
UA='AdOrientem-SacredArt-B11-OpenDataResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
CMA='https://openaccess-api.clevelandart.org/api/artworks/'
NGA='https://raw.githubusercontent.com/NationalGalleryOfArt/opendata/main/data/'
FAVORITES=('rubens','van dyck','dyck','murillo','ribera','caravaggio','champaigne','guercino',
 'strozzi','carracci','zurbar','reni','tintoretto','veronese','tiepolo',
 'jordaens','fetti','ter brugghen','poussin','rembrandt','solimena','cavallino',
 'luca giordano','frans francken','preti','lanfranco','de la tour','bol',
 'borghese','jacques stella','goltzius','barocci','botticelli','dolci',
 'federico barocci','van der werff','sebastiano ricci','martin de vos',
 'pieter lastman','domenichino','del sarto','giovanni battista','stom')
NEG_ARTIST=('el greco','fra angelico')
NEG_TITLE=('portrait of','portret van','interior of a church','view of church',
 'cathedral of','st. petersburg','saint petersburg','christopher columbus',
 'st. george island','saint cloud','queen marie','king christian',
 'christian vii','christian v ','christian iv','christina of','marie antoinette',
 'church at','landscape near church','st. peter s square','street in saint',
 'saint michael s church','saint mary s church','saint louis street')
STRONG=(r'\bchrist\b',r'\bjesus\b',r'\bcrucifixion\b',r'\bcrucified\b',
 r'\bmadonna\b',r'\bvirgin and child\b',r'\bvirgin mary\b',
 r'\bholy family\b',r'\bannunciation\b',r'\badoration\b',
 r'\bnativity\b',r'\bpiet[aà]\b',r'\bdeposition\b',r'\blamentation\b',
 r'\bentombment\b',r'\bresurrection\b',r'\btransfiguration\b',
 r'\bascension\b',r'\bpentecost\b',r'\becce homo\b',r'\bagony in\b',
 r'\blast supper\b',r'\bemmaus\b',r'\bflight into egypt\b',
 r'\bvisitation\b',r'\bimmaculate conception\b',r'\bassumption\b',
 r'\bcoronation of the virgin\b',r'\bsacred heart\b',r'\bholy trinity\b',
 r'\bthe magi\b',r'\bthe shepherds\b',r'\bmartyrdom of\b',
 r'\bsaints?\s+[a-z]+\b',r'\bst\.\s*[a-z]+\b',
 r'\bapostles?\b',r'\bevangelists?\b',r'\bmagdalen(?:e)?\b',
 r'\bjohn the baptist\b',r'\bmoses\b',r'\bpharaoh\b',
 r'\babraham and\b',r'\babraham (?:sacrificing|with|receiving|entertaining|dismissing|leaves|before)\b',
 r'\bthe sacrifice of isaac\b',r'\bisaac blessing\b',
 r'\bjudith (?:with|and|beheading)\b',r'\bsusanna and\b',
 r'\btobias and\b',r'\btobit and\b',r'\bthe good samaritan\b',
 r'\bprodigal son\b',r'\bdavid and (?:goliath|saul|abigail)\b',
 r'\bking david\b',r'\bdaniel in\b',r'\belijah\b',
 r'\bsamson and\b',r'\bthe trinity\b',r'\bthe last judgment\b',
 r'\badam and eve\b',r'\bthe fall of man\b',r'\bcain and abel\b',
 r'\bnoah\b',r'\bhagar and ishmael\b',r'\bsaint peter\b',
 r'\bthe holy women\b',r'\bsaint john\b',r'\bjerome\b',r'\bsaint sebastian\b',
 r'\bthe prophet\b',r'\bisraelites\b',r'\bsaint francis\b',
 r'\bsaint catherine\b',r'\bsaint anne\b',r'\bholy spirit\b')
PATTERNS=[re.compile(p,re.I) for p in STRONG]
def norm(s):return re.sub(r'[^a-z0-9]+',' ',str(s or '').lower()).strip()
def sacred(t):
 if not t:return False
 low=t.lower().replace('’',"'")
 if any(x in low for x in NEG_TITLE):return False
 if re.search(r'\b(?:duke|duchess|king of|queen of|prince of|princess of|countess|count of|village of|st\. petersburg|archbishop of|cardinal richelieu|city of|church of|the church|cath[eé]drale|interior of|view of)\b',low):return False
 if re.search(r'\b(?:christian name|christopher|christine|christina|st\. john street|st\. peter.s (?:river|square|church))\b',low):return False
 if re.search(r'\b(?:photograph|engrav|etching|lithograph|sketch)\b',low):return False
 if 'st. paul' in low and ('london' in low or 'cathedral' in low):return False
 return any(x.search(t) for x in PATTERNS)
def fetch(url,maxbytes=19000000):
 p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname not in ('openaccess-api.clevelandart.org','raw.githubusercontent.com'):
  raise ValueError('UNTRUSTED_SOURCE')
 req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json,text/csv'})
 for attempt in range(3):
  try:
   with urllib.request.urlopen(req,timeout=90) as res:
    body=res.read(maxbytes+1)
   if len(body)>maxbytes:raise ValueError('SOURCE_RESPONSE_LIMIT')
   return body
  except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError) as ex:
   if isinstance(ex,urllib.error.HTTPError) and ex.code in (400,404):raise
   if attempt==2:raise
   time.sleep(2*(attempt+1))
def old_ids():
 spec=importlib.util.spec_from_file_location('prev',ROOT/'scripts/art/sacred-art-b9-met-250-review-20261029.py')
 mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
 prev,breakdown=mod.prior_ids()
 for batch,path,count in [('B9','sacred-art-b9-met-250-review-source-20261029.v1.json',195),
    ('B10','sacred-art-b10-final-250-combined-20261029.v1.json',250)]:
  d=json.loads((D/path).read_text());ids={x['id'] for x in d['rows']}
  assert len(ids)==count and not ids&prev
  prev|=ids;breakdown[batch]=count
 assert len(prev)==1705,(len(prev),breakdown)
 # Check user B9 file ledger against source, preserving complete rejection semantics.
 led=json.loads((D/'sacred-art-b9-user-final-decisions-20261029.v1.json').read_text())
 source=json.loads((D/'sacred-art-b9-met-250-review-source-20261029.v1.json').read_text())
 assert led['completeBatch'] and led['counts']=={'IMPORT':63,'IMPORT_WITH_CORRECTIONS':3,'REJECT':129}
 srcids=[x['id'] for x in source['rows']]
 digest=hashlib.sha256(json.dumps(srcids,separators=(',',':')).encode()).hexdigest()
 assert led['batchSha256']==digest==source['selectionHash']
 picks=set(led['importSourceIds'])|{x['sourceId'] for x in led['importWithCorrections']}
 assert len(picks)==66 and picks<=set(srcids) and len(set(srcids)-picks)==129
 # Exclude first Cleveland public image preview group if it hasn't already
 # appeared among original 60 / B3-B10. Do not resurface them.
 oldcma=json.loads((D/'sacred-art-kmska-cleveland-first-review-20261029.v1.json').read_text())
 for row in oldcma.get('records',[]):
  provider=str(row.get('museum') or row.get('provider') or '').lower()
  if 'cleveland' in provider or str(row.get('id','')).startswith(('cma:','cleveland:')):
   for k in ('id','sourceId','sourceObjectId','objectId'):
    val=str(row.get(k) or '')
    if val.startswith(('cma:','cleveland:')):prev.add(val.replace('cleveland:','cma:'))
    elif val.isdigit():prev.add('cma:'+val)
 return prev,breakdown
def rowartist(r):
 creators=r.get('creators') or []
 if creators:
  creator=creators[0]
  if isinstance(creator,dict):
   return str(creator.get('description') or creator.get('name') or creator.get('name_in_original_language') or 'Unattributed')
 tags=r.get('artists_tags') or []
 if isinstance(tags,list) and tags:
  return str(tags[0].get('display_name') if isinstance(tags[0],dict) else tags[0])
 return 'Unattributed'
def year(r):
 try:return int(str(r.get('creation_date_earliest') or '0'))
 except:return 0
def cma_candidates(prior):
 rows=[];count=0;pages=0;total=0;rejected=Counter()
 while count<5000:
  url=CMA+'?'+urllib.parse.urlencode({'type':'Painting','limit':150,'skip':count,'has_image':1})+'&cc0'
  data=json.loads(fetch(url,maxbytes=18000000))
  r=data.get('data') or [];total=int((data.get('info') or {}).get('total') or 0)
  if not r:break
  pages+=1;count+=len(r)
  for o in r:
   sid='cma:'+str(o.get('id'))
   if sid in prior:rejected['previousID']+=1;continue
   if o.get('share_license_status')!='CC0' or o.get('type')!='Painting':continue
   t=str(o.get('title') or '');a=rowartist(o);m=str(o.get('technique') or '').lower()
   if not sacred(t):rejected['nonSacred']+=1;continue
   if any(x in a.lower() for x in NEG_ARTIST):continue
   if not any(x in m for x in ('oil','tempera','fresco','distemper')):continue
   if any(x in m for x in ('watercolor','lithograph','drawing','etching','engraving','gouache','acrylic','ink on')):continue
   y=year(o)
   if y and (y<1280 or y>1899):continue
   im=o.get('images') or {}
   web=im.get('web') or {};pr=im.get('print') or {};full=im.get('full') or {}
   src=str(web.get('url') or '');native=str(full.get('url') or pr.get('url') or '')
   if not src.startswith('https://openaccess-cdn.clevelandart.org/') or not native.startswith('https://openaccess-cdn.clevelandart.org/'):continue
   w=int(pr.get('width') or full.get('width') or 0);h=int(pr.get('height') or full.get('height') or 0)
   if min(w,h)<1250:continue
   rows.append({'id':sid,'provider':'CMA','sourceInstitution':'Cleveland Museum of Art',
    'objectId':str(o['id']),'accession':o.get('accession_number'),'title':t,
    'artist':a,'medium':o.get('technique'),'date':o.get('creation_date'),
    'year':y,'objectUrl':o.get('url') or 'https://www.clevelandart.org/art/'+str(o['accession_number']),
    'previewURL':src,'nativeImageURL':native,'nativeWidth':w,'nativeHeight':h,
    'sourceRights':'CMA_SHARE_LICENSE_STATUS_CC0_EXACT_OBJECT_OPENACCESS_CDN',
    'imageRightsVerified':True,'rightsConflict':None,
    'productionOriginalImageQA':False,'productionImported':False})
  print('B11_CMA_PAGE',json.dumps({'page':pages,'seen':count,'total':total,'sacredQualified':len(rows)}),flush=True)
  if count>=total:break
 return rows,{'API_total':total,'recordsRead':count,'pages':pages,'preexistingOrNonSacred':dict(rejected)}
def ngatable(name):
 url=NGA+name
 req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'text/csv','Accept-Encoding':'identity'})
 r=urllib.request.urlopen(req,timeout=110)
 return r,csv.DictReader(io.TextIOWrapper(r,encoding='utf-8-sig',newline=''))
def nga_candidates(prior):
 images={};img_rows=0;rights_excluded=0
 fh,rows=ngatable('published_images.csv')
 try:
  for x in rows:
   img_rows+=1
   if str(x.get('openaccess') or '').lower() not in ('1','true'):rights_excluded+=1;continue
   if str(x.get('viewtype') or '').lower() not in ('primary',''):continue
   key=str(x.get('depictstmsobjectid') or '')
   base=str(x.get('iiifURL') or '')
   p=urllib.parse.urlparse(base)
   if not key.isdigit() or key in images:continue
   if p.scheme!='https' or p.hostname!='api.nga.gov' or not re.fullmatch(r'/iiif/[A-Za-z0-9-]{12,80}/?',p.path):continue
   images[key]={'base':base.rstrip('/'),'uuid':x.get('uuid')}
 finally:fh.close()
 rowsout=[];count=0
 fh,rows=ngatable('objects.csv')
 try:
  for r in rows:
   count+=1;key=str(r.get('objectID') or '')
   if not key.isdigit() or key not in images or 'nga:'+key in prior:continue
   if 'painting' not in str(r.get('classification') or '').lower():continue
   t=str(r.get('title') or '');a=str(r.get('attribution') or '');m=str(r.get('medium') or '').lower()
   if not sacred(t):continue
   if any(z in a.lower() for z in NEG_ARTIST):continue
   if not any(z in m for z in ('oil on','tempera on','distemper on','oil and tempera','fresco')):continue
   if any(z in m for z in ('watercolor','lithograph','ink on','print','etching','manuscript','engraving')):continue
   ys=str(r.get('beginYear') or '')
   y=int(ys) if ys.lstrip('-').isdigit() else 0
   if y and (y<1280 or y>1899):continue
   img=images[key];src=img['base']+'/full/!1000,1000/0/default.jpg'
   rowsout.append({'id':'nga:'+key,'provider':'NGA','sourceInstitution':'National Gallery of Art, Washington',
    'objectId':key,'accession':r.get('accessionNum'),'title':t,'artist':a,
    'medium':r.get('medium'),'date':r.get('displayDate'),'year':y,
    'objectUrl':'https://www.nga.gov/artworks/'+key,'previewURL':src,
    'nativeImageURL':img['base']+'/full/max/0/default.jpg','imageUUID':img['uuid'],
    'sourceRights':'NGA_EXACT_OBJECT_PUBLISHED_IMAGES_OPENACCESS_1',
    'imageRightsVerified':True,'rightsConflict':None,
    'productionOriginalImageQA':False,'productionImported':False})
 finally:fh.close()
 print('B11_NGA_INDEX',json.dumps({'objectRecords':count,'openImageRecords':len(images),'candidate':len(rowsout)}),flush=True)
 return rowsout,{'objectsRead':count,'imageRowsRead':img_rows,'publishedOpenImages':len(images),'restrictedImageRows':rights_excluded}
def score(x):
 a=x['artist'].lower();t=x['title'].lower();m=str(x['medium']).lower()
 y=int(x.get('year') or 0)
 return (0 if any(z in a for z in FAVORITES) else 1,
  0 if 1575<=y<=1750 else 1 if 1450<=y<=1850 else 2,
  0 if m.startswith('oil') else 1,
  0 if 'gold' not in m else 1,
  0 if any(z in t for z in ('christ','crucifix','saint','holy family','madonna','virgin','nativity')) else 1,
  t,x['id'])
def jpeg(r):
 url=r['previewURL'];p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname not in ('api.nga.gov','openaccess-cdn.clevelandart.org'):
  return False,'UNTRUSTED_IMAGE_URL'
 for attempt in range(2):
  try:
   req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'image/jpeg','Range':'bytes=0-20'})
   with urllib.request.urlopen(req,timeout=24) as resp:
    magic=resp.read(16)
    mime=str(resp.headers.get('Content-Type') or '').lower()
   return magic.startswith(bytes.fromhex('ffd8')) and mime.startswith('image/'),'HTTP_'+str(resp.status)
  except Exception as ex:
   if attempt==1:return False,type(ex).__name__+': '+str(ex)[:100]
   time.sleep(.45)
def gallery(rows,digest):
 h=(ROOT/'docs/SACRED_ART_NEXT_250_IMPORT_REVIEW_B10_20261029.html').read_text()
 data=json.dumps(rows,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
 h,n=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script><script>)',
   lambda m:m.group(1)+data+m.group(2),h,count=1,flags=re.S)
 assert n==1
 h,n=re.subn(r'const batchHash="[0-9a-f]+";',lambda m:'const batchHash="'+digest+'";',h,count=1)
 assert n==1
 h=re.sub(r'<title>.*?</title>','<title>Ad Orientem | Sacred Art Batch 11 ('+str(len(rows))+')</title>',h,count=1,flags=re.S)
 h=h.replace('Rijksmuseum + Metropolitan Museum of Art · Batch 10','Cleveland + National Gallery of Art · Batch 11')
 h,n=re.subn(r'<select id="museum"[^>]*>.*?</select>',
   '<select id="museum" aria-label="Museum"><option value="all">All paintings</option><option value="NGA">National Gallery of Art</option><option value="CMA">Cleveland Museum of Art</option></select>',
   h,count=1,flags=re.S)
 assert n==1
 h=h.replace("batchId:'B10'","batchId:'B11'")
 h=h.replace("ao-sacred-art-b10-import-","ao-sacred-art-b11-import-")
 h=h.replace("ad-orientem-sacred-art-b10-","ad-orientem-sacred-art-b11-")
 assert "batchId:'B11'" in h and 'const PAGE_SIZE=50;' in h
 HTML.write_text(h,encoding='utf8')
def main():
 prior,breakdown=old_ids()
 cma,cmameta=cma_candidates(prior)
 nga,ngameta=nga_candidates(prior)
 print('B11_SOURCE_CANDIDATES',json.dumps({'cma':len(cma),'nga':len(nga),'prior':len(prior)}),flush=True)
 candidate=[*cma,*nga]
 candidate.sort(key=score)
 unique=[];seenArt=set();seenID=set()
 for x in candidate:
  sid=x['id']
  if sid in prior or sid in seenID:continue
  sig=(norm(x['title']),norm(x['artist']))
  if sig in seenArt and norm(x['artist']) not in ('unknown','unattributed','anonymous'):continue
  seenArt.add(sig);seenID.add(sid);unique.append(x)
 checked=0;imagesBad=[];selected=[];seenUrl=set()
 for start in range(0,min(len(unique),600),45):
  chunk=unique[start:start+45]
  with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
   ver=list(pool.map(jpeg,chunk))
  for x,(ok,why) in zip(chunk,ver):
   checked+=1
   if not ok:
    if len(imagesBad)<100:imagesBad.append({'id':x['id'],'error':why})
    continue
   if x['previewURL'] in seenUrl:continue
   seenUrl.add(x['previewURL']);selected.append(x)
   if len(selected)>=250:break
  print('B11_IMAGE_SCREEN',json.dumps({'checked':checked,'verified':len(selected),'failed':len(imagesBad)}),flush=True)
  if len(selected)>=250:break
 digest=hashlib.sha256(json.dumps([x['id'] for x in selected],separators=(',',':')).encode()).hexdigest()
 if selected:gallery(selected,digest)
 counts={'sourceCMA':len(cma),'sourceNGA':len(nga),'sourceCandidatesDistinct':len(unique),
  'previewChecks':checked,'previewFailures':len(imagesBad),'reviewableFinal':len(selected),
  'byMuseum':dict(Counter(x['provider'] for x in selected)),
  'priorReviewIDsExcluded':1705,'historicalCMAIdsPlusReviewIDsExcluded':len(prior)-1705,
  'productionImports':0,'originalImageDownloads':0,'userSelections':0}
 out={'schema':'AO_SACRED_ART_B11_250_CMA_NGA_CC0_REVIEW_V1','date':'2026-10-29',
  'batchId':'B11','targetSize':250,'completeBatchReady':len(selected)==250,
  'batchHash':digest,'counts':counts,
  'pastBatches':breakdown,'cmaEvidence':cmameta,'ngaEvidence':ngameta,'previewErrors':imagesBad,
  'gates':{'previousSourceIDExclusions':True,'imageSpecificCC0':True,'sourceJpegBytesVerified':True,
   'oilTemperaReligiousScenesOnly':True,'noProductionMutation':True,'noNativePhotoOrFrameQA':True},
  'rows':selected}
 OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 QA.write_text('# Batch 11 — National Gallery of Art and Cleveland Museum of Art\n\n'
   f"Open-access sacred oil/tempera candidates: CMA {len(cma)}, NGA {len(nga)}; "
   f"deduplicated source candidates {len(unique)}. "
   f"Actual JPEG previews checked {checked}; failed {len(imagesBad)}. "
   f"**{len(selected)}** unique preview-visible paintings ready of 250 target.\n\n"
   f"Previous 1,705 shown source IDs excluded (B1–B10); B9 decisions 63 Import, 3 with corrections, 129 Reject validated and frozen. "
   'The historical initial Cleveland 57-image gallery also excluded where not in earlier review IDs.\n\n'
   'NGA image evidence: exact object joined to published_images.openaccess=1 and official IIIF. '
   'Cleveland image evidence: exact object CC0 share-license and official openaccess CDN. '
   'No image originals acquired, no publication or manual approval, no cost. '
   'Native full-resolution, frame-free art and colour calibration await user review.\n\n'
   f'Batch source ID hash: {digest}.\n')
 print('B11_FINAL',json.dumps({'counts':counts,'hash':digest,
  'sample':[(x['title'],x['artist'],x['provider']) for x in selected[:18]]},ensure_ascii=False)[:7000],flush=True)
if __name__=='__main__':main()
