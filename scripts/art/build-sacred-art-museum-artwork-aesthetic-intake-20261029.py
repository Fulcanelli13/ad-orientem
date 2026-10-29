#!/usr/bin/env python3
"""Build a non-destructive, evidence-based museum sacred-art intake and taste triage.

This program does NOT infer visual beauty from metadata; it assigns research priority,
preserves verified past human decisions, and queues visual aesthetic judgement.
"""
from __future__ import annotations
import json,re,html,unicodedata
from pathlib import Path
from collections import Counter,defaultdict

ROOT=Path(__file__).resolve().parents[2]
D=ROOT/'data/calendar'
OUTPUT=D/'sacred-art-museum-work-intake-and-aesthetic-gates-20261029.v1.json'
REPORT=ROOT/'docs/SACRED_ART_MUSEUM_WORK_INTAKE_AND_AESTHETICS_20261029.md'
PATHS={
 'institutions':'sacred-art-institution-source-priority-registry-20261029.v1.json',
 'canon':'sacred-art-curator-queues-383-20261029.v1.json',
 'licences':'sacred-art-licence-first-383-exact-source-audit-20261029.v1.json',
 'candidates':'sacred-art-candidates.v1.json',
 'breviarium':'sacred-art-breviarium-83-gallery-intake-20261029.v1.json',
 'taste':'sacred-art-aesthetic-reset-20261013.v1.json',
 'ratings':'sacred-art-rating-reconciliation-20261013.v1.json',
 'discovery':'sacred-art-open-museum-discovery-b1-20261029.v1.json',
}
def read(name):
 p=D/PATHS[name]
 return json.loads(p.read_text(encoding='utf8')) if p.exists() else None
def norm(s):
 text=unicodedata.normalize('NFKD',html.unescape(str(s or '')))
 return re.sub(r'[^a-z0-9]+',' ',''.join(c for c in text if not unicodedata.combining(c)).lower()).strip()
def urls(u):
 return re.sub(r'[#?].*','',str(u or '')).rstrip('/').lower()
def named(d,key,attr):
 return {x[attr]:x for x in d[key]}
institutions=read('institutions');canon=read('canon');rights=read('licences')
candidates=read('candidates');breviar=read('breviarium')
taste=read('taste');ratings=read('ratings');discovery=read('discovery')
assert institutions['institutionCount']==186
assert len(canon['main_records'])==383
assert len(rights['records'])==383
assert len(candidates['artworks'])==281
assert len(breviar['records'])==83
assert len({x['artwork_id'] for x in canon['main_records']})==383
assert len({x['artwork_id'] for x in rights['records']})==383
assert len({x['id'] for x in institutions['institutions']})==186
assert len({x['id'] for x in candidates['artworks']})==281
rate_good={x['artworkId']:x for x in ratings['eligibleFromTodaysRatings']}
rate_bad={x['artworkId']:x for x in ratings['discardedFromTodaysRatings']}
prior_approved={x['artworkId']:x for x in ratings['eligibleFromPriorSubjectApprovals']}
hard_ids=set(ratings['artistPolicyExcludedIds'])
licence_by=named(rights,'records','artwork_id')
canon_by=named(canon,'main_records','artwork_id')
candidate_by=named(candidates,'artworks','id')
url_to_canonical=defaultdict(set)
for x in canon['main_records']:
 if x.get('source_page'):url_to_canonical[urls(x['source_page'])].add(x['artwork_id'])
for x in rights['records']:
 if x.get('source_url'):url_to_canonical[urls(x['source_url'])].add(x['artwork_id'])
hard_artists={'el greco','fra angelico'}
favourites={norm(x) for x in taste['approvedReferenceArtists']}
extended={norm(x) for x in ['Caravaggio','Guido Reni','Jusepe de Ribera','Francisco de Zurbarán',
 'Guercino','Salomon de Bray','Bartolomé Esteban Murillo','Lorenzo Lotto',
 'Carlo Saraceni','Giovanni Battista Tiepolo','Bernardo Strozzi','Ludovico Carracci',
 'Orazio Gentileschi','Gerrit van Honthorst','Tintoretto','Paolo Veronese']}
baroque_terms={'rubens','dyck','champaigne','caravaggio','ribalta','ribera','lanfranco',
 'reni','guercino','zurbaran','tintoretto','tiepolo','saraceni','carracci',
 'strozzi','gentileschi','honthorst','la tour','lotto','murillo','jordaens'}
