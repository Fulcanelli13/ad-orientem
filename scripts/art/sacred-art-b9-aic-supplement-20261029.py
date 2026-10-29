#!/usr/bin/env python3
"""B9 supplement: official Art Institute of Chicago PD painting candidates.

Use AIC public API at <=1 query/s. Image URLs are the institution's
own IIIF links. Research metadata only; no image original stored.
"""
from __future__ import annotations
import concurrent.futures,importlib.util,json,re,time,urllib.parse,urllib.request,urllib.error
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];DATA=ROOT/'data/calendar'
OUTPUT=DATA/'sacred-art-b9-aic-open-access-supplement-20261029.v1.json'
met=importlib.util.spec_from_file_location('b9met',ROOT/'scripts/art/sacred-art-b9-met-250-review-20261029.py')
M=importlib.util.module_from_spec(met);met.loader.exec_module(M)
BASE='https://api.artic.edu/api/v1/artworks/search'
UA='AdOrientem-ArtReview-AIC-B9/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
TERMS=(
 'Christ','Jesus','Madonna','Virgin','Holy Family','Annunciation',
 'Crucifixion','Nativity','Adoration','Resurrection','Transfiguration',
 'Ascension','Pieta','Deposition','Lamentation','Entombment',
 'Last Supper','Supper at Emmaus','Christ Carrying Cross','Magdalene',
 'Saint','Saint Peter','Saint Paul','Saint John','Saint Sebastian',
 'Saint Francis','Saint Catherine','Saint Jerome','Saint Joseph',
 'Saint Anthony','Saint George','Saint Nicholas','Saint Gregory',
 'Saint Benedict','St.','Moses','Abraham','David','Judith','Susanna',
 'Tobias','Adam and Eve','Cain and Abel','Elijah','Good Samaritan',
 'Prodigal Son','Baptism','Visitation','Immaculate Conception',
 'Saint Teresa','Angel','Saint Michael','Apostle','Evangelist',
 'Holy Trinity','Martyrdom','Conversion of Saint Paul','Sacrifice of Isaac',
 'Virgin and Child','Adoration of the Shepherds','Saint Jerome in the Wilderness'
)
FIELDS='id,title,artist_title,image_id,medium_display,artwork_type_title,is_public_domain,date_start,date_display,thumbnail,api_link'
def api(url):
 p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname!='api.artic.edu' or p.path!='/api/v1/artworks/search':
  raise ValueError('API_OUTSIDE_SCOPE')
 req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json'})
 with urllib.request.urlopen(req,timeout=28) as r:
  raw=r.read(4000000)
 return json.loads(raw)
def valid(x):
 if x.get('is_public_domain') is not True or not x.get('image_id'):return False
 if str(x.get('artwork_type_title') or '').lower()!='painting':return False
 med=str(x.get('medium_display') or '').lower()
 if not any(t in med for t in ('oil on','tempera on','oil and tempera','oil, tempera','fresco','egg tempera')):return False
 if any(t in med for t in ('watercolor','print','lithograph','etching','photograph','engraving')):return False
 y=x.get('date_start') or 0
 if isinstance(y,(float,int)) and y and (y<1290 or y>1899):return False
 if any(t in str(x.get('artist_title') or '').lower() for t in M.BANNED_ARTISTS):return False
 if not M.is_sacred({'title':x.get('title') or ''}):return False
 th=x.get('thumbnail') or {}
 if th and isinstance(th,dict) and (int(th.get('width') or 1500)<720 or int(th.get('height') or 1500)<720):return False
 return True
def check(x):
 url=x['previewURL']
 try:
  p=urllib.parse.urlparse(url)
  if p.hostname!='www.artic.edu':return False,'BAD_HOST'
  req=urllib.request.Request(url,headers={'User-Agent':UA,'Range':'bytes=0-15'})
  with urllib.request.urlopen(req,timeout=20) as r:
   magic=r.read(16)
  return magic.startswith(bytes.fromhex('ffd8')),'JPEG_OK'
 except Exception as e:return False,type(e).__name__+': '+str(e)[:120]
