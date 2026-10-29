#!/usr/bin/env python3
"""Build Ad Orientem Sacred Art Batch B5 from KMSKA OAI pages AFTER Batch B4.

Strict disjointness by OAI page: B4 reads pages 1-180 (zero-based 0..179);
B5 skips those pages and scans only page 181 onward. Never re-offer any of
the 250 B3 objects or 60 previously finalised imports/rejects.
KMSKA IIIF image rights may be UND: research review ONLY; no production rights.
Fetch only metadata, manifests and a 16-byte JPEG signature, never original files.
"""
from __future__ import annotations
import argparse, importlib.util, json, re, time, urllib.parse, urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from collections import Counter

ROOT=Path(__file__).resolve().parents[2]
D=ROOT/'data/calendar'
OUT=D/'sacred-art-kmska-next-250-b5-20261029.v1.json'
REPORT=ROOT/'docs/SACRED_ART_KMSKA_B5_250_SOURCE_QA_20261029.md'
B3=D/'sacred-art-250-review-source-b3-20261029.v1.json'
B4=D/'sacred-art-kmska-next-250-b4-20261029.v1.json'
PREVIOUS=D/'sacred-art-20261029-user-60-import-reject-ledger.v1.json'
CANON=D/'sacred-art-curator-queues-383-20261029.v1.json'
UA='AdOrientem-SacredArt-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
OAI='https://datahub.vlaamsekunstcollectie.be/oai/'
KSET='institution:koninklijk_museum_voor_schone_kunsten_antwerpen'
B4_LAST_ZERO_BASED_PAGE=179
NONPAINT_TITLE=('blazoen','coat of arms','manuscript','prentenboek','boekband','portret van een stad',
 'boekillustratie','kunstboek','medaille','gravure','prent','prenten','atlas','bidprent')
CATHOLIC_TITLE=('christus','jezus','maria','madonna','maagd','heilige','heiligen','aanbidding',
 'kruis','kruisiging','apostel','sint ','christ','virgin','saint','saints','holy','adoration',
 'nativity','resurrection','baptism','saint john','christus','de kruis','engelen','hemelvaart',
 'verkondiging','maria met','madonna','johannes','jeronimus','franciscus','anna','apostelen')
FAV=('rubens','van dyck','champaigne','caravaggio','ribera','zurbar','murillo','carracci',
 'preti','solimena','reni','giordano','vouet','jordaens','guercino','gentileschi',
 'tintoretto','strozzi','lanfranco','cossiers','de crayer','breughel','brueghel','francken',
 'de vos','van oost','seghers','snyders','teniers')
def module(path,name):
 spec=importlib.util.spec_from_file_location(name,ROOT/path)
 m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
oai=module('scripts/art/sacred-art-kmska-cleveland-b1-20261029.py','ao_kmska_oai_b5')
iiif=module('scripts/art/prepare-sacred-art-250-batch-b3-20261029.py','ao_kmska_iiif_b5')
def norm(v):return re.sub(r'\s+',' ',str(v or '').lower()).strip()
def tag(e):return e.tag.split('}')[-1]
def official_source(url,timeout=17):
 u=urllib.parse.urlparse(url)
 if u.scheme!='https' or u.hostname!='datahub.vlaamsekunstcollectie.be':
  raise ValueError('UNTRUSTED_MUSEUM_OAI_SOURCE')
 req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/xml'})
 with urllib.request.urlopen(req,timeout=timeout) as resp:
  data=resp.read(3200001)
 if len(data)>3200000:raise ValueError('OAI_RESPONSE_TOO_LARGE')
 return ET.fromstring(data)
def get_page(token=None):
 query={'verb':'ListRecords','resumptionToken':token} if token else {'verb':'ListRecords','metadataPrefix':'oai_lido','set':KSET}
 root=official_source(OAI+'?'+urllib.parse.urlencode(query))
 errors=[str(e.text) for e in root.iter() if tag(e)=='error']
 if errors:raise ValueError('OAI_SOURCE_ERROR:'+repr(errors)[:180])
 recs=[e for e in root.iter() if tag(e)=='record']
 next_token=next((str(e.text).strip() for e in root.iter()
    if tag(e)=='resumptionToken' and e.text and str(e.text).strip()),None)
 return recs,next_token
