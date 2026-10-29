#!/usr/bin/env python3
"""B8: one-pass catalogue scan of SMK paintings (public domain), research review only.

The SMK official Collection API identifies paintings and Public Domain Mark images;
no original photographs saved. Exact previous review IDs, B6 choices, locked
approved works and source image failures remain exclusions.
"""
import concurrent.futures,hashlib,json,re,time,urllib.parse,urllib.request,urllib.error
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
OUT=D/'sacred-art-b8-smk-250-source-20261029.v1.json'
HTML=ROOT/'docs/SACRED_ART_SMK_250_IMPORT_REVIEW_B8_20261029.html'
REPORT=ROOT/'docs/SACRED_ART_B8_SMK_SOURCE_AND_AESTHETIC_QA_20261029.md'
API='https://api.smk.dk/api/v1/art/search/'
FILTER='[has_image:true],[object_names:Painting],[public_domain:true]'
UA='AdOrientem-SacredArt-OpenAccessResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
FAV=('rubens','van dyck','dyck','jordaens','murillo','ribera','caravaggio','champaigne',
 'guercino','strozzi','carracci','honthorst','zurbar','preti','reni',
 'tintoretto','veronese','saenredam','de crayer','giordano','fetti',
 'ter brugghen','caroselli','van oost','de la tour','vignon','tiepolo',
 'cavallino','de vos','van der werff','bloemaert','rembrandt','elsheimer',
 'poussin','dou','van baburen','bloch','abildgaard','cornelis')
NEG=('christiansborg','christian ii','christian iii','christian iv','christian v ','christian vi','christian vii',
 'christian viii','christianshavn','christiania','christopher','christie',
 'saint petersburg','saint peterburg','sankt petersborg','saint louis',
 'saint tropez','st. peters square','street','saint clair island',
 'saint peter s church','church interior','interior of a church',
 'view of the church','landscape near','portrait of a man','portrait of a woman',
 'queen christina','king christian','christian church','st. mark s square',
 'saint mark s square','christian august')
# Explicit iconography, not biblical first names found in personal portraits.
SACRED_EN=('jesus','virgin mary','madonna','holy family','saint ','saints ',
 'saintly','apostle','evangelist','holy spirit','trinity','crucifix',
 'nativity','adoration','annunciation','pietà','pieta','passion of','resurrection',
 'baptism of','ascension','assumption of','saint john','saint peter','saint paul',
 'saint catherine','mary magdalen','magdalen','immaculate conception',
 'good samaritan','prodigal son','deposition','entombment','lamentation',
 'transfiguration','visitation','last supper','coronation of the virgin',
 'saint joseph','salome and','beheading of','martyrdom of','holy women',
 'the holy child','saint george','pentecost','saint nicholas',
 'saint jerome','stigmata','sacred heart','the twelve apostles',
 'the annunciation','christ child','blessed virgin','supper at emmaus',
 'moses and','moses before','moses striking','the finding of moses',
 'david and','king david and','abraham and','abraham sacrificing',
 'daniel in','elijah and','elijah fed','tobias and','tobit and',
 'judith and','judith with','susanna and','samson and','noah s ark',
 'the flood','adam and eve','the expulsion of','the creation of adam',
 'the fall of man','the sacrifice of isaac','abraham receives')
SACRED_DA=('kristus','kristi ','jesus','jesu ','jomfru maria','jomfru maria',
 'madonna','hellige familie','hellig familie','helligånden','helligaanden',
 'sankt ','sct. ','helgen','apostel','korsfæst','korsfaest',
 'bebudelsen','tilbedelse af','tilbedelsen','himmerige','pieta',
 'opstandelsen','himmelfart','dåben','daaben','sidste nadver',
 'maria magdalena','maria med barnet','jesusbarn','maria og barnet',
 'hellig treenighed','nadveren','de hellige','jesu fødsel',
 'korsnedtagelsen','gravlæggelsen','hyrdernes tilbedelse',
 'de vise mænd','moses og','abraham og','den hellige')
def low(x):return re.sub(r'\s+',' ',str(x or '')).strip().lower()
def norm(x):return re.sub(r'[^a-z0-9]+',' ',low(x)).strip()
def get(url,limit=18000000,timeout=60):
 p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname!='api.smk.dk' or not p.path.startswith('/api/v1/art/search/'):
  raise ValueError('UNTRUSTED_API')
 req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json'})
 for retry in range(3):
  try:
   with urllib.request.urlopen(req,timeout=timeout) as res:
    data=res.read(limit+1)
   if len(data)>limit:raise ValueError('API_RESPONSE_TOO_LARGE')
   return json.loads(data.decode('utf8'))
  except (urllib.error.URLError,TimeoutError) as e:
   if retry==2:raise
   time.sleep(1+retry)