subject_tokens=('jesus','christ','christus','holy','saint','sainte','san ','santa','saint ',
 'virgin','madonna','mary','maria','angel','annunc','nativity','adoration','crucifix',
 'calvary','martyr','assumption','resurrection','pentecost','magdalene',
 'lazarus','eucharist','apostle','baptism','last supper','pieta','trinity',
 'abraham','moses','saint john','saint peter','sacred heart','saint joseph',
 'catherine','teresa','francis','bernard','antoni','immacul')
exact_user_approved={x['artwork_id'] for x in rights['records'] if x.get('approved_107')}
assert len(exact_user_approved)==107
def metadata_priority(title,artist):
 a=norm(artist);t=norm(title)
 if any(k in a for k in hard_artists):return 'EXCLUDED_ARTIST'
 if a in favourites:return 'P1_REFERENCE_ARTIST'
 if a in extended:return 'P2_STRONG_RELATED_ARTIST'
 if any(b in a for b in baroque_terms):return 'P3_BAROQUE_CORPUS'
 return 'P4_OTHER_ART_HISTORICAL'
def editorial_state(ident,artist,source_approved=False):
 if ident in hard_ids or any(x in norm(artist) for x in hard_artists):
  if source_approved:return 'HISTORICAL_APPROVAL_WITH_STYLE_CONFLICT_HOLD'
  return 'HARD_EXCLUDED_RESEARCH_ARCHIVE'
 if ident in rate_bad:
  if source_approved:return 'CONFLICT_RATING_AND_APPROVAL_MANUAL_RECONCILIATION'
  return 'USER_RATED_0_2_GLOBAL_REJECT'
 if source_approved:return 'USER_APPROVED_PRESERVE'
 if ident in rate_good:return 'USER_RATED_3_5_FINAL_REVIEW'
 if ident in prior_approved:return 'HISTORIC_SUBJECT_APPROVAL_PRESERVE'
 return 'NOT_VISUALLY_REVIEWED'
def packaging(ident,title,artist,sourceKind,sourceUrl,canonical=None,originalSource=None,sourceApproved=False):
 pref=metadata_priority(title,artist)
 status=editorial_state(ident,artist,sourceApproved)
 rating=rate_good.get(ident) or rate_bad.get(ident)
 return {'sourceRecordId':ident,'canonicalArtworkId':canonical,'sourceKind':sourceKind,
         'sourceOriginalId':originalSource,'title':title,'artist':artist,
         'sourcePage':sourceUrl,'editorialStatus':status,
         'priorUserRating':rating.get('rating') if rating else None,
         'artistBasedDiscoveryPriority':pref,
         'visualArtisticExcellence':'NOT_REASSESSED_IN_THIS_PASS',
         'devotionalIntensity':'NOT_REASSESSED_IN_THIS_PASS',
         'exactIconography':'NOT_REASSESSED_IN_THIS_PASS',
         'aestheticTier':'NO_NEW_AESTHETIC_TIER_ASSIGNED',
         'visualReviewStatus':('HISTORICAL_HUMAN_RATING_PRESERVED' if rating else
             'HISTORICAL_APPROVAL_PRESERVED' if sourceApproved else 'NEEDS_NATIVE_VISUAL_REVIEW'),
         'eligibleForAffirmativeNewShortlist':status not in ('HARD_EXCLUDED_RESEARCH_ARCHIVE',
               'USER_RATED_0_2_GLOBAL_REJECT','HISTORICAL_APPROVAL_WITH_STYLE_CONFLICT_HOLD',
               'CONFLICT_RATING_AND_APPROVAL_MANUAL_RECONCILIATION'),
         'photoRightsClearanceFromThisPass':False,'productionReleasedByThisPass':False}
records=[];audit_source_links={}
for x in canon['main_records']:
 id=x['artwork_id'];lic=licence_by[id]
 approved=id in exact_user_approved
 z=packaging(id,x['title'],x['artist'],'CANONICAL_383',x.get('source_page',''),id,sourceApproved=approved)
 z.update({'existingEditorialState':x.get('editorial_state'),
           'existingAestheticVisualState':x.get('photo_visual_state'),
           'existingPhotoLicenceStatus':lic['file_licence_audit_status'],
           'sourceLane':x.get('source_lane'),'liturgicalSubject':x.get('subject'),
           'priority':x.get('priority'),'priorSourceSha256':x.get('prior_source_sha256') or None})
 records.append(z)
