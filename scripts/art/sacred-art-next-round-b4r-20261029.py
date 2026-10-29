#!/usr/bin/env python3
"""Build NEXT actual review gallery source batch, capped at 250, from working museums.
User B3 decisions frozen and excluded. All images are external official preview URLs.
Never use rejected works, treat KMSKA UND images as research-only, no automatic import.
"""
import json,re,time,urllib.parse,urllib.request
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
OUT=D/'sacred-art-b4-multimuseum-working-review-20261029.v1.json'
REPORT=ROOT/'docs/SACRED_ART_B4_MULTIMUSEUM_REVIEW_QA_20261029.md'
B5=D/'sacred-art-kmska-next-250-b5-20261029.v1.json'
MET=D/'sacred-art-met-250-b4-20261029.v1.json'
PRIOR60=D/'sacred-art-20261029-user-60-import-reject-ledger.v1.json'
PRIOR250=D/'sacred-art-b3-final-user-decisions-20261029.v1.json'
B3=D/'sacred-art-250-review-source-b3-20261029.v1.json'
UA='AdOrientem-SacredArt-MuseumResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
API='https://openaccess-api.clevelandart.org/api/artworks/'
CMA_QUERIES=['christ','saint','virgin','madonna','mary','magdalene','the holy family','annunciation','nativity','adoration','crucifixion',
'resurrection','deposition','lamentation','pieta','saint jerome','saint john','saint francis',
'saint peter','saint paul','saint joseph','saint catherine','saint barbara','saint nicholas',
'saint augustine','saint sebastian','saint george','saint francis xavier','saint teresa',
'holy family','the ascension','immaculate conception','assumption','saint anthony',
'blessed virgin','angels','archangel','john the baptist','the visitation','saint ambrose',
'penitent','ecce homo','last supper','supper at emmaus','holy trinity','saint benedict',
'martyrdom','saints','the crucifixion','angel','apostles','biblical','saint bridget',
'saint elizabeth','saint thomas','sacred heart','saint michael','saint philip',
'saint stephen','saint lawrence','saint dominic','saint gregory','saint lucy','st john',
'baptism of christ','saint matthew','saint luke','saint mark','saint james','the transfiguration',
'the annunciation','the madonna','mother of god','adoration of the magi','angel gabriel',
'virgin and child','holy spirit','christ child','holy women','joseph','the cross']
RELEVANT=('christ','crucifix','saint ','st. ','saints','jesus','holy family','virgin','madonna','magdalen',
'annunc','nativity','adoration','resurrect','pieta','pietà','baptism','eucharist','pentecost','sacred heart',
'assumption','ascension','trinity','apostle','martyr','holy spirit','last supper','lamentation',
'deposition','john the baptist','ecce homo','visitation','immaculate','holy mother','mother of god',
'angel gabriel','saintly','st catherine','st peter','st paul','st francis','st john','holy women')
NEGATIVE=('krishna','buddha','vishnu','ganesha','shiva','shinto','hindu','quran','islamic','bodhisattva',
'confucius','st. louis river','st. petersburg','saint tropez','saint louis city','st. paul town')
BAD_MEDIUM=('manuscript','print','engraving','lithograph','etched','etching','mezzotint',
'parchment','vellum','sculpture','bronze','gouache on paper','tempera on paper','woodcut',
'photograph','drawing','sheet of','medal','bifolium','book of hours','clay','terracotta')
FAV=('rubens','van dyck','champaigne','caravaggio','ribera','zurbar','murillo','carracci',
'preti','solimena','reni','giordano','vouet','jordaens','guercino','gentileschi',
'tintoretto','cavallino','strozzi','lanfranco','poussin','de la tour','de crayer',
'cossiers','seghers','tiepolo','barocci','veronese','pietro da cortona')
def norm(s):return re.sub(r'\s+',' ',str(s or '')).strip().lower()
def get(url,size=9000000,timeout=17):
 p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname!='openaccess-api.clevelandart.org':raise ValueError('UNTRUSTED_API_HOST')
 rq=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json'})
 with urllib.request.urlopen(rq,timeout=timeout) as r: data=r.read(size+1)
 if len(data)>size:raise ValueError('SOURCE_RESULT_TOO_LARGE')
 return json.loads(data.decode('utf8'))
