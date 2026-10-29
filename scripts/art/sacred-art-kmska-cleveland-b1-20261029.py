#!/usr/bin/env python3
"""Two museum Sacred Art intake: KMSKA (institution-scoped OAI) and Cleveland (CC0 API).
Fetches only public metadata and rights/IIIF manifests. Does NOT download any image.
Editorial import remains user-driven through a separate review gallery.
"""
from __future__ import annotations
import json,re,urllib.parse,urllib.request,urllib.error,xml.etree.ElementTree as ET,time
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'data/calendar/sacred-art-kmska-cleveland-first-review-20261029.v1.json'
CANON=ROOT/'data/calendar/sacred-art-curator-queues-383-20261029.v1.json'
UA='AdOrientem-SacredArt-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
OAI='https://datahub.vlaamsekunstcollectie.be/oai/'
KSET='institution:koninklijk_museum_voor_schone_kunsten_antwerpen'
CMA='https://openaccess-api.clevelandart.org/api/artworks/'
SEARCH=['annunciation','nativity','adoration','crucifixion','resurrection','saint jerome',
 'saint francis','saint peter','saint paul','magdalene','holy family','christ',
 'virgin mary','baptism of christ','deposition','pieta','madonna','ecce homo']
SUBJECT=('christ','crucifix','annunc','magdalene','saint ','saints ','holy family',
 'nativity','adoration','virgin and child','madonna and child','virgin mary','pieta',
 'resurrection','pentecost','ascension','descent from','lamentation','deposition',
 'baptism of christ','ecce homo','sacred heart','saint francis','saint jerome',
 'sainte ','heilige familie','heilige maagd','heilige franciscus','verkondiging',
 'aanbidding','kruisiging','kruisafneming','bewening','madonna','maria met kind','maria en kind')
EXCLUDE=('el greco','fra angelico')
def tag(x):return x.tag.split('}')[-1]
def compact(s):return re.sub(r'\s+',' ',str(s or '')).strip()
def get(url,maxsize=2500000,timeout=20):
 p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname not in ('datahub.vlaamsekunstcollectie.be','openaccess-api.clevelandart.org','iiif.kmska.be'):
  raise ValueError('HOST_DENIED')
 req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json,application/xml'})
 with urllib.request.urlopen(req,timeout=timeout) as res:
  body=res.read(maxsize+1)
 if len(body)>maxsize:raise ValueError('RESPONSE_SIZE_LIMIT')
 return body
def interesting(title,artist,medium=''):
 t=compact(title).lower();a=compact(artist).lower();m=compact(medium).lower()
 if any(x in a for x in EXCLUDE):return False
 if any(x in t for x in ('krishna','buddha','shiva','vishnu','ganesha','bodhisattva','hindu','quran','allah','mosque','islamic','sikh')):return False
 if not any(x in t for x in SUBJECT):return False
 if m and any(x in m for x in ('print','etching','drawing','engraving','sculpture','statue','photograph','textile','manuscript','woodcut','ceramic','medal','book','object','lithograph','printmaking')):return False
 return True
def textfields(rec,n,maxn=8):
 a=[]
 for e in rec.iter():
  if tag(e)==n and e.text and compact(e.text) and compact(e.text) not in a:a.append(compact(e.text))
  if len(a)>=maxn:break
 return a