def read_all():
 out=[];log=[];offset=0;found=None;seen=set()
 while offset<8000:
  url=API+'?'+urllib.parse.urlencode({'keys':'*','filters':FILTER,
    'offset':offset,'rows':650,'lang':'en'})
  d=get(url)
  if found is None:found=int(d.get('found',0))
  items=d.get('items') or []
  for x in items:
   oid=x.get('object_number')
   if oid and oid not in seen:seen.add(oid);out.append(x)
  log.append({'offset':offset,'received':len(items),'cumulative':len(out)})
  offset+=len(items)
  if not items or offset>=found:break
  time.sleep(.10)
 return out,found,log
def english_title(x):
 titles=x.get('titles') or []
 candidates=[]
 for a in titles:
  if isinstance(a,dict):
   t=a.get('title');lang=low(a.get('language'))
   if t:candidates.append((0 if ('eng' in lang or 'english' in lang) else 1,t))
  elif isinstance(a,str):candidates.append((1,a))
 return sorted(candidates,key=lambda x:x[0])[0][1] if candidates else str(x.get('title') or '')
def all_titles(x):
 a=[i.get('title','') for i in x.get('titles',[]) if isinstance(i,dict)]
 if x.get('title'):a.append(str(x['title']))
 return [z for z in a if z]
def artist(x):
 # SMK Linked Art actor data uses 'production' and 'production_actors' in
 # different records. Keep unknown where source does not identify artist.
 found=[]
 def walk(a,depth=0):
  if depth>3:return
  if isinstance(a,list):
   for b in a[:10]:walk(b,depth+1)
  elif isinstance(a,dict):
   for k in ('name','display_name','actor_name','creator','artist','person_name','preferred_name'):
    z=a.get(k)
    if isinstance(z,str) and z and len(z)<130 and z not in found:found.append(z)
   for k in ('creator','artist','artists','actors','production_actors','people','person'):
    if k in a:walk(a[k],depth+1)
  elif isinstance(a,str) and len(a)<120 and a and a not in found:found.append(a)
 for key in ('creator','artist','artists','creators','production_actors','production'):
  if key in x:walk(x[key])
 if len(found)>=2 and found[0].lower() in ('unknown','ubekendt'):
  return found[1]
 if len(found)>=2 and set(norm(found[0]).split())==set(norm(found[1]).split()):
  return found[0]
 return '; '.join(found[:2]) or 'Artist not identified in source metadata'
def iconographic(x):
 # Qualify only by the primary museum title, not alternate provenance labels.
 t=low(english_title(x))
 if not t or any(z in t for z in NEG):return False
 if any(z in t for z in ('portrait of ','portræt af ','christiansø','christina ',
      'christine ','christian ','christen ','christiana ','christmas morning',
      'christmas in','maria magdalena jensen',
      'st. jørgens sø','st. peters church','st. peter s church',
      'cathedral','square in front of','coast','castle','festival of venice',
      'landscape from','street of','church, copenhagen')):return False
 if re.search(r'\bchrist\b',t):return True
 if re.search(r'\bst\.\s*(john|johannes|peter|paul|matthew|jerome|sebastian|catherine|benedict|nicholas|francis|agnes|lucy|anthony|ursula|george|joseph|andrew|helena|mary|gregory)\b',t):return True
 return any(z in t for z in SACRED_EN+SACRED_DA)
def painting(x):
 ty=' '.join(str(v.get('name') or '') if isinstance(v,dict) else str(v)
  for v in (x.get('object_names') or []))
 if 'painting' not in low(ty):return False
 tech=' '.join(str(v) for v in x.get('techniques',[]) if isinstance(v,str))
 if not any(z in low(tech) for z in ('oil','tempera','distemper','acrylic')):return False
 if any(z in low(tech) for z in ('watercolour','watercolor','photograph','print','etching')):return False
 year=x.get('year_from')
 if year and (int(year)<1250 or int(year)>1900):return False
 return True
def verified_legal(x):
 if x.get('public_domain') is not True or x.get('has_image') is not True:return False
 url=str(x.get('rights_url') or '')
 if url and 'creativecommons.org/publicdomain/mark/1.0' not in url:return False
 licence=low(x.get('licence') or '')
 if licence and 'public domain' not in licence:return False
 im=str(x.get('image_thumbnail') or '')
 p=urllib.parse.urlparse(im)
 if p.scheme!='https' or p.hostname not in ('iip-thumb.smk.dk','iip.smk.dk'):return False
 if not p.path.endswith('.jpg'):return False
 return True
def ranked(x):
 a=low(artist(x));t=low(english_title(x))
 year=x.get('year_from')
 y=int(year) if year else 0
 tech=' '.join(x.get('techniques') or [])
 return (0 if any(z in a for z in FAV) else 1,
  0 if 1550<=y<=1780 else 1 if 1450<=y<=1850 else 2,
  0 if 'oil on canvas' in low(tech) else 1,
  0 if any(z in t for z in ('christ','jesus','crucifix','madonna','virgin','saint ','kristus','jesu')) else 1,
  t,str(x.get('object_number')))
