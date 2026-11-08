#!/usr/bin/env python3
"""Full Ad Orientem Sacred Art corpus census, based on committed source records.

Research-only, no publication or image acquisitions. Preserve 3205 source records,
989 operational work groups, 177 selected low-resolution images and 16 released
module entries as SEPARATE populations with explicit source and matching gates.
"""
from __future__ import annotations
from pathlib import Path
from collections import Counter,defaultdict
from urllib.parse import urlsplit,unquote,urlunsplit
import csv,hashlib,json,re,os

OUT=Path("artifacts/sacred-art-phase45-full-census");OUT.mkdir(parents=True,exist_ok=True)
FILES={
 "sources":"data/artwork/research-source-records-3205.v1.json",
 "operational":"data/artwork/research-operational-989.v1.json",
 "semantic":"data/artwork/research-semantic-candidates-989.v1.json",
 "duplicates":"data/artwork/research-prior-duplicate-decisions.v1.json",
 "calendar":"data/artwork/home-2026-annual-release-census.v1.json",
 "date_evidence":"data/artwork/2026-prior-date-artwork-evidence.v1.json",
 "selected":"scripts/sacred-art/artworks_177.csv",
 "release":"src/art/released-module-paintings.v1.js",
 "photo_44":"data/research/sacred-art/phase44-bulk23-exact-photo-source-research-and-five-resolution-leads-20261107.v1.json",
 "identity_40":"data/research/sacred-art/phase40-nine-artworks-oai-identity-conclusions-eight-remaining-20261107.v1.json"
}
def jread(name):return json.loads(Path(FILES[name]).read_text(encoding="utf8"))
src=jread("sources");ops=jread("operational");sem=jread("semantic");dups=jread("duplicates");cal=jread("calendar");dates=jread("date_evidence");p44=jread("photo_44");p40=jread("identity_40")
with Path(FILES["selected"]).open(encoding="utf-8-sig",newline="") as f: selected=list(csv.DictReader(f))
assert len(src["records"])==3205 and len(ops["works"])==989 and len(sem["artworks"])==989
assert len(cal["days"])==365 and len(selected)==177 and len(p40["retained_eight"])==8
assert len({w["workGroupId"] for w in ops["works"]})==989
assert len({r["recordId"] for r in src["records"]})==3205
assert len({r["registry_id"] for r in selected})==177
assert len({a["workGroupId"] for a in sem["artworks"]})==989
opsby={w["workGroupId"]:w for w in ops["works"]}
semb={w["workGroupId"]:w for w in sem["artworks"]}
source_ids={r["recordId"] for r in src["records"]}
assert set(opsby)==set(semb)
# Distinct work-group IDs are not distinct physical paintings. Do not merge IDs.

def canonical_url(value):
 s=str(value or "").strip()
 if not s:return ""
 try:
  p=urlsplit(s)
  host=(p.hostname or "").lower().removeprefix("www.")
  path=unquote(p.path).rstrip("/")
  # Wikimedia File: URL canonicalisation only, not cross-site or painting identity.
  if host=="commons.wikimedia.org" and "/wiki/File:" in path:
   path=path.replace(" ","_")
  return host+path.lower()
 except Exception:return s.lower()
src_by_url=defaultdict(set)
for r in src["records"]:
 k=canonical_url(r.get("sourceUrl"))
 if k:src_by_url[k].add(r["workGroupId"])
selected_by_url=defaultdict(set)
for r in selected:
 k=canonical_url(r.get("commons_url"))
 if k:selected_by_url[k].add(r["registry_id"])

source_groups=set(opsby)
source_row_has_group=0
for r in src["records"]:
 if r["workGroupId"] in source_groups:source_row_has_group+=1
source_orphans=sorted({r["workGroupId"] for r in src["records"] if r["workGroupId"] not in source_groups})
# Direct same-source exact URL is evidence of source linkage, not painting dedupe.
selected_matches={}
for r in selected:
 groups=sorted(src_by_url.get(canonical_url(r.get("commons_url")),set()))
 selected_matches[r["registry_id"]]=groups