def preview_check(url,timeout=17):
 p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname!='iiif.kmska.be' or '/full/560,/0/default.jpg' not in p.path:
  return False,'UNTRUSTED_PREVIEW_RESOURCE'
 try:
  req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'image/jpeg','Range':'bytes=0-15'})
  with urllib.request.urlopen(req,timeout=timeout) as r:
   mime=r.headers.get('Content-Type','')
   signature=r.read(16)
   ok=r.status in (200,206) and mime.startswith('image/') and signature.startswith(bytes.fromhex('ffd8'))
   return ok,'HTTP_'+str(r.status)+'_'+mime
 except Exception as e:return False,type(e).__name__+':'+str(e)[:125]
def rank(record):
 a=norm(record.get('artist'));t=norm(record.get('title'))
 meta=' '.join(norm(x) for x in record.get('sourceMediumIndicators') or [])
 century=0 if ('17de eeuw' in meta or '17th century' in meta) else 1 if ('16de eeuw' in meta or '16th century' in meta) else 2
 return (0 if any(f in a for f in FAV) else 1,century,0 if any(t.startswith(w) for w in ('christ','heilige','maria','sint ','madonna')) else 1,record['id'])
def build():
 p=argparse.ArgumentParser()
 p.add_argument('--target',type=int,default=250)
 p.add_argument('--max-pages',type=int,default=540)
 p.add_argument('--start-zero-page',type=int,default=180)
 p.add_argument('--delay',type=float,default=.11)
 p.add_argument('--max-image-checks',type=int,default=630)
 args=p.parse_args()
 assert 200<=args.target<=300 and args.start_zero_page==B4_LAST_ZERO_BASED_PAGE+1
 assert 270<=args.max_pages<=600 and 200<=args.max_image_checks<=900

 b3=json.loads(B3.read_text(encoding='utf8'))
 prior=json.loads(PREVIOUS.read_text(encoding='utf8'))
 canonical=json.loads(CANON.read_text(encoding='utf8'))
 assert len(b3['rows'])==250 and prior['sourceRecordCount']==60 and len(canonical['main_records'])==383
 excluded={r['id'] for r in b3['rows']}|{r['sourceId'] for key in ('imports','rejects') for r in prior[key]}
 assert len(excluded)==310
 b4IDs=set()
 if B4.exists():
  b4=json.loads(B4.read_text(encoding='utf8'))
  b4IDs={r['id'] for r in b4['rows']}
  assert not b4IDs&excluded
  excluded|=b4IDs

 raw=[];observed=set();errors=[];source_pages=0
 token=None;pages_after_split=0;all_object_count=0
 # A deterministic disjoint partition of the OAI sequence, rather than
 # guessing which artwork IDs a parallel workflow will eventually choose.
 for page in range(args.max_pages):
  try:records,token=get_page(token)
  except Exception as e:
   errors.append({'pageIndex':page,'stage':'OAI_PAGE','error':type(e).__name__+':'+str(e)[:160]})
   break
  source_pages+=1
  if page>=args.start_zero_page:
   pages_after_split+=1
   all_object_count+=len(records)
   for node in records:
    candidate=oai.oai_rec(node)
    if candidate is None or candidate['id'] in excluded or candidate['id'] in observed:continue
    observed.add(candidate['id'])
    if not candidate.get('manifestCandidates'):continue
    types={norm(v) for v in candidate.get('sourceMediumIndicators') or []}
    if not types.intersection({'painting','schilderij','peinture'}):continue
    title=norm(candidate.get('title'))
    if any(z in title for z in NONPAINT_TITLE):continue
    if any(z in title for z in ('krishna','buddha','shiva','vishnu','islam','hindu')):continue
    # The original KMSKA LIDO source record must have explicit Christian title terms;
    # unknown paintings or civic subjects are held rather than classified as Catholic.
    if not any(z in ' '.join([title]+[norm(t) for t in candidate.get('titleAlternates') or []]) for z in CATHOLIC_TITLE):continue
    candidate['discoveryOaiZeroBasedPage']=page
    raw.append(candidate)
  if not token:break
  time.sleep(args.delay)
 # Image verification in source priority order. Distinct object IDs and IIIF image resources.
 raw.sort(key=rank)
 included=[];used_images=set();image_count=0
 for candidate in raw:
  if len(included)>=args.target or image_count>=args.max_image_checks:break
  manifest=candidate['manifestCandidates'][0]
  if not manifest.startswith('https://iiif.kmska.be/iiif/2/'):continue
  image_count+=1
  try:
   img,license,author,fields=iiif.get_iiif_picture(manifest)
   if img in used_images:continue
   ok,reason=preview_check(img)
   if not ok:
    errors.append({'id':candidate['id'],'stage':'IIIF_IMAGE','error':reason})
    continue
   used_images.add(img)
   included.append({
    'id':candidate['id'],'provider':'KMSKA','museum':'Royal Museum of Fine Arts Antwerp',
    'objectId':candidate['objectId'],
    'accession':next((v for k,v in fields.items() if 'inventory' in k or 'inventaris' in k),None),
    'title':candidate['title'],'artist':candidate.get('artist') or author or '',
    'medium':'Painting (official KMSKA OAI LIDO object classification)',
    'objectUrl':candidate['objectUrl'],'manifestUrl':manifest,'previewURL':img,
    'rightsBasis':'KMSKA_OFFICIAL_IIIF_RESEARCH_PREVIEW_LICENSE_NOT_CLEARED',
    'rightsStatement':license,
    'rightsForProduction':'HOLD_UNTIL_EXACT_SOURCE_PHOTOGRAPH_RIGHTS_RESOLVED',
    'oaiPageIndex':candidate['discoveryOaiZeroBasedPage'],
    'aestheticGrade':None,'editorialSelection':None,'productionImported':False
   })
  except Exception as e:
   errors.append({'id':candidate['id'],'stage':'IIIF_MANIFEST','error':type(e).__name__+':'+str(e)[:145]})
  time.sleep(args.delay)
 ids={r['id'] for r in included}
 assert not ids&excluded and len(ids)==len(included)==len(used_images)
 assert all(x['oaiPageIndex']>=args.start_zero_page for x in included)
 counts={'imageVerifiedNewPaintingCards':len(included),'oaiTotalPagesScanned':source_pages,
  'oaiPagesAfterB4Split':pages_after_split,'oaiRawObjectsAfterB4Split':all_object_count,
  'religiousPaintingMetadataCandidates':len(raw),
  'IIIFImageResponsesChecked':image_count,'sourceErrors':len(errors),
  'B3ReviewedIdsExcluded':250,'earlierCompletedIdsExcluded':60,
  'B4SourceIdsExcludedWhenAvailable':len(b4IDs),
  'newEditorDecisions':0,'newRejections':0,'productionImports':0}
 result={'schema':'AO_SACRED_ART_KMSKA_B5_250_NONOVERLAP_V1','date':'2026-10-29',
  'batchId':'B5','targetSize':args.target,'batchReady':200<=len(included)<=300,
  'pagePartition':{'B4IndexRange':'0..179 inclusive','B5IndexRange':'180 onward',
   'strictlyDisjointByOaiPage':True,'requiresB4Output':False},
  'counts':counts,
  'gates':{'officialIIIFSourceImageHeaderVerified':True,'sourceObjectTypePaintingRequired':True,
   'noSourceImageOriginalsStored':True,'allKMSKASourcePhotoRightsHeldForProduction':True,
   'noAutoAestheticApprovals':True,'noUserReviewedIDsReoffered':True},
  'errors':errors[:160],'rows':included}
 OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 REPORT.write_text('# Sacred Art — Batch 5 (KMSKA continued official OAI)\n\n'
  '- Target **'+str(args.target)+'** distinct new paintings; verified image-bearing cards **'+str(len(included))+'**.\n'
  '- OAI range: pages 181 onward only; B4 is pages 1–180. Both are zero-cost official catalogue reads.\n'
  '- Scanned **'+str(source_pages)+'** total OAI pages to reach this range; new range scanned **'+str(pages_after_split)+'** pages.\n'
  '- Unique earlier B3 250 and 60 completed IDs excluded; B4 disjoint by source-page partition.\n'
  '- All source photo licences **held** for production pending exact reproduction rights; the images are research previews.\n'
  '- Native source files archived: **0**; user artistic decisions: **0**; app imports: **0**.\n'
  '- Failures and manifest evidence in machine-readable research JSON.\n',encoding='utf8')
 print(json.dumps({'counts':counts,'ready':result['batchReady'],
  'sample':[(r['id'],r['title'],r['artist'],r['oaiPageIndex']) for r in included[:6]],
  'errorExamples':errors[:4]},ensure_ascii=False)[:4300])
if __name__=='__main__':build()
