#!/usr/bin/env python3
"""Ad Orientem B4 — the next 250 KMSKA source paintings, with distinct image IDs.

Continue the official Flemish Kunstcollectie KMSKA OAI set beyond previous research;
exclude ALL 250 B3 reviewed IDs and the earlier 60 finalized IDs (regardless of
future B3 decisions). Use exact source IIIF manifests + genuine JPEG headers.
KMSKA manifest UND photo rights remain HELD for production; this is editorial
review only, not image import or permission inference. Source originals never saved.
"""
import importlib.util,json,re,time,urllib.request,urllib.parse
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
OUT=D/'sacred-art-kmska-next-250-b4-20261029.v1.json'
DOC=ROOT/'docs/SACRED_ART_KMSKA_B4_250_SOURCE_QA_20261029.md'
PRIOR=D/'sacred-art-20261029-user-60-import-reject-ledger.v1.json'
B3=D/'sacred-art-250-review-source-b3-20261029.v1.json'
CANON=D/'sacred-art-curator-queues-383-20261029.v1.json'
def module(rel,name):
 p=ROOT/rel;s=importlib.util.spec_from_file_location(name,p)
 x=importlib.util.module_from_spec(s);s.loader.exec_module(x);return x
oai=module('scripts/art/sacred-art-kmska-cleveland-b1-20261029.py','aokmskacatalogue')
iiif=module('scripts/art/prepare-sacred-art-250-batch-b3-20261029.py','aokmskaimage')
UA='AdOrientem-SacredArt-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
def check(url):
 p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname!='iiif.kmska.be' or '/full/560,/0/default.jpg' not in p.path:
  return False,'UNTRUSTED_IMAGE_HOST_OR_SIZE'
 try:
  q=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'image/jpeg','Range':'bytes=0-15'})
  with urllib.request.urlopen(q,timeout=17) as r:
   mime=r.headers.get('Content-Type','');data=r.read(16)
   if r.status not in (200,206):return False,'HTTP_'+str(r.status)
  return mime.startswith('image/') and data.startswith(bytes.fromhex('ffd8')),mime
 except Exception as e:return False,type(e).__name__+':'+str(e)[:130]
