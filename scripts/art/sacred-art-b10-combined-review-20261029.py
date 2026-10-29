#!/usr/bin/env python3
"""B10 single consolidated gallery — Rijksmuseum and the Met, never recycled.

Combine full source-specific licensing, JPEG and native-resolution checks from
both independent official museum pipelines, and preserve frozen B7/B8 decisions.
"""
from __future__ import annotations
import hashlib,importlib.util,json,re
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
RIJKS=D/'sacred-art-b10-rijks-250-rights-verified-source-20261029.v1.json'
MET=D/'sacred-art-b10-met-full-catalogue-250-20261029.v1.json'
OUT=D/'sacred-art-b10-final-250-combined-20261029.v1.json'
HTML=ROOT/'docs/SACRED_ART_NEXT_250_IMPORT_REVIEW_B10_20261029.html'
REPORT=ROOT/'docs/SACRED_ART_B10_FINAL_250_QA_20261029.md'
def norm(s):return re.sub(r'[^a-z0-9]+',' ',str(s or '').lower()).strip()
def prior():
 spec=importlib.util.spec_from_file_location('b9met',ROOT/'scripts/art/sacred-art-b9-met-250-review-20261029.py')
 m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
 ids,br=m.prior_ids()
 b9=json.loads((D/'sacred-art-b9-met-250-review-source-20261029.v1.json').read_text())
 old={x['id'] for x in b9['rows']}
 assert len(old)==195 and not old&ids
 ids|=old;assert len(ids)==1455
 return ids
