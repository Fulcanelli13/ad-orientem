#!/usr/bin/env python3
"""Replace manuscript leaves in B3 with individually checked KMSKA paintings.
Does not re-fetch, overwrite or release 228 already verified review images.
"""
import importlib.util,json,re,time
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
D=ROOT/'data/calendar'
TARGET=D/'sacred-art-250-review-source-b3-20261029.v1.json'
SRC=D/'sacred-art-kmska-cleveland-60page-original-evidence-20261029.v1.json'
USER=D/'sacred-art-20261029-user-60-import-reject-ledger.v1.json'
SNAPSHOT=D/'sacred-art-250-review-b3-first-source-snapshot-20261029.v1.json'
module_path=ROOT/'scripts/art/prepare-sacred-art-250-batch-b3-20261029.py'
spec=importlib.util.spec_from_file_location('museum250',module_path)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
out=json.loads(TARGET.read_text(encoding='utf8'))
old=json.loads(SNAPSHOT.read_text(encoding='utf8'))
assert len(out['rows'])==250 and len(old['rows'])==250
assert {r['id'] for r in out['rows']}=={r['id'] for r in old['rows']}
source=json.loads(SRC.read_text(encoding='utf8'))
user=json.loads(USER.read_text(encoding='utf8'))
excluded={r['sourceId'] for key in ('imports','rejects') for r in user[key]}
assert len(excluded)==60
badMedium=('vellum','parchment','manuscript','folio','leaf from','book of hours',
 'antiphonary','gradual','bifolium','bifolio','bifolia','ink on','ink,',
 'gouache on paper','tempera on paper','tempera, and gold','tempera and gold on vellum')
badTitle=('book of hours','bifolio','bifolia','bifolium','antiphonary','leaf from',
 'folio ','illuminated initial','initial a,','initial m,','initial o,','antiphonal',
 'a mirror of holiness','blazoen','coat of arms')
def painting(r):
 title=str(r['title']).lower();medium=str(r.get('medium','')).lower()
 if any(x in title for x in badTitle):return False
 if any(x in medium for x in badMedium):return False
 if r['provider']=='Cleveland':
  if not ('oil on ' in medium or ('tempera' in medium and any(x in medium for x in ('wood','panel','canvas')))):return False
 if r['provider']=='KMSKA' and not r['manifestUrl'].startswith('https://iiif.kmska.be/iiif/2/'):return False
 return True
preserved=[r for r in out['rows'] if painting(r)]
removed=[{'id':r['id'],'title':r['title'],'medium':r['medium'],'reason':'MANUSCRIPT_OR_NONPAINTING_MATERIAL'} for r in out['rows'] if not painting(r)]
todo=250-len(preserved)
assert 1<=todo<=100,(len(preserved),todo)
identities={x['id'] for x in out['rows']}|excluded
extra=[]
errors=[]
kraw=[x for x in source['records'] if x['provider']=='KMSKA'
      and x['id'] not in identities and x['manifestCandidates'] and
      any(m.norm(v) in ('painting','schilderij','peinture') for v in x['sourceMediumIndicators'])]
kraw.sort(key=m.k_priority)
for x in kraw:
 if len(extra)>=todo:break
 if any(t in str(x['title']).lower() for t in badTitle):continue
 u=x['manifestCandidates'][0]
 if not u.startswith('https://iiif.kmska.be/iiif/2/'):continue
 try:
  image,licence,author,md=m.get_iiif_picture(u)
  ok,reason=m.image_responds(image,timeout=16)
  if not ok:
   errors.append({'id':x['id'],'reason':reason,'stage':'IMAGE_RESPONSE'});continue
  extra.append({'id':x['id'],'provider':'KMSKA','museum':'Royal Museum of Fine Arts Antwerp',
   'objectId':x['objectId'],
   'accession':next((v for k,v in md.items() if 'inventory' in k or 'inventaris' in k),None),
   'title':x['title'],'artist':x.get('artist') or author or '',
   'medium':'painting (OAI LIDO classification)',
   'objectUrl':x['objectUrl'],'manifestUrl':u,'previewURL':image,
   'rightsBasis':'KMSKA_PUBLIC_IIIF_MANIFEST_'+('UND' if 'rightsstatements.org/page/und/' in licence else 'OTHER'),
   'rightsStatement':licence,'rightsForProduction':'HOLD_UNTIL_EXACT_PHOTO_LICENCE_RECONCILED',
   'reviewStatus':'UNREVIEWED','productionImported':False})
 except Exception as e:
  errors.append({'id':x['id'],'reason':type(e).__name__+': '+str(e)[:160],'stage':'MANIFEST'})
 time.sleep(.08)
rows=preserved+extra
rows.sort(key=lambda x:(x['provider']!='KMSKA',x['id']))
assert len(rows)==250,(len(preserved),len(extra),len(kraw),errors[-5:])
assert len({x['id'] for x in rows})==250
assert not ({x['id'] for x in rows}&excluded)
assert all(painting(x) for x in rows)
assert all(x['previewURL'].startswith('https://') for x in rows)
counts=Counter(x['provider'] for x in rows)
out['rows']=rows
out['counts']['totalUniqueReviewCandidates']=len(rows)
out['counts']['byMuseum']=dict(counts)
out['counts']['KMSKAManifestValidated']=counts['KMSKA']
out['counts']['ClevelandIncluded']=counts['Cleveland']
out['counts']['nonPaintingMetadataFalsePositivesRemoved']=len(removed)
out['counts']['repairReplacementPaintings']=len(extra)
out['counts']['sourceErrors']+=len(errors)
out['errors']=(out['errors']+errors)[:150]
out['batchReady']=True
out['integrityReview']={'sourceSnapshot':str(SNAPSHOT.relative_to(ROOT)),
 'unreviewableSourceEntries':removed,'replacements':len(extra),
 'noUserApprovedOrRejectedObjectIncluded':True,
 'sourceImageHeadersCheckedForAllReplacements':True,
 'noSourceImageFilesDownloaded':True,
 'titleAndMaterialPrecision':'exclude manuscript leaves and paper miniatures from painting intake'}
TARGET.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
p=ROOT/'docs/SACRED_ART_250_WORK_REVIEW_B3_20261029.md'
p.write_text('# Sacred Art — painting-only B3 review batch\n\n'
 'Verified official preview responses for **250 distinct source artworks**.\n\n'
 '- KMSKA Antwerp **'+str(counts['KMSKA'])+'** (research display, exact photo-rights held for production).\n'
 '- Cleveland Museum of Art **'+str(counts['Cleveland'])+'** (official per-object CC0 source claim).\n'
 '- Rejected/imported prior 60 records never re-offered.\n'
 '- **'+str(len(removed))+'** false-positive manuscript leaves or non-paintings removed.\n'
 '- **'+str(len(extra))+'** additional KMSKA paintings validated and substituted.\n'
 '- Original photos downloaded for republication: **0**. Artworks approved: **0**. Production imports: **0**.\n'
 '- Research audit includes original 250 result and discarded source IDs for provenance.\n',encoding='utf8')
print(json.dumps({'total':len(rows),'museums':dict(counts),'removed':len(removed),
 'additional':len(extra),'errors':len(errors),'sampleExtra':[(x['id'],x['title']) for x in extra[:6]]}))
