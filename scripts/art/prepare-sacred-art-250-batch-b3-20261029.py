#!/usr/bin/env python3
"""Build actual 250-work new research review batches from KMSKA IIIF and CMA CC0 API.

- Never re-offer the 60 works in the user's completed choice export.
- KMSKA manifest URL is an openly published research-display source, NOT a production licence.
- CMA per-image CC0 is checked, and its original files are never archived.
- Images are not downloaded or committed: the gallery uses remote previews only.
- Do not claim KMSKA rights cleared when IIIF manifest says UND.
- A complete batch has 200..300 DISTINCT visible image URLs and source IDs.
"""
from __future__ import annotations
import json, re, time, urllib.parse, urllib.request, urllib.error
from pathlib import Path
from collections import Counter
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
SOURCE=D/'sacred-art-kmska-cleveland-60page-original-evidence-20261029.v1.json'
PRIOR=D/'sacred-art-20261029-user-60-import-reject-ledger.v1.json'
OUTPUT=D/'sacred-art-250-review-source-b3-20261029.v1.json'
REPORT=ROOT/'docs/SACRED_ART_250_WORK_REVIEW_B3_20261029.md'
API='https://openaccess-api.clevelandart.org/api/artworks/'
UA='AdOrientem-CC0-Museum-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
NONCATH=('krishna','shiva','vishnu','buddha','hindu','ganesha','bodhisattva','apollo','venus','diana')
NONPAINT=('print','etching','drawing','engraving','sculpture','statue','photograph','textile','manuscript','woodcut','ceramic','medal','book','lithograph','printmaking')
THEMES=['saint','saints','virgin','madonna','christ','jesus','magdalene','crucifixion','adoration',
'annunciation','nativity','holy family','resurrection','baptism','martyrdom',
'john the baptist','saint peter','saint paul','saint francis','saint jerome','saint joseph',
'last supper','deposition','lamentation','st.','sacred heart']
FAVORITE=('rubens','van dyck','champaigne','caravaggio','zurbaran','murillo',
'carracci','ribera','preti','solimena','guido reni','luca giordano','vouet',
'van oost','poussin','jordaens','de la tour','de crayer','strozzi','lanfranco',
'cerano','guercino','gentileschi','tiepolo','tintoretto','cavallino','pietro da cortona')
def norm(s):return re.sub(r'\s+',' ',str(s or '').strip()).lower()
def get(url,limit=3000000,timeout=17,accept='application/json'):
 p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname not in ('iiif.kmska.be','openaccess-api.clevelandart.org'):
  raise ValueError('NON_ALLOWLISTED_MUSEUM_SOURCE')
 req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':accept,'Accept-Encoding':'identity'})
 with urllib.request.urlopen(req,timeout=timeout) as resp:
  b=resp.read(limit+1)
 if len(b)>limit:raise ValueError('RESPONSE_OVERSIZE')
 return json.loads(b.decode('utf-8'))
def image_responds(url,timeout=14):
 p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname not in ('iiif.kmska.be','openaccess-cdn.clevelandart.org'):
  return False,'SOURCE_IMAGE_HOST_NOT_APPROVED'
 try:
  req=urllib.request.Request(url,method='GET',headers={
   'User-Agent':UA,'Accept':'image/jpeg,image/png','Range':'bytes=0-15'})
  with urllib.request.urlopen(req,timeout=timeout) as resp:
   data=resp.read(16);type=resp.headers.get('Content-Type','')
  if not type.startswith('image/'):return False,'CONTENT_TYPE_NOT_IMAGE'
  if not(data.startswith(bytes.fromhex('ffd8')) or data.startswith(bytes.fromhex('89504e47'))):
   return False,'INVALID_IMAGE_HEADER'
  return True,'IMAGE_RESPONSE_VALID'
 except Exception as e:return False,type(e).__name__+':'+str(e)[:100]
def get_iiif_picture(m):
 """Inspect direct IIIF V2 manifest and use its own associated full-image tile URL.
 Does not assert any rights unless the manifest itself does so.
 """
 j=get(m,800000)
 legal=norm(j.get('license') or j.get('rights') or '')
 seq=j.get('sequences') or []
 if not seq:raise ValueError('NO_IIIF_SEQUENCE')
 candidates=[]
 for canvas in seq[0].get('canvases') or []:
  for x in canvas.get('images') or []:
   resource=x.get('resource') or {}
   u=resource.get('@id') or resource.get('id') or ''
   if u.startswith('https://iiif.kmska.be/') and '/full/' in u and u.endswith('/default.jpg'):
    candidates.append(u)
 if not candidates:raise ValueError('NO_IIIF_IMAGE')
 u=candidates[0]
 # Replace only IIIF region/size with a bounding-width research preview; do not crop.
 u=re.sub(r'/full/[^/]+/0/default\.jpg$', '/full/560,/0/default.jpg', u)
 if '/full/560,/0/default.jpg' not in u:raise ValueError('UNSAFE_IIIF_IMAGE_TRANSFORM')
 md={}
 for field in j.get('metadata') or []:
  l=field.get('label');v=field.get('value')
  if isinstance(l,list):l=' '.join((y.get('@value') or '') for y in l if isinstance(y,dict))
  if isinstance(v,list):v=' '.join((y.get('@value') or '') for y in v if isinstance(y,dict))
  name=re.sub('<[^>]*>','',str(l or '')).strip().lower()
  value=re.sub('<[^>]*>','',str(v or '')).strip()
  if name and value:md[name]=value[:190]
 by=next((v for k,v in md.items() if any(x in k for x in ('artist','creator','maker','kunstenaar','auteur'))),None)
 return u,legal,by,md