def oai_rec(rec):
 h=next((x for x in rec if tag(x)=='header'),None)
 m=next((x for x in rec if tag(x)=='metadata'),None)
 if m is None or h is None:return None
 sets=textfields(h,'setSpec',18)
 if KSET not in sets:return None
 ids=textfields(h,'identifier')
 title=textfields(m,'appellationValue',15)
 # Titles are usually multilingual: first named version is a legitimate metadata title.
 ttl=title[0] if title else ''
 artists=textfields(m,'displayActorInRole',5)
 artist='; '.join(artists)
 worktype=textfields(m,'term',50)
 medium=' '.join(x for x in worktype if x.lower() in ('painting','schilderij','oil painting','olieverfschilderij')) or ''
 if not interesting(' '.join(title[:5]),artist,medium):return None
 all_links=[compact(x.text) for x in m.iter() if x.text and ('iiif.kmska.be/' in x.text or 'kmska.be/collection/work/data/' in x.text)]
 manifests=list(dict.fromkeys(re.findall(r'https://iiif\.kmska\.be/iiif/(?:2|3)/[A-Za-z0-9_-]+/manifest\.json',' '.join(all_links))))
 rootid=ids[0] if ids else ''
 objectid=rootid.rsplit(':',1)[-1]
 purl=next((x for x in all_links if '/collection/work/data/' in x),None)
 return {'provider':'KMSKA','sourceInstitution':'Royal Museum of Fine Arts Antwerp',
 'id':'kmska:'+objectid,'objectId':objectid,'objectUrl':purl or 'https://vlaamsekunstcollectie.be/en',
 'sourceOaiId':rootid,'title':ttl,'titleAlternates':title[1:5],'artist':artist,
 'sourceMediumIndicators':worktype[:20],'sourceImageRights':'UNVERIFIED',
 'manifestCandidates':manifests,'previewURL':None,'previewRightsVerified':False,
 'identityMatchedToCanonical':False,'editorialSelection':None,'productionReleased':False}
def kmska_scan(pages,delay,errors):
 out=[];token=None;n=0;reachedend=False
 for page in range(pages):
  q={'verb':'ListRecords','resumptionToken':token} if token else {'verb':'ListRecords','metadataPrefix':'oai_lido','set':KSET}
  try:
   root=ET.fromstring(get(OAI+'?'+urllib.parse.urlencode(q)))
   errs=[compact(z.text) for z in root.iter() if tag(z)=='error']
   if errs:errors.append({'provider':'KMSKA','page':page,'error':'OAI:'+str(errs)[:260]});break
   candidates=[x for x in root.iter() if tag(x)=='record'];n+=len(candidates)
   for x in candidates:
    y=oai_rec(x)
    if y:out.append(y)
   token=next((compact(x.text) for x in root.iter() if tag(x)=='resumptionToken' and x.text and compact(x.text)),None)
   if not token:reachedend=True;break
  except Exception as e:
   errors.append({'provider':'KMSKA','page':page,'error':type(e).__name__+': '+str(e)[:180]});break
  time.sleep(delay)
 return out,{'pagesAttempted':page+1,'sourceRecordsScanned':n,'sacredMetadataCandidates':len(out),
   'exhausted':reachedend,'set':KSET}
def verify_kmska_manifest(x):
 for u in x['manifestCandidates'][:2]:
  try:
   j=json.loads(get(u,350000))
   licence=str(j.get('rights') or j.get('license') or j.get('licence') or '').lower()
   openimg=('creativecommons.org/publicdomain/mark/1.0' in licence or
            'creativecommons.org/publicdomain/zero/1.0' in licence or
            'creativecommons.org/licenses/by/4.0' in licence)
   if not openimg:continue
   img=''
   if j.get('sequences'):
    c=(j['sequences'][0].get('canvases') or [{}])[0]
    res=(c.get('images') or [{}])[0].get('resource') or {}
    img=res.get('@id') or res.get('id') or ''
   if not img and j.get('items'):
    pages=j['items'][0].get('items') or []
    if pages:
     b=(pages[0].get('items') or [{}])[0].get('body') or {}
     img=b.get('id') or ''
   if img.startswith('https://') and ('iiif.kmska.be/' in img or 'dam.kmska.be/' in img):
    x['previewURL']=img;x['previewRightsVerified']=True
    x['sourceImageRights']=licence;x['manifestRightsURL']=u
    return True
  except Exception:continue
 return False
