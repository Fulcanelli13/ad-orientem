#!/usr/bin/env python3
"""Ad Orientem Batch 4: 250 NON-overlapping Art Institute Chicago sacred paintings.

Uses Art Institute's documented public API, public-domain flag, Painting classification,
original object and image_id. Only a 16-byte image header is read for preview validation.
Avoid duplicates from all Batch 3 and finalized 60-source decisions; do not auto-decide.
"""
from __future__ import annotations
import argparse,json,re,time,urllib.parse,urllib.request
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
D=ROOT/'data/calendar'
B3=D/'sacred-art-250-review-source-b3-20261029.v1.json'
PREVIOUS=D/'sacred-art-20261029-user-60-import-reject-ledger.v1.json'
CANON=D/'sacred-art-curator-queues-383-20261029.v1.json'
OUT=D/'sacred-art-artic-250-b4-20261029.v1.json'
DOC=ROOT/'docs/SACRED_ART_ARTIC_250_B4_SOURCE_REPORT_20261029.md'
HOST='https://api.artic.edu/api/v1/artworks/search'
FIELDS='id,title,artist_title,artist_display,artwork_type_title,classification_title,medium_display,is_public_domain,image_id,thumbnail,main_reference_number,date_display'
UA='AdOrientem-Art-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
TERMS=[
'saint jerome','madonna and child','crucifixion','christ','saint john','saint francis',
'annunciation','nativity','adoration of the magi','adoration of the shepherds',
'virgin mary','virgin and child','saint peter','saint paul','saint sebastian',
'mary magdalene','the holy family','the resurrection','deposition','lamentation',
'saint anthony','saint george','saint joseph','saint catherine','saint anne',
'saint agnes','saint dominic','saint teresa','saint augustine','saint ambrose',
'saint gregory','saint michael','saint nicholas','saint stephen','saint andrew',
'saint barbara','saint lucy','saint matthew','saint mark','saint luke',
'saint james','saint elizabeth','saint francis of assisi','john the baptist',
'saint mary','sacred heart','immaculate conception','saint benedict',
'baptism of christ','the transfiguration','the assumption','the ascension',
'the last supper','the annunciation','ecce homo','christ carrying the cross',
'the pietà','saint jerome in the wilderness','saint roch','saint charles borromeo',
'saint philip neri','saint ignatius','saint francis xavier','saint bridget',
'the martyrdom','the holy trinity','supper at emmaus','tobias and the angel',
'moses','abraham and isaac','judith','the visitation','doubting thomas',
'angels','adoration','the virgin','the crucifixion of christ',
]
RELEVANT=(
'saint','sainte','st. ','saints','christ','jesus','holy','virgin','madonna','mary','maria',
'angel','archangel','annunciat','nativity','adoration','crucifix','resurrect',
'pentecost','ascension','assumption','pieta','pietà','deposition','lamentation',
'passion','baptism','transfigur','apostle','martyr','immaculate','magdalen',
'trinity','emmaus','moses','abraham','tobias','judith','jacob','noah','daniel',
'prophet','the visitation','holy spirit','john the baptist','the last supper',
'ecce homo','gospel','eucharist','saintly','saintliness'
)
NEGATIVE_TITLE=('saint louis missouri','st. louis river','st. paul city','st. petersburg',
'st. louis exposition','saint george island','saint lucia landscape','mount saint helens',
'church at','cathedral view','view of saint','portrait of st.','study of a horse',
'saint quentin landscape','saint tropez','saint cloud','saint peter basilica','christmas card')
NEGATIVE_ARTIST=('el greco','fra angelico')
FAVOURITE=('rubens','van dyck','champaigne','caravaggio','ribera','zurbar','murillo',
'carracci','preti','solimena','guido reni','luca giordano','vouet','de la tour',
'jordaens','guercino','gentileschi','tiepolo','tintoretto','cavallino',
'veronese','correggio','lanfranco','cossiers','strozzi','dolci','boucher',
'le brun','poussin','raffaello','velazquez','velázquez','rembrandt')
def low(s):return re.sub(r'\s+',' ',str(s or '').strip()).lower()
def req(url,limit=6000000,timeout=18,accept='application/json',image=False):
 u=urllib.parse.urlparse(url)
 if u.scheme!='https' or u.hostname not in ('api.artic.edu','www.artic.edu'):raise ValueError('INVALID_SOURCE_HOST')
 if image and u.hostname!='www.artic.edu':raise ValueError('IMAGE_NOT_OFFICIAL_IIIF')
 q=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':accept,'Range':'bytes=0-15'} if image else {'User-Agent':UA,'Accept':accept})
 with urllib.request.urlopen(q,timeout=timeout) as r:
  if image:
   header=r.headers.get('Content-Type','')
   b=r.read(16)
   return (r.status,header,b)
  data=r.read(limit+1)
 if len(data)>limit:raise ValueError('LARGE_SOURCE_METADATA')
 return json.loads(data.decode('utf8'))
