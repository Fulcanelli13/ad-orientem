#!/usr/bin/env python3
"""B10 Rijks large-batch painting reviewer: exact EDM/IIIF open-image rights.

All output research only. Script uses the existing strict Rijksmuseum B2 photo
rights routine, rechecks titles and sources, and excludes every previously
seen Rijks painting and all prior B1-B9 exact source IDs.
"""
from __future__ import annotations
import concurrent.futures,hashlib,importlib.util,json,re,time,urllib.parse,urllib.request,urllib.error
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
OUT=D/'sacred-art-b10-rijks-250-rights-verified-source-20261029.v1.json'
HTML=ROOT/'docs/SACRED_ART_RIJKSMUSEUM_250_IMPORT_REVIEW_B10_20261029.html'
QA=ROOT/'docs/SACRED_ART_B10_RIJKSMUSEUM_SOURCE_QA_20261029.md'
DISC=D/'sacred-art-b10-rijks-bulk-discovery-20261029.v1.json'
FAV=('rubens','van dyck','dyck','jordaens','murillo','ribera','caravaggio','champaigne',
'guercino','strozzi','carracci','honthorst','zurbar','preti','reni','tintoretto',
'veronese','fetti','ter brugghen','de la tour','tiepolo','cavallino','rembrandt',
'govert flinck','luca giordano','domenichino','barocci','poussin','elsheimer','memling',
'frans hals','jan boeckhorst','lastman','de crayer','balthasar van der ast','goltzius',
'van oost','frans francken','brueghel','cuyp','bloemaert','bol','van der werff')
DUTCH=('christus','jezus','maria','madonna','de maagd','heilige familie','heilige ',
 'heiligen','heilige maagd','kruisiging','kruisafneming','kruisdraging','verrijzenis',
 'opstanding','graflegging','aanbidding','annunciatie','boodschap aan maria',
 'besnijdenis','hemelvaart','doop van christus','doop van jezus','driekoningen',
 'herders','magdalena','sint ','sint-','heilige petrus','petrus','paulus','apostelen',
 'evangelist','johannes de doper','doper','johannes de evangelist','jozef van nazareth',
 'abraham','isaak','mozes','elias','elia','judith','susanna','tobias','tobit',
 'noach','salomo','de profeet','geboorte van christus','david en','adam en eva',
 'raaf','lazarus','lazarius','goliath','martelaarschap','heilige antonius',
 'heilige franciscus','heilige cecilia','simeon','barmhartige samaritaan',
 'verloren zoon','laatste avondmaal','pinksteren','god de vader','heilige geest',
 'heilige drie-eenheid','heilige rochus','de passie van christus','ecce homo')
NEG=('portret van','portret van maria','vrouw genaamd maria',
 'prinses maria','koningin maria','maria van','maria de','maria anna',
 'kasteel','kerkinterieur','binnenaanzicht van','landschap met kerk',
 'kerkhof te','kerk van','kathedraal','portret van een','een portret',
 'aanzicht van','de heilige weg','st. petersburg','straat in')
def load(module,path):
 spec=importlib.util.spec_from_file_location(module,path);out=importlib.util.module_from_spec(spec);spec.loader.exec_module(out);return out
B2=load('ao_legacy_rijks_image_rights',ROOT/'scripts/art/sacred-art-rijks-rights-gated-review-b2-20261029.py')
M=load('ao_b9_met_exclusions',ROOT/'scripts/art/sacred-art-b9-met-250-review-20261029.py')
def norm(s):return re.sub(r'[^a-z0-9]+',' ',str(s or '').lower()).strip()
def previous():
 prev,counts=M.prior_ids()
 b9=json.loads((D/'sacred-art-b9-met-250-review-source-20261029.v1.json').read_text())
 extra={x['id'] for x in b9['rows']}
 assert len(extra)==195 and not extra&prev
 prev|=extra;assert len(prev)==1455
 overlay=json.loads((D/'sacred-art-rijks-user-choice-overlay-20261029.v1.json').read_text())
 rated={'rijks:'+str(x['museumObjectId']) for x in overlay['records']}
 assert len(rated)==137,len(rated)
 oldb2=json.loads((D/'sacred-art-rijks-rights-gated-review-b2-20261029.v1.json').read_text())
 legacy={'rijks:'+str(x['sourceObjectId']) for x in oldb2['records']}
 assert len(legacy)==140,len(legacy)
 prev|=rated|legacy
 assert len(prev)>=1455
 return prev,counts,{'rated':len(rated),'oldB2':len(legacy)}