def cma_scan(perquery,delay,errors,existing):
 out={};qinfo=[]
 for term in SEARCH:
  url=CMA+'?'+urllib.parse.urlencode({'q':term,'limit':perquery,'skip':0,'has_image':'1'})+'&cc0'
  try:
   d=json.loads(get(url,4500000))
   rr=d.get('data') or [];qinfo.append({'term':term,'returned':len(rr),'reportedTotal':(d.get('info') or {}).get('total')})
   for r in rr:
    id=r.get('id')
    if not id or 'cma-'+str(id) in existing or id in out:continue
    if r.get('share_license_status')!='CC0':continue
    title=r.get('title') or '';artists=r.get('creators') or []
    artist='; '.join(y.get('description') or '' for y in artists if isinstance(y,dict))
    medium=r.get('technique') or '';classification=r.get('type') or ''
    if not interesting(title,artist,medium):continue
    if not ('oil ' in medium.lower() or 'tempera' in medium.lower() or 'acrylic on canvas' in medium.lower()):continue
    if 'painting' not in (str(classification)+' '+str(r.get('department') or '')+' '+str(r.get('collection') or '')).lower() and 'oil' not in medium.lower():continue
    images=r.get('images') or {};link=(images.get('web') or {}).get('url') or ''
    if not link.startswith('https://'):continue
    out[id]={'provider':'Cleveland','sourceInstitution':'Cleveland Museum of Art','id':'cma:'+str(id),
      'objectId':str(id),'objectUrl':r.get('url') or 'https://www.clevelandart.org/art/'+str(r.get('accession_number') or id),
      'accession':r.get('accession_number'),'title':title,'artist':artist,'technique':medium,
      'sourceImageRights':'CC0','previewURL':link,'previewRightsVerified':True,
      'identityMatchedToCanonical':False,'editorialSelection':None,'productionReleased':False}
  except Exception as e:errors.append({'provider':'Cleveland','term':term,'error':type(e).__name__+': '+str(e)[:180]})
  time.sleep(delay)
 return list(out.values()),{'searchesAttempted':len(SEARCH),'queriesReturned':len(qinfo),
    'uniqueOpenSacredPaintingCandidates':len(out),'queryLog':qinfo}
def main():
 import argparse
 p=argparse.ArgumentParser();p.add_argument('--kmska-pages',type=int,default=65)
 p.add_argument('--cleveland-per-query',type=int,default=50)
 p.add_argument('--kmska-manifests-max',type=int,default=65)
 p.add_argument('--delay',type=float,default=.13)
 a=p.parse_args()
 assert 1<=a.kmska_pages<=150 and 1<=a.cleveland_per_query<=100
 canon=json.loads(CANON.read_text(encoding='utf8'));old={x['artwork_id'] for x in canon['main_records']}
 assert len(old)==383
 errors=[];km,ks=kmska_scan(a.kmska_pages,a.delay,errors)
 unique={r['id']:r for r in km};km=list(unique.values())
 checks=0;verified=0
 for x in km:
  if not x['manifestCandidates'] or checks>=a.kmska_manifests_max:continue
  checks+=1
  if verify_kmska_manifest(x):verified+=1
  time.sleep(a.delay)
 cl,cs=cma_scan(a.cleveland_per_query,a.delay,errors,old)
 ranked=sorted(cl,key=lambda x:('rubens' not in x['artist'].lower() and 'dyck' not in x['artist'].lower() and 'champaigne' not in x['artist'].lower(),x['title'],x['id']))
 result={'schema':'AO_TWO_MUSEUM_SACRED_ART_SOURCE_CANDIDATES_V1','date':'2026-10-29',
  'museums':['KMSKA Antwerp','Cleveland Museum of Art'],
  'excludedSource':'Belvedere Vienna requires permitted metadata access: official site returned HTTP 403, no bypass attempted',
  'baselineCanonical':383,'imagesDownloaded':0,'editorialImports':0,'productionImports':0,
  'counts':{'kmskaMetadataLeads':len(km),'kmskaVerifiedImagePreviews':verified,
    'clevelandCC0ImagePreviews':len(cl),'totalVisuallyReviewable':verified+len(cl),
    'kmskaUnshownRightsOrImageHeld':len(km)-verified},
  'scope':{'KMSKA':ks,'Cleveland':cs,'kmskaManifestsAttempted':checks,
           'nonExhaustive':True,'noRightsAssumedFromMuseumAlone':True},
  'errors':errors[:120],'records':ranked+km}
 OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(json.dumps({'counts':result['counts'],'scope':{k:v for k,v in result['scope'].items() if k!='Cleveland'},
 'Cleveland':{k:v for k,v in cs.items() if k!='queryLog'},'errors':errors[:6]},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