def acceptable(x):
 id=x.get('id')
 if not isinstance(id,int):return False
 if x.get('is_public_domain') is not True:return False
 if not isinstance(x.get('image_id'),str) or not re.fullmatch('[0-9a-f-]{30,48}',x['image_id']):return False
 if low(x.get('artwork_type_title'))!='painting':return False
 medium=low(x.get('medium_display'))
 if not any(z in medium for z in ('oil on','tempera on','distemper on','oil and tempera on','acrylic on')):
  return False
 if any(z in medium for z in ('vellum','parchment','manuscript','book of hours','illuminated','ink on','print on','engraving')):
  return False
 title=low(x.get('title'))
 if any(z in title for z in NEGATIVE_TITLE):return False
 if not any(z in title for z in RELEVANT):return False
 artist=low(x.get('artist_title'))
 if any(z in artist for z in NEGATIVE_ARTIST):return False
 return True
def priority(x):
 a=low(x.get('artist_title'));med=low(x.get('medium_display'));t=low(x.get('title'))
 # Ordering is a curation research queue, NOT an aesthetic grade.
 return (0 if any(v in a for v in FAVOURITE) else 1,
  0 if any(v in t for v in ('christ','virgin','magdalen','crucifix','saint','annunciation','adoration')) else 1,
  0 if 'oil on canvas' in med else 1, t,x['id'])
def image_url(id):return 'https://www.artic.edu/iiif/2/'+id+'/full/560,/0/default.jpg'
def image_check(url):
 try:
  status,ct,begin=req(url,timeout=17,accept='image/jpeg',image=True)
  return (status in (200,206) and ct.startswith('image/') and begin.startswith(bytes.fromhex('ffd8')),
   'http='+str(status)+' content='+ct)
 except Exception as e:return (False,type(e).__name__+': '+str(e)[:160])