hold_ids={x["registry_id"] for x in p40["retained_eight"]}
p44_ids={r["registry_id"] for r in p44["results"]}
source_recent_matches=defaultdict(set)
for rid,group_ids in selected_matches.items():
 for group_id in group_ids:source_recent_matches[group_id].add(rid)
def csv_write(name,fields,rows):
 with (OUT/name).open("w",encoding="utf8",newline="") as f:
  w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore");w.writeheader()
  for r in rows:
   out={k:v for k,v in r.items()}
   for k,v in out.items():
    if isinstance(v,(dict,list)):out[k]=json.dumps(v,ensure_ascii=False,separators=(",",":"))
    elif v is None:out[k]=""
   w.writerow(out)
def boolyes(value):return "YES" if value is True else "NO" if value is False else "UNKNOWN"

works=[]
for w in ops["works"]:
 ident=w["workGroupId"];semantic=semb[ident]
 accepted=w.get("acceptedRecordIds") or []
 direct_selected=sorted(source_recent_matches.get(ident,set()))
 works.append({
  "workGroupId":ident,"canonicalArtworkId":w.get("canonicalArtworkId",""),
  "artworkTitle":w.get("artworkTitle",""),"artist":w.get("artist",""),
  "selectedSourceUrl":w.get("selectedSourceUrl",""),"preferredRecordId":w.get("preferredRecordId",""),
  "allSourceVariantCount":w.get("allSourceVariantCount"),
  "sourceRecordCount":w.get("sourceRecordCount"),
  "acceptedRecordIdsCount":len(accepted),
  "userReviewStates":w.get("userReviewStates") or [],
  "rightsCategory":w.get("rightsCategory",""),
  "rightsEvidence":w.get("rightsEvidence",""),
  "rightsTerms":w.get("rightsTerms",""),
  "operationalQueue":w.get("queue",""),
  "substatus":w.get("substatus",""),
  "lastSourceAuditStatus":w.get("lastSourceAuditStatus",""),
  "priorityScore":w.get("priorityScore"),
  "iconography":w.get("iconography") or [],
  "imageOriginalNativeLocallyVerified":boolyes(w.get("imageOriginalNativeLocallyVerified")),
  "readyForUserPristineQualityReview":boolyes(w.get("readyForUserPristineQualityReview")),
  "userPhotoQualityApproval":boolyes(w.get("userPhotoQualityApproval")),
  "exactPhotoRightsCertifiedForSelectedBytes":boolyes(w.get("exactPhotoRightsCertifiedForSelectedBytes")),
  "productionReleasedInFrozenCorpus":boolyes(w.get("productionReleased")),
  "historicalExclusion":boolyes(w.get("historicalExclusion")),
  "noAutomaticSameWorkMerge":boolyes(w.get("noAutomaticSameWorkMerge")),
  "artworkLabelStatus":semantic.get("artworkLabelStatus",""),
  "subjectCandidateCount":len(semantic.get("subjectCandidates") or []),
  "subjectCandidateTags":[x.get("tag","") for x in semantic.get("subjectCandidates") or []],
  "needsManualSubjectReview":boolyes(semantic.get("needsManualSubjectReview")),
  "referenceSceneIds":w.get("referencedObservedPrincipalIds") or [],
  "prayerKeys":w.get("prayerKeys") or [],
  "exactSourceUrlMatchesToRecent177":len(direct_selected),
  "recent177DirectSourceIds":direct_selected,
  "distinctPhysicalPaintingConfirmed":"NOT_DEDUPLICATED",
  "publicationInterpretation":"FROZEN_2026_OCT_MASTER_NOT_CURRENT_LIVE_STATUS",
  "sourceFile":FILES["operational"],
  "photoRightsAndQualityGate":"NOT_AUTO_APPROVED"
 })