def access_record(id):
 try:
  return B2.object_record(str(id),17),None
 except Exception as e:return None,type(e).__name__+': '+str(e)[:110]
def allcontents(entries):
 if not isinstance(entries,list):return []
 out=[]
 for e in entries:
  if isinstance(e,dict) and e.get('content'):
   out.append(str(e['content']))
 return out
def record_title(r):
 titles=[];priority=[]
 for e in r.get('identified_by') or []:
  if not isinstance(e,dict) or not e.get('content'):continue
  t=str(e['content'])
  if e.get('type')=='Name':titles.append(t)
  if any(str(x.get('id','')).endswith('/300417200') for x in e.get('classified_as',[]) if isinstance(x,dict)):
   priority.append(t)
 # Getty / Rijks Linked Art sometimes stores title as _label.
 return (priority or titles or [str(r.get('_label') or '')])[0].strip()
def get_artist(r):
 found=[]
 def scan(x,depth=0):
  if depth>5:return
  if isinstance(x,list):
   for a in x[:20]:scan(a,depth+1)
   return
  if not isinstance(x,dict):return
  for k in ('notation','_label'):
   v=x.get(k)
   if isinstance(v,str) and v and v not in found and len(v)<140 and (' ' in v or len(v)>7):
    found.append(v)
   if isinstance(v,list):
    for y in v:
     if isinstance(y,dict):
      v2=y.get('@value') or y.get('value')
      if isinstance(v2,str) and v2 not in found:found.append(v2)
  for k in ('part','carried_out_by','attributed_by','used_specific_object','actor'):
   if k in x:scan(x[k],depth+1)
 scan(r.get('produced_by') or {})
 found=[x for x in found if not x.lower().startswith(('production of','produced by','made by','artist of','object by'))]
 return found[0] if found else 'Attribution not identified'
def year(r):
 t=(r.get('produced_by') or {}).get('timespan') or {}
 if isinstance(t,list):t=next((x for x in t if isinstance(x,dict)),{})
 if not isinstance(t,dict):t={}
 v=str(t.get('begin_of_the_begin') or '')
 m=re.match(r'(-?\d{3,4})',v)
 return int(m.group(1)) if m else 0
def likely(r):
 t=record_title(r)
 if not t:return False
 lo=t.lower()
 if any(z in lo for z in NEG):return False
 if any(z in lo for z in DUTCH):return True
 return M.is_sacred({'title':t})
def parse_rec(id,r):
 t=record_title(r);a=get_artist(r);y=year(r)
 return {'id':'rijks:'+str(id),'sourceObjectId':str(id),'title':t,'artist':a,'year':y}
def priority(r):
 a=r['artist'].lower();t=r['title'].lower();y=r['year']
 return (0 if any(z in a for z in FAV) else 1,
   0 if 1580<=y<=1750 else 1 if 1450<=y<=1850 else 2,
   0 if 'christ' in t or 'maria' in t or 'virgin' in t or 'heilige' in t else 1,
   t,int(r['sourceObjectId']))