def excluded():
 files=['sacred-art-250-review-source-b3-20261029.v1.json',
 'sacred-art-b4-multimuseum-working-review-20261029.v1.json',
 'sacred-art-nga-open-250-b5r-20261029.v1.json',
 'sacred-art-walters-250-b6-20261029.v1.json',
 'sacred-art-b7-official-museum-candidates-20261029.v1.json']
 old=json.loads((D/'sacred-art-20261029-user-60-import-reject-ledger.v1.json').read_text())
 previous={z['sourceId'] for k in ('imports','rejects') for z in old[k]}
 nums={'prior60':len(previous)}
 for p in files:
  b=json.loads((D/p).read_text());ids={r['id'] for r in b['rows']}
  assert len(ids)==len(b['rows'])
  assert not ids&previous,p
  previous|=ids
  nums[b['batchId']]=len(ids)
 assert len(previous)==1164,(len(previous),nums)
 user=json.loads((D/'sacred-art-b6-user-final-decisions-20261029.v1.json').read_text())
 assert user['batchSha256']=='f331bb64be74fcdb8ff6dee38d020b96d41602cab2f51d7a4256442c202e54ea'
 assert user['counts']=={'IMPORT':30,'IMPORT_WITH_CORRECTIONS':1,'REJECT':219}
 b6=json.loads((D/'sacred-art-walters-250-b6-20261029.v1.json').read_text())
 ids={r['id'] for r in b6['rows']}
 picks=set(user['importSourceIds'])|{x['sourceId'] for x in user['importWithCorrections']}
 assert len(picks)==31 and picks<=ids and len(ids-picks)==219
 canon=json.loads((D/'sacred-art-curator-queues-383-20261029.v1.json').read_text())
 known=set()
 for x in canon['main_records']:
  for s in (str(x.get('artwork_id') or ''),str(x.get('source_page') or '')):
   for m in re.findall(r'(?:smk[:/-]|open.smk.dk/(?:en/)?artwork/image/)(KMS[A-Za-z0-9-]+)',s,re.I):
    known.add('smk:'+m.upper())
 return previous,nums,known
def check_img(x):
 url=x['previewURL']
 try:
  req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'image/jpeg','Range':'bytes=0-15'})
  with urllib.request.urlopen(req,timeout=18) as r:
   start=r.read(16)
   return r.status in (200,206) and start.startswith(bytes.fromhex('ffd8')),'HTTP_'+str(r.status)
 except Exception as e:return False,type(e).__name__+': '+str(e)[:120]
def gallery(rows):
 orig=(ROOT/'docs/SACRED_ART_NEXT_250_IMPORT_REVIEW_B7_20261029.html').read_text()
 digest=hashlib.sha256(json.dumps([x['id'] for x in rows],separators=(',',':')).encode()).hexdigest()
 safe=json.dumps(rows,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
 h,n=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script><script>)',
  lambda m:m.group(1)+safe+m.group(2),orig,count=1,flags=re.S)
 assert n==1
 h,n=re.subn(r'const batchHash="[0-9a-f]+";',lambda m:'const batchHash="'+digest+'";',h,count=1)
 assert n==1
 h=h.replace('Sacred Art · Batch 7 (231)','SMK Sacred Art · Batch 8 ('+str(len(rows))+')')
 h=h.replace('Sacred Art · Batch 7','SMK National Gallery of Denmark · Batch 8')
 h,n=re.subn(r'<select id="museum"[^>]*>.*?</select>',
  '<select id="museum" aria-label="Museum"><option value="all">All paintings</option><option value="SMK">National Gallery of Denmark</option></select>',h,count=1,flags=re.S)
 assert n==1
 h=h.replace("batchId:'B7'","batchId:'B8'")
 h=h.replace('ao-sacred-art-b7-import-','ao-sacred-art-b8-smk-import-')
 h=h.replace('ad-orientem-sacred-art-b7-','ad-orientem-sacred-art-b8-smk-')
 assert "batchId:'B8'" in h and 'const PAGE_SIZE=50;' in h
 HTML.write_text(h,encoding='utf8')
 return digest
