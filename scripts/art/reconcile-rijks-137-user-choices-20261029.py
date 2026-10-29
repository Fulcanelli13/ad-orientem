#!/usr/bin/env python3
"""Non-destructive reconciliation of user-uploaded 137 Rijks artwork rating IDs.

The 18 rating-4 works are editorial IMPORT_CANDIDATES, NOT production imports.
The 30 rating-3 works remain REVIEW_REQUIRED, not corrections without instructions.
The 89 rating-0/1/2 works retain their historic rejection.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'data/calendar/sacred-art-rijks-rights-gated-review-b2-20261029.v1.json'
OUT=ROOT/'data/calendar/sacred-art-rijks-user-choice-overlay-20261029.v1.json'
FOUR='200109177 20025782 20025781 20026408 200478995 200108805 20027705 20015932 20025872 20015924 20027611 20028087 20026427 20027724 20027041 2004499 200107985 20027078'.split()
THREE='20027884 200109277 20027406 2009322 20027783 200718371 200108427 20027684 20026556 20026863 20026418 20027910 200108122 200107943 20026300 20026416 20026716 20026851 200108423 200109187 20025868 20026650 20026729 20027969 20026314 20026316 20027905 20027927 20026265 20026486'.split()
assert len(FOUR)==18 and len(THREE)==30 and not set(FOUR)&set(THREE)
data=json.loads(SRC.read_text(encoding='utf-8'))
records=data['records']
assert len(records)==140
seen={str(x['sourceObjectId']) for x in records if x['disposition']=='CC0_RESEARCH_CONTACT_SHEET_ONLY'}
assert len(seen)==137 and len(set(FOUR+THREE))==48 and set(FOUR+THREE)<=seen
out=[]
for x in records:
 id=str(x['sourceObjectId'])
 if id not in seen:continue
 status='IMPORT_CANDIDATE_FROM_PREVIOUS_4' if id in FOUR else 'REVIEW_NEEDED_FROM_PREVIOUS_3' if id in THREE else 'USER_RATED_0_2_REJECT'
 rating_class=4 if id in FOUR else 3 if id in THREE else '0–2'
 out.append({'museum':'Rijksmuseum','museumObjectId':id,'accession':x.get('accession'),
  'title':x.get('title'),'artist':x.get('artist'),'previousUserRatingGroup':rating_class,
  'decision':status,'correctionInstructions':None,'productionImported':False,
  'imageRightsLinked':x['imageRights']=='CC0_OR_PDM',
  'explicitNewImportApproval':False,
  'notes':'No corrections inferred: user-provided file contained empty note fields.' if id in THREE else None})
assert len(out)==137
counts={k:sum(x['decision']==k for x in out) for k in ('IMPORT_CANDIDATE_FROM_PREVIOUS_4','REVIEW_NEEDED_FROM_PREVIOUS_3','USER_RATED_0_2_REJECT')}
assert list(counts.values())==[18,30,89]
result={'schema':'AO_RIJKS_PREVIOUS_RATINGS_RECONCILED_TO_IMPORT_WORKFLOW_V1','date':'2026-10-29',
 'input':'user-uploaded ad-orientem-rijks-b2-user-ratings.json',
 'inputRatingCounts':{'4':18,'3':30,'0_to_2':89},
 'policy':{'rating4':'candidate for Import (requires normal quality and identity gates)',
  'rating3':'do not infer corrections or reject; awaits new binary import choice',
  'rating0_2':'keep user-rejected',
  'importDoesNotPublish':True,'noCanonicalMutation':True,
  'newMuseumReviewRule':'only user-selected imports and corrections; reject unselected only on explicitly completed visual review batch'},
 'counts':counts,'records':out}
OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'counts':counts,'originalPreserved':True,'productionImports':0}))