def k_priority(x):
 """Metadata research ordering ONLY, never artistic taste approval."""
 t=norm(x.get('title'));tags=' '.join(norm(y) for y in (x.get('sourceMediumIndicators') or []))
 a=norm(x.get('artist'))
 period=0 if ('17de eeuw' in tags or '17th century' in tags) else 1 if ('16de eeuw' in tags or '16th century' in tags) else 2 if ('18de eeuw' in tags or '18th century' in tags) else 3
 fav=0 if any(n in a for n in FAVORITE) else 1
 return(fav,period,0 if any(w in t for w in ('christus','jezus','heilige','heiligen','madonna','maria','aanbidding','kruis')) else 1,x['id'])
def cma_search(existing,max_pages=4,limit=100,delay=.10):
 result=[];seen=set(existing);terms=[];errors=[]
 for q in THEMES:
  for pg in range(max_pages):
   url=API+'?'+urllib.parse.urlencode({'q':q,'limit':limit,'skip':pg*limit,'has_image':'1'})+'&cc0'
   try:
    data=get(url,7000000,18)
    artworks=data.get('data') or []
    terms.append({'query':q,'page':pg,'returned':len(artworks),'totalReported':(data.get('info') or {}).get('total')})
    for a in artworks:
     id='cma:'+str(a.get('id'))
     if id in seen or a.get('share_license_status')!='CC0':continue
     seen.add(id)
     title=a.get('title') or '';t=norm(title)
     medium=a.get('technique') or '';m=norm(medium)
     names='; '.join(x.get('description','') for x in a.get('creators') or [] if isinstance(x,dict))
     if any(b in norm(names) for b in ('el greco','fra angelico')):continue
     if any(b in t for b in NONCATH):continue
     if not any(k in t for k in ('christ','saint ','st. ','holy','virgin','mary','madonna','magdalen',
       'annunc','nativity','adoration','crucifix','resurrect','pieta','pentecost','john','jesus',
       'apostle','sacred heart','baptism','martyr','immaculat','lament','deposition')):continue
     if not any(z in m for z in ('oil on ','tempera','acrylic on ','encaustic','distemper on')):continue
     if any(z in m for z in NONPAINT):continue
     img=(a.get('images') or {}).get('web') or {}
     pic=img.get('url') or ''
     if not pic.startswith('https://openaccess-cdn.clevelandart.org/'):continue
     result.append({'id':id,'provider':'Cleveland','museum':'Cleveland Museum of Art',
       'objectId':str(a.get('id')),'accession':a.get('accession_number'),'title':title,
       'artist':names,'medium':medium,'objectUrl':a.get('url') or
         'https://www.clevelandart.org/art/'+str(a.get('accession_number') or a['id']),
       'previewURL':pic,'rightsBasis':'CLEVELAND_EXACT_ARTWORK_CC0',
       'rightsForProduction':'CC0_IMAGE_SOURCE_CLAIM_UNDERGOES_NATIVE_QA',
       'reviewStatus':'UNREVIEWED','productionImported':False})
    if len(artworks)<limit:break
   except Exception as e:
    errors.append({'query':q,'page':pg,'error':type(e).__name__+': '+str(e)[:160]});break
   time.sleep(delay)
 result.sort(key=lambda x:(0 if any(p in norm(x['artist']) for p in FAVORITE) else 1,x['title'].lower(),x['id']))
 return result,terms,errors