sources=[]
for r in src["records"]:
 linked=sorted(selected_by_url.get(canonical_url(r.get("sourceUrl")),set()))
 sources.append({
  "recordId":r.get("recordId"),"workGroupId":r.get("workGroupId"),
  "canonicalArtworkId":r.get("canonicalArtworkId"),"recordKind":r.get("recordKind"),
  "title":r.get("title"),"artist":r.get("artist"),
  "sourceUrl":r.get("sourceUrl"),"sourceFieldState":r.get("sourceFieldState"),
  "originalUserDecision":r.get("originalUserDecision"),
  "editorialStatus":r.get("editorialStatus"),
  "isOperationalCandidate":boolyes(r.get("isOperationalCandidate")),
  "identityConfidence":r.get("identityConfidence"),
  "qaDecision":r.get("qaDecision"),
  "productionApprovedInSource":boolyes(r.get("productionApproved")),
  "subject":r.get("subject"),"iconography":r.get("iconography"),
  "mappedTo989WorkGroup":boolyes(r.get("workGroupId") in source_groups),
  "directSelectedFileMatches":[*linked],
  "sourceFile":FILES["sources"]
 })
recent=[]
for r in selected:
 rid=r["registry_id"];matched=selected_matches[rid]
 recent.append({
  "registry_id":rid,"title":r.get("title"),"artist":r.get("artist"),"museum":r.get("museum"),
  "handpickedCommonsUrl":r.get("commons_url"),"oldCSVmuseumObjectUrl":r.get("museum_object_url"),
  "shortSidePx":r.get("original_short_px"),"iiifManifestOldCSV":r.get("iiif_manifest"),
  "physicalObjectIdentityStatus":"IDENTITY_HOLD" if rid in hold_ids else "SUPPORTED_PHASE40",
  "phase44ResearchIncluded":boolyes(rid in p44_ids),
  "exactSourceURLLinked989GroupsCount":len(matched),
  "exactSourceURLLinked989Groups":matched,
  "photoReplacementApproved":"NO",
  "photoBytesGeometricallyCompared":"SEPARATE_PHASE44_EVIDENCE_NOT_CLAIMED_HERE",
  "currentSourceRepoScope":"PHASE44_IDENTITY_RESEARCH_ONLY",
  "ownerHandpickedImagePreserved":"YES"
 })
# Extract 16 production-module entries using syntax-scoped regex, not accidental counts of image URLs.
text=Path(FILES["release"]).read_text(encoding="utf8")
matches=list(re.finditer(r'^\s*(?:"([^"]+)"|([A-Za-z0-9_-]+)):Object\.freeze\(\{(.*?)^\s*\}\)(?:,|$)',text,flags=re.M|re.S))
released=[]
for m in matches:
 name=m.group(1) or m.group(2);body=m.group(3)
 def val(k):
  v=re.search(r'^\s*'+re.escape(k)+r':"([^"]*)"',body,re.M)
  if v:return v.group(1)
  v=re.search(r'^\s*'+re.escape(k)+r':(\d+)',body,re.M)
  if v:return int(v.group(1))
  return None
 path=val("image");original=val("original")
 src_url=val("source")
 match_groups=sorted(src_by_url.get(canonical_url(src_url),[]))
 released.append({
  "moduleKey":name,"title":val("title"),"artist":val("artist"),
  "institutionSource":src_url,"releaseImagePath":path,"originalImagePath":original,
  "releasedAssetExistsInRepo":boolyes((Path(path) if path else Path("__missing__")).is_file()),
  "originalAssetExistsInRepo":boolyes((Path(original) if original else Path("__missing__")).is_file()),
  "photographRightsClaim":val("photographRights"),
  "releasePR":val("releasePr"),
  "exactSourceURLLinked989Groups":match_groups,
  "currentStatusEvidence":"PRODUCTION_RELEASE_MODULE_REGISTRY_STATIC_REFERENCE",
  "sourceFile":FILES["release"]
 })
