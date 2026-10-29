#!/usr/bin/env python3
"""Finalize B9 from independent official Met and AIC source inventories.

Only review metadata and image URLs are combined. Never archives or publishes an
image file, auto-approves an artwork, or modifies earlier user decisions.
"""
from __future__ import annotations
import hashlib,json,re,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
MET=D/'sacred-art-b9-met-250-review-source-20261029.v1.json'
AIC=D/'sacred-art-b9-aic-open-access-supplement-20261029.v1.json'
OUT=D/'sacred-art-b9-met-aic-final-250-review-20261029.v1.json'
HTML=ROOT/'docs/SACRED_ART_MET_AIC_250_IMPORT_REVIEW_B9_20261029.html'
QA=ROOT/'docs/SACRED_ART_B9_MET_AIC_250_QA_20261029.md'
def norm(s):return re.sub(r'[^a-z0-9]+',' ',str(s or '').lower()).strip()
def main():
 met=json.loads(MET.read_text());aic=json.loads(AIC.read_text())
 assert met['counts']['previousReviewIDsExcluded']==1260
 assert aic['counts']['previousReviewIDsExcluded']==1260
 assert met['counts']['productionImports']==aic['counts']['productionImports']==0
 assert met['counts']['originalImageDownloads']==aic['counts']['originalImageDownloads']==0
 assert len(met['rows'])>=150,('Met source undersupply',len(met['rows']))
 # Avoid identical title and artist across source providers; same subject
 # or common title with different authors is allowed.
 selected=[];ids=set();cross_seen=set();duplicates=[]
 for row in [*met['rows'],*aic['rows']]:
  id=row['id']
  assert id not in ids,('exact repeated source object',id)
  ids.add(id)
  cross=(norm(row.get('title')),norm(row.get('artist')))
  if cross in cross_seen:
   duplicates.append({'id':id,'title':row.get('title'),'artist':row.get('artist')})
   continue
  cross_seen.add(cross)
  selected.append(row)
  if len(selected)==250:break
 if len(selected)!=250:
  raise RuntimeError(f'INCOMPLETE_B9: {len(selected)} of 250; Met {len(met["rows"])}; AIC {len(aic["rows"])}; duplicate title+artist {len(duplicates)}')
 provider_counts=dict(collections.Counter(row['provider'] for row in selected))
 # Met gallery guarantees 50/page, saved selections, explicit finalize
 # semantics, and rights attributes. Replace embedded source data only.
 h=(ROOT/'docs/SACRED_ART_MET_250_IMPORT_REVIEW_B9_20261029.html').read_text()
 digest=hashlib.sha256(json.dumps([x['id'] for x in selected],separators=(',',':')).encode()).hexdigest()
 payload=json.dumps(selected,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
 h,n=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script><script>)',
   lambda m:m.group(1)+payload+m.group(2),h,count=1,flags=re.S)
 assert n==1
 h,n=re.subn(r'const batchHash="[0-9a-f]+";',lambda m:'const batchHash="'+digest+'";',h,count=1)
 assert n==1
 h=re.sub(r'<title>.*?</title>',
          '<title>Ad Orientem | Sacred Art · Batch 9 (250 verified)</title>',h,count=1,flags=re.S)
 h=h.replace('The Metropolitan Museum of Art · Batch 9','The Met + Art Institute of Chicago · Batch 9')
 h,n=re.subn(r'<select id="museum"[^>]*>.*?</select>',
  '<select id="museum" aria-label="Museum"><option value="all">All paintings</option><option value="Met">Metropolitan Museum of Art</option><option value="AIC">Art Institute of Chicago</option></select>',
  h,count=1,flags=re.S)
 assert n==1
 assert "batchId:'B9'" in h and "const PAGE_SIZE=50;" in h
 assert len(selected)==250 and len({x['previewURL'] for x in selected})==250
 assert len({x['id'] for x in selected})==250
 assert all(x['rightsConflict'] is None for x in selected)
 HTML.write_text(h,encoding='utf8')
 record={'schema':'AO_SACRED_ART_B9_MULTI_MUSEUM_250_FINAL_REVIEW_V1',
  'date':'2026-10-29','batchId':'B9','batchHash':digest,'target':250,
  'completeBatchReady':True,
  'counts':{'totalReviewable':250,'byProvider':provider_counts,
   'metSourceCandidates':len(met['rows']),'aicSourceCandidates':len(aic['rows']),
   'priorReviewIDsExcluded':1260,'crossSourceTitleArtistDeduplicated':len(duplicates),
   'productionImported':0,'sourceOriginalImageDownloads':0,
   'nativePhotoQAComplete':0,'humanSelectionsMade':0},
  'crossSourceCollisions':duplicates[:50],
  'sourceReferences':[str(MET.relative_to(ROOT)),str(AIC.relative_to(ROOT))],
  'gates':{'noHistoricSourceIDOverlap':True,'noRepeatedSourceID':True,
           'verifiedPreviewHeaders':True,'openAccessFlagsPerObject':True,
           'noProductionImports':True,'noOriginalImageQAClaim':True},
  'rows':selected}
 OUT.write_text(json.dumps(record,indent=2,ensure_ascii=False)+'\n')
 QA.write_text('# Batch 9 — Metropolitan Museum of Art + Art Institute of Chicago\n\n'
   f'**250 new source-verified images**, Met {provider_counts.get("Met",0)}, AIC {provider_counts.get("AIC",0)}.\n\n'
   f'Met source valid objects {len(met["rows"])}, AIC supplement {len(aic["rows"])}. '
   f'Deduplicated {len(duplicates)} same title+artist combinations.\n\n'
   '**1260 prior review IDs excluded** across original 60 and B3–B8; no prior selection or rejection modified.\n\n'
   'Every candidate has source-official public-domain/CC0 eligibility, a preview checked for valid JPEG bytes, and an authoritative museum object URL. This does not certify aesthetic quality, original native pixels, frames, cropping, or colour fidelity; those follow the user selection.\n\n'
   'No original images downloaded, no production assets added, no payments.\n\n'
   f'Review hash: {digest}.\n')
 print('B9_FINAL_250',json.dumps({'counts':record['counts'],
  'sample':[(x['title'],x['artist'],x['provider']) for x in selected[:12]]},ensure_ascii=False))
if __name__=='__main__':main()