linkedExisting=0;extra281=[];possibleAliases=[]
for x in candidates['artworks']:
 cid=x['id'];objecturl=x.get('source',{}).get('objectUrl','')
 if cid in canon_by:
  linkedExisting+=1;continue
 exactIds=url_to_canonical.get(urls(objecturl),set()) if objecturl else set()
 if len(exactIds)==1:
  linkedExisting+=1;possibleAliases.append({'externalId':cid,'canonicalArtworkId':next(iter(exactIds)),
   'proof':'SAME_RECORDED_SOURCE_URL','sourceKind':'RESEARCH_281'});continue
 z=packaging(cid,x.get('title',''),x.get('artist',''),'RESEARCH_281_UNLINKED',objecturl,None,
             originalSource=x.get('source',{}).get('objectId'))
 z['museumAsRecorded']=x.get('museum')
 z['sourceObjectRightsClaim']=x.get('source',{}).get('rights')
 extra281.append(z)
plateRefs=[];plateClaimedDuplicates=0
for x in breviar['records']:
 id=x['breviarum_plate_id'];artist=x.get('artist_as_credited','')
 if x.get('possible_global_rejected_identity_collisions') or x.get('possible_existing_candidate_collisions'):
  plateClaimedDuplicates+=1
 z=packaging(id,x['title'],artist,'BREVIARIUM_PLATE_NOT_PHYSICAL_WORK',
             x.get('breviarum_gallery_url',''),None,x.get('commons_filename'))
 z['historicalExistingWorkMatches']='NEEDS_PHYSICAL_ID_CONFIRMATION'
 z['sourceImageRightsEvidence']='SOURCE_METADATA_ONLY_NO_NEW_CLEARANCE'
 plateRefs.append(z)
new=[]
if discovery and discovery.get('status')=='METADATA_COLLECTED':
 for x in discovery.get('leads',[]):
  id=x['provider']+':'+x['objectId']
  z=packaging(id,x.get('title',''),x.get('artist',''),'MUSEUM_METADATA_DISCOVERY_B1',
          x.get('objectUrl',''),None,x.get('objectId'))
  z['museumAsRecorded']=x.get('museum')
  z['sourceProvider']=x['provider']
  z['possibleCanonicalMatches']=x.get('possibleCanonicalMatches',[])
  z['objectIdentityVerifiedAgainst383']=False
  z['sourceImageRightsClaim']=x.get('photographLicence','UNVERIFIED')
  new.append(z)
museumRows=[]
for x in institutions['institutions']:
 tier=x['tier']
 if tier=='REFERENCE_ONLY':scan='RESEARCH_ONLY_NO_MUSEUM_IMAGE_DOWNLOAD'
 elif tier=='POLICY_UNVERIFIED':scan='NEEDS_SOURCE_POLICY_REVIEW'
 elif tier=='CONDITIONAL_REVIEW':scan='EXACT_FILE_LICENCE_FILTER_REQUIRED'
 elif tier=='DISCOVERY_METADATA_ONLY':scan='CATALOG_METADATA_NOT_PHOTOS'
 else:scan='RIGHTS_FILTERED_METADATA_INTAKE_ELIGIBLE'
 if x['id']=='rijks':scan='B1_METADATA_SCAN_CONFIGURED'
 if x['id']=='kmska-antwerp':scan='B1_METADATA_SCAN_CONFIGURED'
 museumRows.append({'museumSourceId':x['id'],'institution':x['name'],'country':x['country'],
   'sourceTier':tier,'discoveryWorkflow':scan,
   'hasRelevantSacredPaintingConfirmed':'NOT_EXHAUSTIVELY_SCREENED',
   'sourceCoverageComplete':False,'artworksActuallyVerifiedFromThisMuseum':0,
   'unrestrictedImagesCertifiedFromThisPass':0})