assert len(released)==16,("Module release extraction changed",len(released),[x["moduleKey"] for x in released])
calendar=[]
for d in cal["days"]:
 frozen=d.get("frozenPainting") or {}
 calendar.append({
  "date":d.get("date"),"observance":d.get("observance"),
  "rank":d.get("rank"),"principalId":d.get("principalId"),
  "proposalStatus":d.get("status"),
  "frozenSelectedPaintingTitle":frozen.get("title"),
  "frozenSelectedPaintingArtist":frozen.get("artist"),
  "researchSourceRows":d.get("researchSourceRows"),
  "runtimePublicationStatus":"NOT_CERTIFIED_BY_THIS_RESEARCH_CENSUS",
  "censusSource":FILES["calendar"]
 })
duplicate=[]
for d in dups.get("reviewGroups",[]):
 duplicate.append({
  "duplicateReviewId":d.get("id"),
  "confidence":d.get("confidence"),"reason":d.get("reason"),
  "recordIds":[x.get("id") for x in d.get("members",[])],
  "sharedFileAliasesNotObjectMerge":True,
  "reviewDecision":next((q.get("identityDisposition") for q in dups.get("reviewedHumanDecisions",[]) if q.get("groupId")==d.get("id")),"NOT_FINAL"),
  "sourceFile":FILES["duplicates"]
 })