def main():
 import argparse
 pa=argparse.ArgumentParser()
 pa.add_argument('--target',type=int,default=250)
 pa.add_argument('--kmska-cap',type=int,default=210)
 pa.add_argument('--delay',type=float,default=.08)
 pa.add_argument('--image-check',action='store_true')
 a=pa.parse_args()
 assert 200<=a.target<=300 and 120<=a.kmska_cap<=280
 source=json.loads(SOURCE.read_text(encoding='utf8'))
 decision=json.loads(PRIOR.read_text(encoding='utf8'))
 assert source['scope']['KMSKA']['sourceRecordsScanned']==1500
 assert decision['sourceRecordCount']==60 and decision['counts']['reject']==53
 excluded={x['sourceId'] for x in decision['imports']+decision['rejects']}
 assert len(excluded)==60
 kraw=[x for x in source['records'] if x['provider']=='KMSKA']
 kraw=[x for x in kraw if x['id'] not in excluded and x['manifestCandidates']
       and any(norm(v) in ('painting','schilderij','peinture') for v in x['sourceMediumIndicators'])]
 kraw.sort(key=k_priority)
 k=[];held=[];metadataFailures=[]
 for x in kraw:
  if len(k)>=a.kmska_cap:break
  if any(z in norm(x['title']) for z in NONCATH):continue
  manifest=x['manifestCandidates'][0]
  if not manifest.startswith('https://iiif.kmska.be/iiif/2/'):continue
  try:
   picture,licence,creator,md=get_iiif_picture(manifest)
   if a.image_check:
    good,reason=image_responds(picture)
    if not good:
     metadataFailures.append({'id':x['id'],'stage':'PREVIEW','reason':reason});continue
   k.append({'id':x['id'],'provider':'KMSKA','museum':'Royal Museum of Fine Arts Antwerp',
    'objectId':x['objectId'],'accession':next((v for key,v in md.items() if 'inventory' in key or 'inventaris' in key),None),
    'title':x['title'],'artist':x['artist'] or creator or '',
    'medium':'painting (OAI LIDO classification)',
    'objectUrl':x['objectUrl'],'manifestUrl':manifest,'previewURL':picture,
    'rightsBasis':'KMSKA_PUBLIC_IIIF_MANIFEST_'+('UND' if 'rightsstatements.org/page/und/' in licence else ('OPEN' if 'creativecommons.org/' in licence else 'OTHER')),
    'rightsStatement':licence,
    'rightsForProduction':'HOLD_UNTIL_EXACT_PHOTO_LICENCE_RECONCILED',
    'reviewStatus':'UNREVIEWED','productionImported':False})
  except Exception as e:metadataFailures.append({'id':x['id'],'stage':'MANIFEST','reason':type(e).__name__+': '+str(e)[:150]})
  time.sleep(a.delay)
 # The second museum supplements KMSKA; treat earlier 60 decisions as never re-offer.
 clev,terms,apiErrors=cma_search(excluded)
 c=[]
 for x in clev:
  if len(k)+len(c)>=a.target:break
  if a.image_check:
   good,reason=image_responds(x['previewURL'])
   if not good:
    metadataFailures.append({'id':x['id'],'stage':'PREVIEW','reason':reason});continue
  c.append(x)
 rows=(k+c)[:a.target]
 count=Counter(x['provider'] for x in rows)
 payload={'schema':'AO_SACRED_ART_250_IMAGE_REVIEW_BATCH_V1','date':'2026-10-29',
   'batchId':'B3','targetSize':a.target,'batchReady':len(rows)>=200,
   'scope':'new distinct museum-source objects only; no previous 60 reviewed works',
   'priorUserDecisionsFile':str(PRIOR.relative_to(ROOT)),
   'frozenSourceFile':str(SOURCE.relative_to(ROOT)),
   'counts':{'totalUniqueReviewCandidates':len(rows),'byMuseum':dict(count),
      'KMSKAManifestCandidatesConsidered':len(kraw),
      'KMSKAManifestValidated':len(k),'ClevelandCC0EligibleDiscovered':len(clev),
      'ClevelandIncluded':len(c),'preexisting60Excluded':len(excluded),
      'sourceErrors':len(metadataFailures)+len(apiErrors),
      'newEditorialImports':0,'newRejects':0,'productionImports':0},
   'limits':{'sourceImageBytesArchived':0,'KMSKARightsUndeterminedHeldForProduction':True,
     'ClevelandCC0SourceImageClaimsChecked':True,
     'aestheticRatingAssigned':False,'imageHeaderValidationEnabled':a.image_check,
     'noPreviouslyRejectedReoffered':True,'noImplicitRejectBeforeFinalization':True},
   'errors':metadataFailures[:100]+apiErrors[:100],
   'ClevelandQueries':terms,'rows':rows}
 assert len({x['id'] for x in rows})==len(rows)
 assert not any(x['id'] in excluded for x in rows)
 assert len(rows)<=300
 OUTPUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 lines=['# Sacred Art — 250-work review Batch B3','',
 'Source: KMSKA official IIIF manifests + Cleveland Museum of Art official CC0 API.','',
 '- Target: **'+str(a.target)+'**. Actual eligible distinct image references: **'+str(len(rows))+'**.',
 '- KMSKA source-derived research previews: **'+str(len(k))+'**; original IIIF manifest photo rights remain held unless explicitly cleared.',
 '- Cleveland CC0 candidate images: **'+str(len(c))+'**. 60 previous reviewed works excluded.',
 '- This is research-selection only. Not 250 new approvals or published images.',
 '- **'+str(len(metadataFailures)+len(apiErrors))+'** metadata/API/preview failures (see ledger).',
 '- No image original files acquired. No canonical approvals modified. Cost €0.','',
 '## Process','',
 'Use the generated offline HTML to select Import or Import with corrections; all other *displayed* artworks become Reject only after explicit batch-finalization.',
 'The exported decisions are user curation, not automatic app imports. KMSKA assets remain rights-held pending photo evidence.',
 '']
 REPORT.write_text('\n'.join(lines),encoding='utf8')
 print(json.dumps({'counts':payload['counts'],'batchReady':payload['batchReady'],
  'errorSamples':payload['errors'][:6],'ClevelandScanPages':len(terms)},ensure_ascii=False)[:3500])
if __name__=='__main__':main()