def verified_image(candidate):
 id=candidate['sourceObjectId']
 try:
  rights=B2.image_source(id,17)
  if rights.get('status')!='CC0_IMAGE':return None,{'id':id,'rights':rights.get('status')}
  linked=rights.get('edmImageRightsProof') or {}
  if not (linked.get('sameObject') and linked.get('sameImageService') and linked.get('explicitOpenRights')):
   return None,{'id':id,'rights':'EDM_LINKAGE_MISMATCH'}
  service=str(rights.get('imageService') or '')
  if not re.fullmatch(r'https://iiif\.micr\.io/[A-Za-z0-9_-]{3,32}',service):
   return None,{'id':id,'rights':'UNVERIFIED_IIIF_HOST'}
  info=B2.request(service+'/info.json',17)
  w,h=int(info.get('width') or 0),int(info.get('height') or 0)
  if min(w,h)<1500:return None,{'id':id,'rights':'LOW_NATIVE_DIMENSIONS','pixels':[w,h]}
  img=service+'/full/760,/0/default.jpg'
  req=urllib.request.Request(img,headers={'User-Agent':'AdOrientem-Sacred-Art-B10-Research/1.0','Accept':'image/jpeg','Range':'bytes=0-15'})
  with urllib.request.urlopen(req,timeout=18) as rsp:
   b=rsp.read(16)
  if not b.startswith(bytes.fromhex('ffd8')):return None,{'id':id,'rights':'PREVIEW_NOT_JPEG'}
  # Use exact Rijks per-image EDM proof; B2 ensures license+object+image service match.
  d={**candidate,'provider':'Rijks','sourceInstitution':'Rijksmuseum, Amsterdam',
     'objectId':id,'accession':rights.get('accession') or id,
     'objectUrl':'https://id.rijksmuseum.nl/'+id,
     'previewURL':img,'nativeImageURL':service+'/full/max/0/default.jpg',
     'sourceRights':'RIJKSMUSEUM_EXACT_OBJECT_EDM_PDM_MATCHED_IIIF',
     'imageRightsVerified':True,'rightsHold':False,'rightsConflict':None,
     'nativeSourceDimensions':{'width':w,'height':h},
     'sourceImageRightsEvidence':linked.get('evidenceURL'),
     'productionOriginalImageQA':False,'productionImported':False}
  return d,None
 except Exception as e:return None,{'id':id,'issue':type(e).__name__+': '+str(e)[:140]}
def gallery(rows):
 src=(ROOT/'docs/SACRED_ART_MET_195_IMPORT_REVIEW_B9_20261029.html').read_text()
 digest=hashlib.sha256(json.dumps([x['id'] for x in rows],separators=(',',':')).encode()).hexdigest()
 data=json.dumps(rows,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
 src,n=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script><script>)',
    lambda m:m.group(1)+data+m.group(2),src,count=1,flags=re.S)
 assert n==1
 src,n=re.subn(r'const batchHash="[0-9a-f]+";',lambda m:'const batchHash="'+digest+'";',src,count=1)
 assert n==1
 src=re.sub(r'<title>.*?</title>','<title>Ad Orientem | Sacred Art Batch 10 ('+str(len(rows))+')</title>',
    src,count=1,flags=re.S)
 src=src.replace('The Metropolitan Museum of Art · Batch 9','Rijksmuseum Amsterdam · Batch 10')
 src=re.sub(r'<select id="museum"[^>]*>.*?</select>',
   '<select id="museum" aria-label="Museum"><option value="all">All paintings</option><option value="Rijks">Rijksmuseum</option></select>',
   src,count=1,flags=re.S)
 src=src.replace("batchId:'B9'","batchId:'B10'")
 src=src.replace('ao-sacred-art-b9-met-import-','ao-sacred-art-b10-rijks-import-')
 src=src.replace('ad-orientem-sacred-art-b9-met-','ad-orientem-sacred-art-b10-rijks-')
 assert "batchId:'B10'" in src and "const PAGE_SIZE=50;" in src
 HTML.write_text(src,encoding='utf8')
 return digest