def main():
 prev,prior,canon=excluded()
 items,found,log=read_all()
 assert found>3000 and len(items)>3000,('incomplete SMK source scan',found,len(items))
 candidates=[]
 for x in items:
  oid=x.get('object_number')
  if not oid:continue
  id='smk:'+str(oid).upper()
  if id in prev or id in canon:continue
  if not verified_legal(x) or not painting(x) or not iconographic(x):continue
  arts=artist(x)
  if any(z in low(arts) for z in ('el greco','fra angelico')):continue
  if x.get('image_width',0) and x['image_width']<900:continue
  if x.get('image_height',0) and x['image_height']<900:continue
  candidates.append(x)
 candidates.sort(key=ranked)
 queue=[];identities=set()
 for x in candidates:
  oid=str(x['object_number']).upper();id='smk:'+oid
  title=english_title(x);a=artist(x)
  identity=(norm(title),norm(a))
  if identity in identities and a!='Artist not identified in source metadata':continue
  identities.add(identity)
  tech='; '.join(x.get('techniques') or [])
  queue.append({'id':id,'provider':'SMK','sourceInstitution':'SMK – National Gallery of Denmark',
   'objectId':oid,'accession':oid,'title':title,'artist':a,'technique':tech,
   'year':x.get('year_from'),'objectUrl':'https://open.smk.dk/en/artwork/image/'+oid,
   'previewURL':x['image_thumbnail'],'imageWidth':x.get('image_width'),
   'imageHeight':x.get('image_height'),
   'sourceImageRights':'SMK_EXACT_OBJECT_PUBLIC_DOMAIN_TRUE_OFFICIAL_POLICY',
   'sourceRightsURL':x.get('rights_url') or 'https://connect.smk.dk/om/rettigheder','rightsConflict':None,
   'productionImageRightsCleared':False,'productionImported':False})
 selected=[];fail=[];imageUrls=set()
 # Submit up to 450 previews to a modest thread pool; keep the candidate
 # editorial order independently of network completion order.
 checks=queue[:450]
 with concurrent.futures.ThreadPoolExecutor(max_workers=7) as pool:
  verdicts=list(pool.map(check_img,checks))
 for x,(ok,why) in zip(checks,verdicts):
  if not ok:
   fail.append({'id':x['id'],'issue':why})
   continue
  if x['previewURL'] in imageUrls:continue
  imageUrls.add(x['previewURL']);selected.append(x)
  if len(selected)==250:break
 assert len({x['id'] for x in selected})==len(selected)
 assert not {x['id'] for x in selected}&prev
 assert len({x['previewURL'] for x in selected})==len(selected)
 digest=gallery(selected) if selected else None
 report={'schema':'AO_SACRED_ART_B8_SMK_250_REVIEW_SOURCE_V1','date':'2026-10-29',
  'batchId':'B8','targetSize':250,'batchReady':len(selected)>=75,
  'counts':{'publicDomainPaintingsInAPI':found,'uniquePaintingRecordsRead':len(items),
    'sacredPaintingMetadataMatches':len(candidates),'distinctCandidateQueue':len(queue),
    'previewHeadersChecked':len(checks),'previewFailures':len(fail),
    'reviewableDistinct':len(selected),'previousReviewIDsExcluded':len(prev),
    'previousBatches':prior,'canonicalSMKIDsExcluded':len(canon),
    'userB6AcceptedPreserved':31,'userB6RejectedPreserved':219,
    'originalPhotosSaved':0,'productionImports':0},
  'sourceRights':'SMK public_domain=true and has_image=true per record; Painting classification; individual rights_url when present or SMK official Public Domain policy when absent; native photo QA outstanding',
  'scanLog':log,'previewErrors':fail[:100],'hash':digest,
  'gates':{'noAlreadyReviewedSourceIDs':True,'noInventedAestheticApproval':True,
    'imageLinkedViaOfficialSMKCDN':True,'noProductionMutation':True,
    'exactImageLicensesFiltered':True,'nativePhotoQualityCertified':False},'rows':selected}
 OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 REPORT.write_text('# Sacred Art B8 — SMK National Gallery of Denmark\n\n'
  f"- Official collection public-domain image-bearing painting records: **{found}**; scanned **{len(items)}**.\n"
  f"- Sacred metadata candidates: **{len(candidates)}**, distinct editorial queue **{len(queue)}**.\n"
  f"- Verified-image review cards **{len(selected)}** / target 250; source-image failures **{len(fail)}**.\n"
  f"- Excluded earlier review IDs **{len(prev)}**: {prior}. B6 preserved: 31 selected, 219 rejected.\n"
  "- Artwork type must be Painting; techniques oil/tempera etc.; individual public_domain=true; SMK official Public Domain policy, official image URL and JPEG signature check.\n"
  "- Subject and artist are title/metadata triage, NOT human aesthetic approval. Original photograph, frame, colour fidelity and crop not certified.\n"
  f"- Batch hash {digest}. Gallery research only, no photos stored, no production art changes, €0.\n")
 print(json.dumps({'counts':report['counts'],'ready':report['batchReady'],'hash':digest,
  'samples':[(x['id'],x['title'],x['artist']) for x in selected[:12]],'errors':fail[:5]},ensure_ascii=False)[:7000])
if __name__=='__main__':main()