def main():
 pa=argparse.ArgumentParser()
 pa.add_argument('--target',type=int,default=250)
 pa.add_argument('--pages-per-term',type=int,default=3)
 pa.add_argument('--per-page',type=int,default=85)
 pa.add_argument('--max-requests',type=int,default=205)
 pa.add_argument('--max-image-checks',type=int,default=520)
 pa.add_argument('--delay',type=float,default=.11)
 p=pa.parse_args()
 assert 200<=p.target<=300 and 1<=p.pages_per_term<=4 and 1<=p.per_page<=100 and 25<=p.max_requests<=240
 b3=json.loads(B3.read_text(encoding='utf8'));user=json.loads(PREVIOUS.read_text(encoding='utf8'))
 canon=json.loads(CANON.read_text(encoding='utf8'))
 assert len(b3['rows'])==250 and user['sourceRecordCount']==60 and len(canon['main_records'])==383
 idsB3={x['id'] for x in b3['rows']}
 excluded=idsB3|{x['sourceId'] for key in ('imports','rejects') for x in user[key]}
 assert len(excluded)==310
 oldArtic=set()
 for x in canon['main_records']:
  for z in ('source_page','source_url','work_url'):
   hit=re.search(r'artic\.edu/artworks/(\d+)',str(x.get(z,'')))
   if hit:oldArtic.add(int(hit.group(1)))
 objects={};log=[];fail=[];calls=0
 for term in TERMS:
  for page in range(1,p.pages_per_term+1):
   if calls>=p.max_requests:break
   args={'q':term,'query[term][is_public_domain]':'true','limit':str(p.per_page),
     'page':str(page),'fields':FIELDS}
   url=HOST+'?'+urllib.parse.urlencode(args)
   calls+=1
   try:
    data=req(url)
    raw=data.get('data') or []
    accepted=0
    for x in raw:
     if not acceptable(x):continue
     id=x['id'];sourceid='artic:'+str(id)
     if sourceid in excluded or id in oldArtic or id in objects:continue
     objects[id]=x;accepted+=1
    log.append({'term':term,'page':page,'sourceReturned':len(raw),
      'newPaintingObjects':accepted,'reportedTotal':(data.get('pagination') or {}).get('total')})
    if len(raw)<p.per_page:break
   except Exception as e:
    fail.append({'stage':'API_SEARCH','term':term,'page':page,'reason':type(e).__name__+': '+str(e)[:150]})
    break
   time.sleep(p.delay)
  if calls>=p.max_requests:break
 ordered=sorted(objects.values(),key=priority)
 selected=[];checks=0
 for o in ordered:
  if len(selected)>=p.target or checks>=p.max_image_checks:break
  url=image_url(o['image_id'])
  checks+=1
  good,why=image_check(url)
  if not good:
   fail.append({'stage':'IMAGE_HEADERS','id':o['id'],'reason':why})
   continue
  selected.append({'id':'artic:'+str(o['id']),'provider':'ArtInstituteChicago',
   'museum':'Art Institute of Chicago','objectId':str(o['id']),
   'accession':o.get('main_reference_number'),'title':o.get('title'),
   'artist':o.get('artist_title') or o.get('artist_display') or '',
   'medium':o.get('medium_display'),'date':o.get('date_display'),
   'objectUrl':'https://www.artic.edu/artworks/'+str(o['id']),
   'imageId':o['image_id'],'previewURL':url,
   'rightsBasis':'ARTIC_IS_PUBLIC_DOMAIN_TRUE_OFFICIAL_IIIF_IMAGE_ID',
   'rightsForProduction':'OFFICIAL_PD_SOURCE__EXACT_NATIVE_PHOTO_QA_OUTSTANDING',
   'editorialSelection':None,'productionImported':False})
  time.sleep(p.delay)
 assert not any(x['id'] in excluded for x in selected)
 assert len({x['id'] for x in selected})==len(selected)
 document={'schema':'AO_SACRED_ART_B4_ARTIC_250_IMAGE_VERIFIED_V1','date':'2026-10-29',
  'batchId':'B4','targetSize':p.target,'batchReady':200<=len(selected)<=300,
  'priorBatchB3CardCount':len(idsB3),'priorFinalized60Count':60,
  'source':'Art Institute of Chicago official public REST API and public domain IIIF image service',
  'counts':{'uniqueImageVisiblePaintings':len(selected),'newMuseum':'Art Institute of Chicago',
   'metadataPaintings':len(objects),'searchesAttempted':calls,
   'imageHeadersChecked':checks,'imageCheckErrors':sum(x['stage']=='IMAGE_HEADERS' for x in fail),
   'sourceErrors':len(fail),'overlapWithPrior310':0,
   'newUserAestheticApprovals':0,'newArtworkRejections':0,'productionImports':0},
  'gates':{'materialPaintingRequired':True,'museumArtworkPublicDomainRequired':True,
    'officialImageIdAndIIIFRequired':True,'sourceImageHeaderChecked':True,
    'nativePhotoQualityCertified':False,'sourceImagesDownloadedAndStored':0,
    'noExistingArtUserDecisionChanged':True,'noImplicitRejection':True,
    'providerIsOneOfPreviouslyRegistered186':True},
  'searchLog':log,'errors':fail[:140],'rows':selected}
 OUT.write_text(json.dumps(document,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
 DOC.write_text('# Sacred Art — B4 Art Institute of Chicago, 250-work gallery\n\n'
  '- Target: **'+str(p.target)+'**. Verified distinct and image-viewable paintings: **'+str(len(selected))+'**.\n'
  '- Official AIC public domain source metadata, classification Painting, and IIIF image header check.\n'
  '- Earlier 250 B3 cards and all 60 earlier completed decisions excluded; zero overlap.\n'
  '- No source image originals stored. No user selection, automatic rejection or production import made.\n'
  '- Thematic title matching and museum provenance are selection candidates, NOT actual aesthetic ratings.\n'
  '- Image originals and final quality/frames are not yet certified. **€0**.\n',encoding='utf8')
 print(json.dumps({'count':document['counts'],'ready':document['batchReady'],
  'errors':fail[:5],'sample':[{'id':x['id'],'title':x['title'],'artist':x['artist']} for x in selected[:7]]},ensure_ascii=False)[:4500])
if __name__=='__main__':main()