def main():
 old,counts,legacy=previous()
 discovered=json.loads(DISC.read_text())
 ids=[x.split(':',1)[1] for x in discovered['ids'] if x not in old]
 print('RIJKS_B10_EXCLUDED',json.dumps({'discovered':len(discovered['ids']),'previous':len(old),'remaining':len(ids),'legacy':legacy}),flush=True)
 assert len(ids)>300,('Rijks source too small after exclusions',len(ids))
 meta=[];metaerr=[];scanned=0
 for start in range(0,min(len(ids),1650),80):
  chunk=ids[start:start+80]
  with concurrent.futures.ThreadPoolExecutor(max_workers=7) as pool:
   rs=list(pool.map(access_record,chunk))
  for id,(obj,e) in zip(chunk,rs):
   scanned+=1
   if e:
    if len(metaerr)<150:metaerr.append({'id':id,'error':e});continue
   if obj is None or not likely(obj):continue
   cand=parse_rec(id,obj)
   if any(x in cand['artist'].lower() for x in ('el greco','fra angelico')):continue
   meta.append(cand)
  print('RIJKS_METADATA',json.dumps({'processed':scanned,'iconographicPaintings':len(meta),'errors':len(metaerr)}),flush=True)
  if len(meta)>=380:break
  time.sleep(.1)
 meta.sort(key=priority)
 unique=[];subjects=set()
 for x in meta:
  sig=(norm(x['title']),norm(x['artist']))
  if sig in subjects and x['artist']!='Attribution not identified':continue
  subjects.add(sig);unique.append(x)
 selected=[];errors=[];checked=0;seenImages=set()
 for start in range(0,min(len(unique),550),45):
  chunk=unique[start:start+45]
  with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
   rs=list(pool.map(verified_image,chunk))
  for rec,(item,error) in zip(chunk,rs):
   checked+=1
   if error:
    if len(errors)<200:errors.append(error)
    continue
   if item['previewURL'] in seenImages:continue
   seenImages.add(item['previewURL']);selected.append(item)
   if len(selected)==250:break
  print('RIJKS_RIGHTS_IMAGES',json.dumps({'checked':checked,'verified':len(selected),'errors':len(errors)}),flush=True)
  if len(selected)==250:break
 digest=gallery(selected) if selected else None
 out={'schema':'AO_B10_RIJKS_EXACT_IMAGE_RIGHTS_REVIEW_V1','date':'2026-10-29',
   'batchId':'B10','target':250,'completeBatchReady':len(selected)==250,
   'counts':{'discoveredSourceIds':len(discovered['ids']),'afterAllExclusions':len(ids),
    'metadataRecordsChecked':scanned,'sacredMetadataCandidates':len(meta),
    'distinctSubjectArtistCandidates':len(unique),'imageAndRightsChecks':checked,
    'verifiedReviewableImages':len(selected),'sourceVerificationFailures':len(errors),
    'priorReviewIDsExcluded':1455,'historicalRijksUserRatingsExcluded':legacy['rated'],
    'priorB7SelectionsPreserved':42,'priorB8SelectionsPreserved':54,
    'productionImageOriginalDownloads':0,'productionImports':0},
   'priorBreakdown':counts,'sourceErrors':metaerr,'imageErrors':errors,
   'hash':digest,'source':'official data.rijksmuseum.nl linked art API; EDM exact image rights; matching iiif.micr.io image service; native dimension >=1500px on short side',
   'limitations':'Preview image metadata and JPEG gate only; no visual aesthetic grade, frame or color fidelity guarantee',
   'rows':selected}
 OUT.write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n')
 QA.write_text('# Sacred Art Batch 10 — Rijksmuseum official open data\n\n'
   f"Search records {len(discovered['ids'])}, after prior exclusions {len(ids)}. Metadata scanned {scanned}; iconographic matches {len(meta)}. "
   f"Rights+JPEG+resolution checks {checked}; verified review cards **{len(selected)}** / target 250.\n\n"
   f"Prior original B1–B9 exact review ID exclusions 1455; previously rated Rijks 137, B2 inspected 140 also excluded.\n\n"
   'Each image has strict exact-object EDM Public Domain Mark proof, matching source IIIF service, native dimensions 1500px or more short side, an actual JPEG preview and original museum metadata. '
   'No production files imported or original images saved. Aesthetic, frames and native colour QA await human curator decision.\n\n'
   f'Batch hash {digest}.\n')
 print('B10_RIJKS_FINAL',json.dumps({'counts':out['counts'],'hash':digest,
  'top':[(x['title'],x['artist']) for x in selected[:14]]},ensure_ascii=False)[:5000],flush=True)
if __name__=='__main__':main()