assert len(museumRows)==186
allItems=records+extra281+plateRefs+new
assert len({(x['sourceKind'],x['sourceRecordId']) for x in allItems})==len(allItems)
counts=Counter(x['sourceKind'] for x in allItems)
status=Counter(x['editorialStatus'] for x in allItems)
payload={
 'schema':'AO_SACRED_ART_MUSEUM_WORK_AND_AESTHETIC_REVIEW_V1','date':'2026-10-29',
 'scope':'186 institution programme matrix and non-destructive linked canonical/existing/source discovery work queues',
 'editorialPolicySource':PATHS['taste'],
 'sourcePaths':PATHS,'institutionCount':186,
 'counts':{'canonicalUniqueArtworks':len(records),'original281ExactIdentityLinkedToCanonical':linkedExisting,
  'old281NotYetProvenSameObject':len(extra281),'breviariumPlateReferencesNotUniqueWorks':len(plateRefs),
  'newB1MetadataLeads':len(new),'unifiedRowsWithoutPhysicalDedupClaim':len(allItems),
  'historicalUserApprovedCanonical':107,
  'sourceKind':dict(counts),'editorialStates':dict(status),
  'newHumanAestheticApprovals':0,'newPhotoRightClearances':0,'newProductionAssets':0},
 'aestheticEvaluationOrder':taste['strictOrdering'],
 'benchmarkPaintings':taste['benchmarkPaintings'],
 'referenceArtists':taste['approvedReferenceArtists'],
 'aestheticGradeRules':taste['levels'],
 'ratingRules':ratings['rules'],
 'artistHardExclusions':['El Greco','Fra Angelico'],
 'photographicQualityReview':'DEFERRED_BEHIND_IMAGE_SPECIFIC_RIGHTS',
 'candidatePriorityIsNotBeautyRating':True,
 'sourceExhaustionClaim':False,
 'museumSourceMatrix':museumRows,
 'canonicalArtworkRecords':records,
 'source281AdditionalIdentityUnresolved':extra281,
 'source281ExactLinks':possibleAliases,
 'breviarium83PlateReferences':plateRefs,
 'museumB1MetadataLeads':new}
OUTPUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
lines=['# Sacred Art — European museum art registration and aesthetic triage','',
 '29 October 2026 · no newly invented aesthetic approvals or image release · €0','',
 '## What is registered and what is not','',
 '- **186** institutional source programmes registered, each with access tier and scan state; **0** asserted completely exhausted.',
 '- **383** canonical distinct artwork IDs preserved, including **107** historically approved choices.',
 '- **281** earlier research candidates crosslinked by exact artwork ID or same recorded source URL; **'+str(linkedExisting)+'** such links, **'+str(len(extra281))+'** still identity-unresolved.',
 '- **83 Breviarium plates** registered as visual-source references (not automatically 83 separate physical paintings).',
 '- **'+str(len(new))+'** B1 Rijksmuseum/KMSKA source metadata leads joined (B1 optional; absent or unfinished means zero leads, not an empty collection).',
 '- **0** new human aesthetic approvals; **0** source-image legal clearances; **0** photo QA releases.','',
 '## Strict aesthetic gates (not an artist-only score)','',
 '1. **Exceptional painterly beauty**: accomplished drawing/anatomy, chromatic richness, strong coherent composition, emotional restraint or depth.',
 '2. **Sacred devotional intensity**: reverence, spiritual gravity, transcendence and visual power; reject generic illustration or merely antiquarian documentation.',
 '3. **Precise Catholic iconography**: actual saint, scene and rite; no incorrect event or location or workshop conflation.',
 '4. **Source and presentation**: legally reusable exact photograph; rich tonal fidelity; no physical frame, glare, digital manipulation or clipped original; mobile composition.',
 '',
 'A work cannot pass on source rights, iconographic relevance, a preferred artist name, or a numerical average alone. Grade A/B/C/D requires original-image visual review and explicit human approval where applicable.','',
 '### Negative controls','',
 '- El Greco and Fra Angelico excluded from new selection; old records preserved.',
 '- Global user ratings 0–2 remain rejected even if present in a new museum; existing high-rated works may not be re-offered as newly discovered.',
 '- Previously approved works are never replaced by a new museum scan.',
 '- Photography rights restrictions do not prohibit art-historical object research or independent rights-verified photographs.',
 '',
 '## Next actual museum mining job','',
 'Rijksmuseum and KMSKA are configured. Then use official source/terms-safe metadata from Belvedere, KMSKA/Art in Flanders, Paris Musées where the free token can be obtained, and other open feeds. Keep source-specific queries, total inventory claims, pagination and failure counts.','',
 'Full machine-readable linked records: '+str(OUTPUT.relative_to(ROOT))+'.']
REPORT.write_text('\n'.join(lines)+'\n',encoding='utf8')
print(json.dumps({'count':payload['counts'],'museumMatrix':len(museumRows),
 'aestheticNewApprovals':0},indent=2))