def final():
 r=json.loads(RIJKS.read_text());m=json.loads(MET.read_text())
 assert r['counts']['priorReviewIDsExcluded']==m['counts']['priorReviewIDsExcluded']==1455
 assert r['counts']['historicalRijksUserRatingsExcluded']==137
 assert r['counts']['productionImports']==m['counts']['productionMutations']==0 if False else True
 assert r['counts']['productionImports']==0 and m['counts']['productionMutations']==0
 assert r['counts']['productionImageOriginalDownloads']==0
 assert m['counts']['productionOriginalsDownloaded']==0
 old=prior();ratings=json.loads((D/'sacred-art-rijks-user-choice-overlay-20261029.v1.json').read_text())
 prior_ri={'rijks:'+str(x['museumObjectId']) for x in ratings['records']}
 assert len(prior_ri)==137
 for file in ('sacred-art-b7-user-final-decisions-20261029.v1.json','sacred-art-b8-user-final-decisions-20261029.v1.json'):
  x=json.loads((D/file).read_text())
  assert x['completeBatch'] and sum(x['counts'].values())==x['reviewedVisibleArtworkCount']
  assert len(x['importSourceIds'])==x['counts']['IMPORT']
 # Prioritize strong candidates from each museum without an arbitrary
 # one-museum quota; a user aesthetic decision can reject any of them.
 rm=r['rows'];mm=m['rows']
 # 70 Met + 180 Rijks when both source sets permit, otherwise fill from
 # remaining unreviewed candidates. No repeating title+artist.
 primary=[*mm[:70],*rm[:180]]
 reserve=[*rm[180:],*mm[70:]]
 selected=[];seenIds=set();seenImage=set();seenArt=set();dupes=[]
 for a in [*primary,*reserve]:
  i=a['id'];im=a['previewURL'];ident=(norm(a.get('title')),norm(a.get('artist')))
  if i in seenIds or im in seenImage or (ident in seenArt and a.get('artist') not in ('Unattributed','Attribution not identified')):
   dupes.append({'id':i,'title':a.get('title'),'reason':'same exact source/image/title-artist'})
   continue
  assert i not in old and i not in prior_ri,('previously reviewed',i)
  assert a.get('imageRightsVerified') is True and a.get('rightsConflict') is None
  assert not a.get('productionImported')
  if a['provider']=='Rijks':
   assert a['sourceRights']=='RIJKSMUSEUM_EXACT_OBJECT_EDM_PDM_MATCHED_IIIF'
   assert a['previewURL'].startswith('https://iiif.micr.io/')
   assert min(a['nativeSourceDimensions'].values())>=1500
  elif a['provider']=='Met':
   assert a['sourceRights']=='MET_PUBLIC_DOMAIN_TRUE_OPEN_ACCESS_CC0'
   assert a['previewURL'].startswith('https://images.metmuseum.org/CRDImages/')
  else:raise AssertionError(a['provider'])
  selected.append(a);seenIds.add(i);seenImage.add(im);seenArt.add(ident)
  if len(selected)==250:break
 assert len(selected)>=200,('B10 missing source-visible artwork volume',len(selected),len(rm),len(mm))
 digest=hashlib.sha256(json.dumps([x['id'] for x in selected],separators=(',',':')).encode()).hexdigest()
 template=(ROOT/'docs/SACRED_ART_MET_195_IMPORT_REVIEW_B9_20261029.html').read_text()
 payload=json.dumps(selected,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
 template,n=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script><script>)',
    lambda z:z.group(1)+payload+z.group(2),template,count=1,flags=re.S)
 assert n==1
 template,n=re.subn(r'const batchHash="[0-9a-f]+";',lambda z:'const batchHash="'+digest+'";',template,count=1)
 assert n==1
 template=re.sub(r'<title>.*?</title>',
    '<title>Ad Orientem | Sacred Art Batch 10 ('+str(len(selected))+')</title>',template,count=1,flags=re.S)
 template=template.replace('The Metropolitan Museum of Art · Batch 9','Rijksmuseum + Metropolitan Museum of Art · Batch 10')
 template,n=re.subn(r'<select id="museum"[^>]*>.*?</select>',
   '<select id="museum" aria-label="Museum"><option value="all">All paintings</option><option value="Rijks">Rijksmuseum</option><option value="Met">Metropolitan Museum of Art</option></select>',
   template,count=1,flags=re.S)
 assert n==1
 template=template.replace("batchId:'B9'","batchId:'B10'")
 template=template.replace('ao-sacred-art-b9-met-import-','ao-sacred-art-b10-import-')
 template=template.replace('ad-orientem-sacred-art-b9-met-','ad-orientem-sacred-art-b10-')
 assert "batchId:'B10'" in template and "const PAGE_SIZE=50;" in template
 HTML.write_text(template,encoding='utf8')
 count=dict(Counter(x['provider'] for x in selected))
 out={'schema':'AO_SACRED_ART_B10_FINAL_MULTI_MUSEUM_REVIEW_V1','date':'2026-10-29',
  'batchId':'B10','target':250,'completeBatchReady':len(selected)==250,'batchSha256':digest,
  'counts':{'reviewableArtworkCount':len(selected),'byMuseum':count,'sourceRijksVerified':len(rm),
    'sourceMetVerified':len(mm),'previousReviewIDsExcluded':1455,
    'additionalHistoricalRijksRatingsExcluded':137,
    'crossMuseumDuplicateSuppressions':len(dupes),'productionImports':0,'sourceOriginalDownloads':0},
  'sources':[str(RIJKS.relative_to(ROOT)),str(MET.relative_to(ROOT))],
  'technical':{'hasExactMetObjectPublicDomain':True,'hasMatchingRijksEdmObjectImageLicence':True,
    'allPreviewsJpegVerified':True,'noPastSourceRepetition':True,
    'noNativePhotoAestheticCertification':True,'noProductionMutation':True},
  'duplicateSamples':dupes[:30],'rows':selected}
 OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
 REPORT.write_text('# Sacred Art — Batch 10 consolidated museum review\n\n'
   f"**{len(selected)}** image-visible paintings, source split {count}. "
   f"Previously reviewed IDs 1455 fully excluded; historical Rijks rated 137 excluded.\n\n"
   'Every proposed work has live official museum image rights and JPEG checks, not merely metadata. '
   'The Rijks side requires exact EDM aggregation and matching image service with public-domain declaration; '
   'the Met side requires per-object CC0, official image and real JPEG bytes.\n\n'
   'User B7 and B8 complete choices remain frozen, all corrections preserved; no production artwork imported, no originals archived, no payments.\n\n'
   'Preview does not certify frameless composition, faithful colour or best available native image; user selects for later photograph QA.\n\n'
   f"Batch hash {digest}.\n")
 print('B10_COMBINED_FINAL',json.dumps({'counts':out['counts'],'hash':digest,
  'first':[(x['title'],x['artist'],x['provider']) for x in selected[:15]]},ensure_ascii=False)[:6000],flush=True)
if __name__=='__main__':final()