def main():
 import argparse
 p=argparse.ArgumentParser()
 p.add_argument('--target',type=int,default=250)
 p.add_argument('--oai-pages',type=int,default=180)
 p.add_argument('--delay',type=float,default=.12)
 p.add_argument('--image-checks',type=int,default=700)
 a=p.parse_args()
 assert 200<=a.target<=300 and 60<a.oai_pages<=240
 b3=json.loads(B3.read_text(encoding='utf8'));prev=json.loads(PRIOR.read_text(encoding='utf8'))
 canon=json.loads(CANON.read_text(encoding='utf8'))
 assert len(b3['rows'])==250 and prev['sourceRecordCount']==60 and len(canon['main_records'])==383
 excluded={x['id'] for x in b3['rows']}|{x['sourceId'] for n in ('imports','rejects') for x in prev[n]}
 assert len(excluded)==310
 sourceErrors=[]
 raw,scope=oai.kmska_scan(a.oai_pages,a.delay,sourceErrors)
 unique={x['id']:x for x in raw}
 rows=list(unique.values())
 # No KMSKA museum-image rights are established by object title or general policy.
 filtered=[]
 for x in rows:
  if x['id'] in excluded or not x.get('manifestCandidates'):continue
  kinds={iiif.norm(v) for v in x.get('sourceMediumIndicators') or []}
  if not kinds.intersection({'painting','schilderij','peinture'}):continue
  if any(z in iiif.norm(x['title']) for z in ('blazoen','badge','coat of arms','manuscript','prentenboek')):continue
  filtered.append(x)
 filtered.sort(key=iiif.k_priority)
 final=[];err=[];checks=0;verifiedIdentifiers=set()
 for x in filtered:
  if len(final)>=a.target or checks>=a.image_checks:break
  manifest=x['manifestCandidates'][0]
  if not manifest.startswith('https://iiif.kmska.be/iiif/2/'):continue
  checks+=1
  try:
   picture,license,artist,metadata=iiif.get_iiif_picture(manifest)
   good,reason=check(picture)
   if not good:
    err.append({'id':x['id'],'error':reason,'stage':'IMAGE_PREVIEW'});continue
   if picture in verifiedIdentifiers:
    err.append({'id':x['id'],'error':'DUPLICATE_IMAGE_RESOURCE','stage':'IMAGE_DUPLICATE'});continue
   verifiedIdentifiers.add(picture)
   final.append({'id':x['id'],'provider':'KMSKA','museum':'Royal Museum of Fine Arts Antwerp',
      'objectId':x['objectId'],'accession':next((v for k,v in metadata.items() if 'inventory' in k or 'inventaris' in k),None),
      'title':x['title'],'artist':x['artist'] or artist or '',
      'medium':'Painting (official OAI LIDO object classification)',
      'objectUrl':x['objectUrl'],
      'manifestUrl':manifest,'previewURL':picture,'rightsStatement':license,
      'rightsBasis':'KMSKA_OFFICIAL_IIIF_UNDETERMINED_LICENSE__RESEARCH_VIEW_ONLY',
      'rightsForProduction':'HOLD_UNTIL_EXACT_SOURCE_PHOTOGRAPH_RIGHTS_RESOLVED',
      'editorialSelection':None,'productionImported':False})
  except Exception as e:err.append({'id':x['id'],'error':type(e).__name__+':'+str(e)[:160],'stage':'IIIF_MANIFEST'})
  time.sleep(a.delay)
 selectedIDs={x['id'] for x in final}
 assert len(selectedIDs)==len(final) and len({x['previewURL'] for x in final})==len(final)
 assert not selectedIDs.intersection(excluded)
 report={'schema':'AO_KMSKA_B4_250_NEXT_IIIF_RESEARCH_V1',
   'date':'2026-10-29','batchId':'B4','targetSize':a.target,'batchReady':len(final)>=200,
   'counts':{'distinctReviewPaintings':len(final),'scannedOaiPages':scope['pagesAttempted'],
    'allKMSKASacredMetadata':len(rows),'newMetadataAfterExcludeAndPaintingType':len(filtered),
    'imageSourceChecks':checks,'sourceOrImageIssues':len(err)+len(sourceErrors),
    'B3IdsExcluded':250,'earlierFinalizedIDsExcluded':60,
    'newImportDecisions':0,'newRejections':0,'productionImports':0},
   'gates':{'sourceMuseumKMSKAOnly':True,'imageSourceResponseChecked':True,
     'objectIsPaintingInOAILido':True,'allKMSKASourceImageRightsHeldForProduction':True,
     'originalPhotoFilesSaved':0,'previousReviewedIDsNeverReoffered':True,
     'noAestheticGradeAssigned':True,'allSourcePhotoRightsIndividuallyUnverified':True},
   'sourceScope':scope,'errors':(sourceErrors+err)[:180],'rows':final}
 OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 DOC.write_text('# Sacred Art B4 — continued KMSKA catalogue\n\n'
   '- Target '+str(a.target)+'; actual unique image-verified painting source records: **'+str(len(final))+'**.\n'
   '- OAI source pages scanned: **'+str(scope['pagesAttempted'])+'**, '+str(scope['sourceRecordsScanned'])+' source items.\n'
   '- All 250 B3 cards and all 60 finalized earlier decisions excluded, regardless of B3 choices.\n'
   '- Exact per-painting KMSKA IIIF research previews; **image licence UND = NOT cleared for production**.\n'
   '- No artwork aesthetic decisions, image originals, or app release. Cost: €0.\n',encoding='utf8')
 print(json.dumps({'counts':report['counts'],'ready':report['batchReady'],
   'sample':[(x['id'],x['title'],x['artist']) for x in final[:8]],
   'errorExamples':report['errors'][:5]},ensure_ascii=False)[:5200])
if __name__=='__main__':main()