def priority(x):
 t=str(x['title']).lower()
 a=str(x['artist']).lower()
 y=int(x.get('year') or 0)
 return (0 if any(z in a for z in M.FAVORITE) else 1,
   0 if 1575<=y<=1750 else 1 if 1450<=y<=1850 else 2,
   0 if str(x.get('medium') or '').lower().startswith('oil') else 1,
   0 if any(z in t for z in ('christ','madonna','saint','virgin')) else 1,
   t,x['id'])
def main():
 previous,prev_breakdown=M.prior_ids();candidates=[];seen=set();terms={};failures=[]
 for q in TERMS:
  params={'q':q,'limit':100,'page':1,'fields':FIELDS}
  url=BASE+'?'+urllib.parse.urlencode(params)
  try:
   data=api(url)
   results=data.get('data') or []
   terms[q]={'returned':len(results),'total':(data.get('pagination') or {}).get('total',0)}
   for art in results:
    id='aic:'+str(art.get('id'))
    if id in seen or id in previous:continue
    seen.add(id)
    if not valid(art):continue
    uid=str(art['image_id'])
    if not re.fullmatch(r'[a-zA-Z0-9-]{8,80}',uid):continue
    candidates.append({'id':id,'provider':'AIC','sourceInstitution':'Art Institute of Chicago',
     'objectId':str(art['id']),'accession':str(art['id']),
     'title':art.get('title') or '', 'artist':art.get('artist_title') or 'Unattributed',
     'medium':art.get('medium_display') or '', 'date':art.get('date_display'),
     'year':art.get('date_start') or 0,
     'objectUrl':'https://www.artic.edu/artworks/'+str(art['id']),
     'previewURL':'https://www.artic.edu/iiif/2/'+uid+'/full/843,/0/default.jpg',
     'nativeImageURL':'https://www.artic.edu/iiif/2/'+uid+'/full/full/0/default.jpg',
     'sourceRights':'AIC_IS_PUBLIC_DOMAIN_TRUE_OFFICIAL_IIIF_CC0',
     'rightsConflict':None,'imageRightsVerified':True,'productionOriginalImageQA':False,
     'productionImported':False})
  except Exception as e:failures.append({'term':q,'error':type(e).__name__+': '+str(e)[:190]})
  time.sleep(1.05) # institution asks <=1 metadata request per second
 print('AIC_SEARCH',json.dumps({'queries':len(terms),'uniqueIDs':len(seen),
   'eligible':len(candidates),'errors':failures[:10]},ensure_ascii=False)[:3500],flush=True)
 candidates.sort(key=priority)
 distinct=[];seen_identity=set()
 for x in candidates:
  ident=(M.norm(x['title']),M.norm(x['artist']))
  if ident in seen_identity:continue
  seen_identity.add(ident);distinct.append(x)
 checks=distinct[:220]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
  verdicts=list(pool.map(check,checks))
 selected=[r for r,(ok,why) in zip(checks,verdicts) if ok]
 imagefail=[{'id':r['id'],'issue':why} for r,(ok,why) in zip(checks,verdicts) if not ok]
 j={'schema':'AO_SACRED_ART_B9_AIC_SUPPLEMENT_V1','date':'2026-10-29','batchId':'B9',
  'counts':{'queriesRun':len(terms),'uniqueIDsScanned':len(seen),
  'eligibleSacredPaintings':len(candidates),'distinctCandidatePaintings':len(distinct),
  'previewChecks':len(checks),'imageFailures':len(imagefail),
  'imageValidCandidates':len(selected),'previousReviewIDsExcluded':len(previous),
  'productionImports':0,'originalImageDownloads':0},
  'terms':terms,'apiErrors':failures,'previewFailures':imagefail[:100],
  'policy':'Exact artwork is_public_domain=true; painting classification; official AIC IIIF image; no production/original download',
  'rows':selected}
 OUTPUT.write_text(json.dumps(j,indent=2,ensure_ascii=False)+'\n')
 print('AIC_DONE',json.dumps({'counts':j['counts'],'first':[(x['title'],x['artist']) for x in selected[:12]],
  'failures':imagefail[:10]},ensure_ascii=False)[:4500],flush=True)
if __name__=='__main__':main()