# work statuses measured on current 989 group snapshots, never link queues to publication approvals.
def tally(items,key):return dict(Counter(str(r.get(key,"MISSING")) for r in items))
status={
 "sources_original_decision":tally(sources,"originalUserDecision"),
 "sources_editorial":tally(sources,"editorialStatus"),
 "sources_record_kind":tally(sources,"recordKind"),
 "source_has_work_group":tally(sources,"mappedTo989WorkGroup"),
 "works_queue":tally(works,"operationalQueue"),
 "works_rights_category":tally(works,"rightsCategory"),
 "works_substatus_top30":dict(Counter(str(r.get("substatus")) for r in works).most_common(30)),
 "works_native_image_verified":tally(works,"imageOriginalNativeLocallyVerified"),
 "works_user_photo_quality_approved":tally(works,"userPhotoQualityApproval"),
 "works_exact_photo_rights_certified":tally(works,"exactPhotoRightsCertifiedForSelectedBytes"),
 "works_production_released_frozen":tally(works,"productionReleasedInFrozenCorpus"),
 "works_manual_subject_review":tally(works,"needsManualSubjectReview"),
 "works_semantic_labels":tally(works,"artworkLabelStatus"),
 "calendar_365_status":tally(calendar,"proposalStatus"),
 "module_release_files_exist":tally(released,"releasedAssetExistsInRepo"),
 "recent_177_identity":tally(recent,"physicalObjectIdentityStatus"),
 "recent_177_exact_url_matches":tally(recent,"exactSourceURLLinked989GroupsCount"),
}
source_url_distinct=len({canonical_url(x["sourceUrl"]) for x in sources if x.get("sourceUrl")})
distinct_artist_title=len({(str(x["artworkTitle"]).strip().lower(),str(x["artist"]).strip().lower()) for x in works})
crosswalk={
 "recent_177_with_direct_source_url_match":sum(bool(v) for v in selected_matches.values()),
 "recent_177_without_direct_source_url_match":sum(not bool(v) for v in selected_matches.values()),
 "recent_177_total_direct_989_links":sum(len(v) for v in selected_matches.values()),
 "distinct_989_groups_linked_by_selected_source":len({id for ids in selected_matches.values() for id in ids}),
 "released_module_entries_matching_989_by_exact_source_url":sum(bool(x["exactSourceURLLinked989Groups"]) for x in released),
 "released_module_entries_unmatched_exact_source_url":sum(not bool(x["exactSourceURLLinked989Groups"]) for x in released)
}
stats={
 "schema":"AO_SACRED_ART_FULL_CORPUS_CENSUS_PHASE45_V1",
 "census_based_on":"EXACT_REPO_SNAPSHOTS_RESEARCH_BRANCH_2026_11_08",
 "counts":{
  "all_source_records":len(sources),"operational_work_groups":len(works),
  "source_unique_urls":source_url_distinct,
  "distinct_normalized_artist_title_keys_not_physical_de_dupe":distinct_artist_title,
  "semantic_tagged":sum(bool(semb[w["workGroupId"]].get("subjectCandidates")) for w in works),
  "semantic_untagged":sum(not bool(semb[w["workGroupId"]].get("subjectCandidates")) for w in works),
  "source_records_assigned_to_operational_groups":source_row_has_group,
  "source_groups_not_in_operational_master":len(source_orphans),
  "module_release_entries":len(released),
  "module_release_image_paths_verified_existing":sum(x["releasedAssetExistsInRepo"]=="YES" for x in released),
  "calendar_2026_days":len(calendar),
  "calendar_proposed_mapped":cal.get("counts",{}).get("totalProposedMapped"),
  "calendar_proposals_pending_or_held":cal.get("counts",{}).get("pendingOrHeld"),
  "recent_owner_selected_low_res":len(recent),
  "recent_museum_identity_supported":sum(x["physicalObjectIdentityStatus"]=="SUPPORTED_PHASE40" for x in recent),
  "recent_museum_identity_holds":len(hold_ids),
  "recent_selected_photos_replaced":p44["publication"]["image_replacements"],
  "research_duplicate_review_groups":len(duplicate),
  "distinct_physical_paintings_CERTIFIED":None,
  "full_catalog_photos_released_certified":None
 },
 "status_distributions":status,"crosswalk":crosswalk,
 "integrity":{"all_989_semantic_groups_match_operational":set(opsby)==set(semb),
  "3205_unique_source_record_ids":len(source_ids)==len(sources),
  "989_unique_work_group_ids":len(opsby)==len(works),
  "177_unique_owner_selected_file_records":len(recent)==177,
  "all_16_release_references_present":all(x["releasedAssetExistsInRepo"]=="YES" for x in released),
  "workgroup_orphans_examples":source_orphans[:30],
  "current_repo_snapshots":{k:hashlib.sha256(Path(v).read_bytes()).hexdigest() for k,v in FILES.items()}},
 "interpretation":[
  "3205 are original source/decision rows, NOT distinct paintings.",
  "989 are operational grouped candidates in the frozen October 30 research corpus, NOT certified distinct physical paintings.",
  "177 are selected image-record workstream, NOT a denominator of full library; exact-url intersection must be used before merging counts.",
  "User-approved painting choice, exact image selection, legal photo clearance, quality signoff and production deployment are different gates.",
  "Frozen operational work productionReleased false is NOT evidence that the app has no paintings; the separate 16-entry actual module release registry exists.",
  "365 calendar proposals have not been independently tested against the current deployed GitHub Pages.",
  "Any duplicate cleanup may NOT merge different physical paintings, erase a selected photograph, or undo an explicit owner rejection."
 ],
 "source_paths":FILES
}
assert stats["counts"]["all_source_records"]==3205
assert stats["counts"]["operational_work_groups"]==989
assert sum(stats["status_distributions"]["works_queue"].values())==989
assert sum(stats["status_distributions"]["calendar_365_status"].values())==365
assert sum(stats["status_distributions"]["recent_177_identity"].values())==177
tables={
 "operational_989.csv":(works,list(works[0])),
 "source_records_3205.csv":(sources,list(sources[0])),
 "selected_177_crosswalk.csv":(recent,list(recent[0])),
 "module_release_16.csv":(released,list(released[0])),
 "calendar_2026_365.csv":(calendar,list(calendar[0])),
 "duplicate_review_18.csv":(duplicate,list(duplicate[0]))
}
for name,(rows,columns) in tables.items():
 csv_write(name,columns,rows)
(OUT/"full_census_summary.json").write_text(json.dumps(stats,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
print(json.dumps({"counts":stats["counts"],"crosswalk":crosswalk,"status_distributions":status,
 "release_assets":released[:2]},ensure_ascii=False,indent=2),flush=True)