def eligible(x):
 if x.get('share_license_status')!='CC0':return False
 id=x.get('id')
 if not isinstance(id,int):return False
 title=norm(x.get('title'));m=norm(x.get('technique'))
 if any(b in title for b in NEGATIVE):return False
 if not any(q in title for q in RELEVANT):return False
 if not ('oil on ' in m or 'tempera on panel' in m or 'tempera on wood' in m or 'oil and tempera' in m):
  return False
 if any(b in m for b in BAD_MEDIUM):return False
 creators=x.get('creators') or []
 artist='; '.join(v.get('description','') for v in creators if isinstance(v,dict))
 if any(a in norm(artist) for a in ('el greco','fra angelico')):return False
 link=((x.get('images') or {}).get('web') or {}).get('url') or ''
 if not link.startswith('https://openaccess-cdn.clevelandart.org/'):return False
 return artist,link
def rank(x):
 a=norm(x['artist']);title=norm(x['title']);med=norm(x['medium'])
 return (0 if any(f in a for f in FAV) else 1,
         0 if ('christ' in title or 'saint' in title or 'virgin' in title) else 1,
         0 if 'oil on canvas' in med else 1,title,x['id'])
def main():
 import argparse
 p=argparse.ArgumentParser()
 p.add_argument('--target',type=int,default=250)
 p.add_argument('--max-queries',type=int,default=76)
 p.add_argument('--pages',type=int,default=5)
 p.add_argument('--limit',type=int,default=100)
 p.add_argument('--delay',type=float,default=.05)
 a=p.parse_args()
 assert 75<=a.target<=300 and 5<=a.max_queries<=100 and 1<=a.pages<=8
 old250=json.loads(PRIOR250.read_text(encoding='utf8'))
 old60=json.loads(PRIOR60.read_text(encoding='utf8'))
 b3=json.loads(B3.read_text(encoding='utf8'))
 assert old250['sourceCardCount']==250 and old250['completeBatch']
 assert len(old250['imports'])==53 and len(old250['withCorrections'])==37 and len(old250['rejects'])==160
 excluded=set(old250['imports'])|set(old250['withCorrections'])|set(old250['rejects'])
 excluded|={x['sourceId'] for group in ('imports','rejects') for x in old60[group]}
 assert len(excluded)==310
 assert {r['id'] for r in b3['rows']}<=excluded

 rows=[]; errors=[];seen=set(excluded);imageSet=set()
 # First retain independently source-checked previous research that user has NOT seen.
 k=json.loads(B5.read_text(encoding='utf8'))
 for x in k['rows']:
  if x['id'] in seen:continue
  if not x['previewURL'].startswith('https://iiif.kmska.be/'):continue
  seen.add(x['id']);imageSet.add(x['previewURL'])
  rows.append({'id':x['id'],'provider':'KMSKA','sourceInstitution':x['museum'],
   'objectId':x['objectId'],'accession':x.get('accession'),
   'title':x['title'],'artist':x['artist'],'medium':x['medium'],
   'objectUrl':x['objectUrl'],'previewURL':x['previewURL'],
   'rightsBasis':'KMSKA_EXACT_IIIF_UND__RESEARCH_ONLY',
   'rightsHold':True,'productionImported':False})
 # Original Met 2026 research passed actual preview checks before 403, retain the verified.
 if MET.exists():
  met=json.loads(MET.read_text(encoding='utf8'))
  for x in met['rows']:
   if x['id'] in seen or len(rows)>=a.target:continue
   if not x['previewURL'].startswith('https://images.metmuseum.org/'):continue
   seen.add(x['id']);imageSet.add(x['previewURL'])
   rows.append({'id':x['id'],'provider':'MetMuseum','sourceInstitution':x['museum'],
    'objectId':x['objectId'],'accession':x.get('accession'),
    'title':x['title'],'artist':x['artist'],'medium':x['medium'],
    'objectUrl':x['objectUrl'],'previewURL':x['previewURL'],
    'rightsBasis':'MET_EXACT_OBJECT_PD_SOURCE_JPEG_CHECKED',
    'rightsHold':False,'productionImported':False})
 cma={};queryLog=[];calls=0
 for term in CMA_QUERIES[:a.max_queries]:
  for page in range(a.pages):
   q=API+'?'+urllib.parse.urlencode({'q':term,'has_image':1,'limit':a.limit,'skip':page*a.limit})+'&cc0'
   try:
    d=get(q)
    records=d.get('data') or []
    new=0
    for x in records:
     id='cma:'+str(x.get('id'))
     if id in seen or id in cma:continue
     info=eligible(x)
     if not info:continue
     artist,link=info
     cma[id]={'id':id,'provider':'Cleveland','sourceInstitution':'Cleveland Museum of Art',
       'objectId':str(x['id']),'accession':x.get('accession_number'),
       'title':x['title'],'artist':artist,'medium':x.get('technique'),
       'objectUrl':x.get('url') or 'https://www.clevelandart.org/art/'+str(x.get('accession_number') or x['id']),
       'previewURL':link,'rightsBasis':'CLEVELAND_EXACT_ARTWORK_CC0',
       'rightsHold':False,'productionImported':False}
     new+=1
    calls+=1
    queryLog.append({'term':term,'page':page,'returned':len(records),'newCandidates':new,
      'reportedTotal':(d.get('info') or {}).get('total')})
    if len(records)<a.limit:break
   except Exception as e:
    errors.append({'term':term,'page':page,'error':type(e).__name__+':'+str(e)[:130]})
    break
   time.sleep(a.delay)
  # Discovery should be comprehensive across the collection rather than just
  # taking first result of one search. Stop only when ample valid paintings found.
  if len(rows)+len(cma)>=a.target+50:break
 for x in sorted(cma.values(),key=rank):
  if len(rows)>=a.target:break
  if x['id'] in seen or x['previewURL'] in imageSet:continue
  rows.append(x);seen.add(x['id']);imageSet.add(x['previewURL'])
 assert len({x['id'] for x in rows})==len(rows)
 assert len({x['previewURL'] for x in rows})==len(rows)
 assert not ({x['id'] for x in rows}&excluded)
 counts=Counter(x['provider'] for x in rows)
 payload={'schema':'AO_SACRED_ART_FRESH_NEXT_REVIEW_B4_MULTI_MUSEUM_V1',
   'date':'2026-10-29','batchId':'B4R','targetSize':a.target,
   'batchReady':len(rows)>=75,'counts':{'totalNewArtworkCards':len(rows),
    'byMuseum':dict(counts),'ClevelandAllNewMetadataCandidates':len(cma),
    'ClevelandQueries':len(queryLog),'priorB3FinalRejectionsPreserved':160,
    'priorB3ImportsPreserved':53,'priorB3CorrectionsPreserved':37,
    'prior60DecisionsPreserved':60,'duplicateObjectIds':0,
    'newUserApprovals':0,'productionImports':0,'sourceErrors':len(errors)},
   'gates':{'sourceImageOriginalsStored':0,'noPreviousReviewIDsReoffered':True,
    'KMSKAImageRightsHeldForProduction':True,'noAutomaticSelections':True,
    'fullNativeOriginalPhotoQualityChecked':False,
    'previewSourcesOfficial':True},
   'searchLog':queryLog,'errors':errors[:60],'rows':rows}
 OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 REPORT.write_text('# Sacred Art — B4R, next actual review round\n\n'
  '- Distinct new image-bearing artworks: **'+str(len(rows))+'** (target '+str(a.target)+').\n'
  '- Museum breakdown: '+', '.join('%s %s'%(z,v) for z,v in counts.items())+'.\n'
  '- All 250 user-completed B3 works and earlier completed 60 decisions are excluded.\n'
  '- KMSKA research images are **NOT** image-rights-cleared for publication.\n'
  '- No images downloaded/archived, no aesthetic grades or production imports.\n'
  '- User curation is Import / Import with corrections; reject is explicit on finalization.\n',encoding='utf8')
 print(json.dumps({'counts':payload['counts'],'ready':payload['batchReady'],
    'examples':[(r['id'],r['title'],r['artist']) for r in rows[:5]],
    'errors':errors[:5]},ensure_ascii=False)[:3000])
if __name__=='__main__':main()
