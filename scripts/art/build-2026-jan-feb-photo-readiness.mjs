/**
 * Jan–Feb 2026 Sacred Art: 59-date, source-owned photographic readiness.
 * Read-only matrix: no new image acquisition, approval, or Home changes.
 * Requires verified-Gospel 365 / 104 / 48 / 26 research artifacts.
 */
import assert from "node:assert/strict";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {APPROVED_CLASS_I_2026} from "../../src/calendar/approved-class-i-heroes-2026.js";
import {RELEASED_MODULE_PAINTINGS} from "../../src/art/released-module-paintings.v1.js";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const read=async p=>JSON.parse(await readFile(resolve(root,p),"utf8"));
const paths=[
 "artifacts/sacred-art-2026/365-existing-gallery-bulk-match.json",
 "artifacts/sacred-art-2026/104-existing-seasonal-marian-reuse-proposals.json",
 "artifacts/sacred-art-2026/48-existing-gallery-exception-reconciliation.json",
 "artifacts/sacred-art-2026/26-existing-sources-reconciliation.json",
 "data/artwork/research-operational-989.v1.json",
 "data/artwork/research-source-records-3205.v1.json",
 "data/calendar/sacred-art-2026-batch01-60-exact-photo-owner-decisions-20261102.v1.json"
];
const [full,reuse,gaps48,gaps26,gallery,sources,photoReviews]=await Promise.all(paths.map(read));
assert.equal(full.dates.length,365);
assert.equal(full.stats.sourceResolvedGospels,355);
assert.equal(gaps48.totals.provisionalWithArtworkLead,339);
assert.equal(gaps26.totals.datesWithAnyProvisionalArtLead,362);
assert.equal(gallery.works.length,989);
assert.equal(sources.records.length,3205);
assert.equal(photoReviews.rows.length,60);
assert.deepEqual(photoReviews.counts,{reviewed:60,approve:25,reject:35,unreviewed:0});
const groups=new Map(gallery.works.map(w=>[w.workGroupId,w]));
const records=new Map(sources.records.map(w=>[w.recordId,w]));
const reuseMap=new Map(reuse.proposals.filter(r=>r.selection).map(r=>[r.date,r]));
const gap48Map=new Map(gaps48.outstandingDates.filter(r=>r.candidates.length).map(r=>[r.date,r]));
const gap26Map=new Map(gaps26.dates.filter(r=>r.candidates.length).map(r=>[r.date,r]));
const photoMap=new Map(photoReviews.rows.map(x=>[x.museumKey,x]));
const approvals=new Map(APPROVED_CLASS_I_2026.map(x=>[x.date,x]));
assert.equal(approvals.size,10);
const modulePhotos=Object.entries(RELEASED_MODULE_PAINTINGS);
const wave=full.dates.filter(x=>/^2026-0[12]-/.test(x.date));
assert.equal(wave.length,59);
const norm=v=>String(v??"").trim().replace(/\/$/,"");
const bad=w=>w.historicalExclusion||
 (w.userReviewStates??[]).some(s=>["REJECT","PLACEMENT_REJECT"].includes(s))||
 /fra angelico|el greco/i.test(w.artist??"")||
 /museodelprado\.es/i.test(w.selectedSourceUrl??"");
const order={
 CURRENT_EXPLICIT_DATE_APPROVAL:0,
 PREVIOUS_DATED_ARTWORK_RESEARCH:1,
 FROZEN_CURATED_DATE_ART_ASSOCIATION:2,
 EXACT_OBSERVED_PRINCIPAL_FROM_EXISTING_GALLERY:3,
 VERIFIED_GOSPEL_EXISTING_GALLERY_TITLE_SCREEN:4,
 EXISTING_GALLERY_EXACT_SAINT_TITLE_SCREEN:5,
 EXISTING_CATALOGUE_DATE_RESEARCH_MATCH:6,
 ALREADY_RESEARCHED_GOSPEL_OR_FEAST_STUDY:7,
 ALREADY_RESEARCHED_EXTERNAL_SOURCE_LEAD:8
};
function candidate(date,c,lane){
 if(c.applicableToSelectedGospel===false)return null;
 const groupId=c.groupId??c.workGroupId??c.selection?.workGroupId??null;
 const w=groups.get(groupId);
 if(groupId)assert.ok(w&&!bad(w),"Missing or excluded artwork group: "+date+" "+groupId);
 const original=w?records.get(w.preferredRecordId):null;
 if(w)assert.ok(original?.isOperationalCandidate &&
   !["REJECT","PLACEMENT_REJECT"].includes(original.originalUserDecision),
   "Preferred artwork record rejected: "+groupId);
 const title=c.title??c.artworkTitle??c.selection?.title??w?.artworkTitle??null;
 const artist=c.artist??c.selection?.artist??w?.artist??null;
 const sourceUrl=norm(c.originalSource??c.sourceUrl??c.selectedSourceUrl??
   c.selection?.sourceUrl??w?.selectedSourceUrl??null)||null;
 const key=(w?.preferredRecordId??groupId??"").replace(/^(REVIEW|CANONICAL)::/,"");
 const photoReview=photoMap.get(key)??null;
 // A rejected original object/photo cannot enter a new candidate queue.
 if(photoReview?.decision==="reject")throw Error("Photo rejection restored: "+date+" "+key);
 const modules=modulePhotos.filter(([,m])=>sourceUrl&&norm(m.source)===sourceUrl)
  .map(([id,m])=>({moduleId:id,existingOriginal:m.original,existingImage:m.image,
   rightsDescription:m.photographRights,releasePR:m.releasePr,
   dateAuthorization:"NOT_INHERITED_FROM_MODULE_RELEASE"}));
 const rightsCategory=w?.rightsCategory??null;
 const rightsHold=!w||w.queue==="RIGHTS_OR_ALTERNATIVE"||
  /UNRESOLVED|DEFERRED|HOLD/i.test(String(rightsCategory??""));
 const evidenceKind=c.evidenceKind??c.matchKind??c.evidenceBasis??c.selection?.donorEvidenceKind??null;
 const previouslyDateApproved=evidenceKind==="CURRENT_EXPLICIT_DATE_APPROVAL";
 const blockers=[
  ...(w?[]:["SOURCE_IDENTITY_NOT_JOINED_TO_OPERATIONAL_GALLERY"]),
  ...(rightsHold?["EXACT_IMAGE_REPRODUCTION_RIGHTS_NOT_CERTIFIED"]:[]),
  "SELECTED_ORIGINAL_IMAGE_BYTES_NOT_CHECKED",
  "IMAGE_NATIVE_PIXELS_AND_FRAMELESS_CROP_NOT_VERIFIED",
  ...(previouslyDateApproved?[]:["DATE_ARTWORK_ASSOCIATION_NOT_NEWLY_APPROVED"]),
  "ACTUAL_HOME_DATE_DISPLAY_NOT_BROWSER_CERTIFIED"
 ];
 return {
  title,artist,artworkId:c.artworkId??c.canonicalArtworkId??w?.canonicalArtworkId??null,
  workGroupId:groupId,preferredSourceRecordId:w?.preferredRecordId??null,
  researchLane:lane,evidenceKind,sourceUrl,
  preservedUserReviewStates:w?.userReviewStates??[],
  preservedDateApproval:previouslyDateApproved,
  physicalObjectIdentityIndependentlyCertified:false,
  photo:{
   sourcePage:w?.selectedSourceUrl??sourceUrl,
   rightsCategory,rightsEvidence:w?.rightsEvidence??null,
   rightsTerms:w?.rightsTerms??null,
   sourceQueue:w?.queue??"HISTORICAL_SOURCE_RECONCILIATION_REQUIRED",
   selectedOriginalSha256Metadata:w?.sourceOriginalSha256??null,
   selectedPhotoFingerprintMetadata:w?.selectedPhotoFingerprint??null,
   nativeWidth:null,nativeHeight:null,localBytesRehashedInThisAudit:false,
   pristineImageQualityApprovedByOriginalRegistry:Boolean(w?.userPhotoQualityApproval),
   originalPhotoReviewReady:Boolean(w?.readyForUserPristineQualityReview),
   sameOriginalAlreadyReleasedInModule:modules,
   photoOwnerDecision:photoReview?{
    museumKey:photoReview.museumKey,
    decision:photoReview.decision,
    previewSha256:photoReview.exactPreviewSha256,
    originalFileReleaseQACompleted:photoReview.originalFileReleaseQACompleted,
    feastAssociationApproved:photoReview.feastAssociationApproved
   }:null
  },
  certifiedForThisHomepageDate:false,blockers
 };
}
function matched(day){
 const direct=day.usableResearchCandidateCount>0;
 const reuse=reuseMap.get(day.date),gap48=gap48Map.get(day.date),gap26=gap26Map.get(day.date);
 assert.equal([direct,Boolean(reuse),Boolean(gap48),Boolean(gap26)].filter(Boolean).length,1,
  "Research lane mismatch "+day.date);
 let raw,lane;
 if(direct){lane="365_DIRECT";raw=day.candidates;}
 else if(reuse){
  lane="104_CONTEXTUAL_REUSE";
  raw=[{...reuse.selection,evidenceBasis:reuse.status},
   ...(reuse.alternativeArtwork??[]).map(x=>({...x,evidenceBasis:"ALTERNATIVE_MARIAN"}))];
 }else if(gap48){lane="48_EXISTING_GALLERY_RECOVERY";raw=gap48.candidates;}
 else{lane="26_ARCHIVED_RESEARCH_RECOVERY";raw=gap26.candidates;}
 const records=raw.map(x=>candidate(day.date,x,lane)).filter(Boolean);
 assert.ok(records.length,"Empty candidate lane "+day.date);
 return {lane,records};
}
const rows=wave.map(day=>{
 const found=matched(day);
 const ranked=found.records.map((candidate,i)=>({candidate,i})).sort((a,b)=>
  (order[a.candidate.evidenceKind]??40)-(order[b.candidate.evidenceKind]??40)||a.i-b.i);
 const approval=approvals.get(day.date);
 if(approval)assert.equal(approval.principalId,day.observedPrincipalId,
  "Protected hero date/observance changed");
 return {
  date:day.date,liturgicalClass:day.rank,
  observedTitle:day.observedTitle,observedPrincipalId:day.observedPrincipalId,
  gospel:day.gospel,priorSelectionState:day.selectionState,
  candidateResearchLane:found.lane,
  approvedDateHeroProtected:approval?{
   title:approval.title,artist:approval.artist,
   artworkId:approval.artworkId,imageStatus:approval.imagePublicationStatus
  }:null,
  firstPhotoAuditCandidate:ranked[0].candidate,
  alternatives:ranked.slice(1).map(x=>x.candidate),
  totalResearchCandidateRows:ranked.length,
  operationalArtworkGroupsMatched:new Set(ranked.map(x=>x.candidate.workGroupId)
   .filter(Boolean)).size,
  imageCertification:"NOT_CERTIFIED_BY_THIS_SOURCE_AUDIT",
  publicationAllowed:false,
  actualHomepageImageDisplayTested:false,
  nextAction:ranked[0].candidate.workGroupId?
   "RECHECK_ORIGINAL_IMAGE_BYTES_RIGHTS_CROP_AND_DATE_ASSOCIATION":
   "RESOLVE_PREVIOUS_MUSEUM_OBJECT_AND_ORIGINAL_IMAGE_SOURCE_ID"
 };
});
assert.equal(rows.length,59);
assert.equal(new Set(rows.map(r=>r.date)).size,59);
const byLane={};
for(const row of rows)byLane[row.candidateResearchLane]=(byLane[row.candidateResearchLane]??0)+1;
const sourcesCount=rows.reduce((sum,r)=>sum+r.totalResearchCandidateRows,0);
const groupFirst=rows.filter(r=>r.firstPhotoAuditCandidate.workGroupId).length;
const photoApprovedDayLeads=rows.filter(r=>[r.firstPhotoAuditCandidate,...r.alternatives]
 .some(c=>c.photo.photoOwnerDecision?.decision==="approve")).length;
const report={
 schema:"AO_2026_JAN_FEB_59_PHOTOGRAPH_SOURCE_READINESS_V1",
 year:2026,batch:"A",noHomeMutation:true,noNewPhotoAcquisition:true,
 sourceOwners:{
  dateAndGospel:"verified 365 selected-Proper audit",
  candidateSource:"365 / 104 / 48 / 26 research audit pipeline",
  imageMetadata:"989-group operational research and 3205 original source records",
  humanMuseumPhotoDecisions:"2026-11-02 60 source-object preview decisions",
  releasedModuleImages:"src/art/released-module-paintings.v1.js"
 },
 policy:[
  "THE_RESEARCH_FIRST_CHOICE_IS_NOT_A_NEW_EDITORIAL_DATE_APPROVAL",
  "OLD_PHOTO_APPROVAL_IS_SCOPE_LIMITED_TO_THE_EXACT_PHOTO_AND_OBJECT",
  "EXISTING_MODULE_PHOTO_RELEASE_CANNOT_AUTHORIZE_A_NEW_DATE",
  "HASH_METADATA_IS_NOT_VERIFIED_LOCAL_IMAGE_BYTES",
  "RESEARCH_GROUP_IS_NOT_A_CERTIFIED_INDEPENDENT_PHYSICAL_PAINTING",
  "NO_PAINTING_CROP_OR_PHOTO_RIGHTS_CLEARANCE_FROM_SOURCE_METADATA",
  "REJECTED_SOURCE_OBJECTS_REMOVED_FROM_CANDIDATE_QUEUE",
  "NO_NEW_HOME_PUBLICATION_IN_THIS_PASS"
 ],
 totals:{
  dates:rows.length,january:rows.filter(x=>x.date.startsWith("2026-01")).length,
  february:rows.filter(x=>x.date.startsWith("2026-02")).length,
  selectedProperGospelsVerified:rows.filter(x=>
    x.gospel.status==="ACTUAL_SELECTED_PROPER_GOSPEL_VERIFIED").length,
  datesWithResearchLead:rows.length,
  totalCandidateSourceRows:sourcesCount,
  leadingCandidatesWithOperationalGroup:groupFirst,
  leadingCandidatesMissingOperationalGroup:59-groupFirst,
  datesWithHistoric60PhotoApprovalAmongCandidates:photoApprovedDayLeads,
  photoObjectsPreviouslyReviewed:photoReviews.counts.reviewed,
  photoObjectsPreviouslyApproved:photoReviews.counts.approve,
  photoObjectsPreviouslyRejected:photoReviews.counts.reject,
  datesNewlyImageRightsCertified:0,datesNewlyPhotoQualityCertified:0,
  datesNewlyPublishedToHomepage:0,datesBrowserVisuallyCertified:0,
  byResearchLane:byLane
 },
 dates:rows
};
assert.equal(Object.values(byLane).reduce((a,b)=>a+b,0),59);
await mkdir(resolve(root,"artifacts/sacred-art-2026"),{recursive:true});
const jsonPath=resolve(root,"artifacts/sacred-art-2026/jan-feb-59-photo-readiness.json");
const mdPath=resolve(root,"artifacts/sacred-art-2026/jan-feb-59-photo-readiness.md");
await writeFile(jsonPath,JSON.stringify(report,null,2)+"\n");
const lines=[
 "# January–February 2026 Sacred Art — photograph readiness",
 "",
 "Source evidence only. The leading candidate is a QA queue recommendation, not a new approved artwork.",
 "",
 "| Date | Observed celebration | Source-match lane | Leading painting | Original photo gate |",
 "|---|---|---|---|---|"
];
const safe=x=>String(x??"").replace(/\|/g,"/").replace(/\r?\n/g," ");
for(const r of rows){
 const p=r.firstPhotoAuditCandidate;
 lines.push("| "+r.date+" | "+safe(r.observedTitle)+" | "+r.candidateResearchLane+
  " | "+safe(p.title)+" | "+safe(p.blockers.join("; "))+" |");
}
lines.push("","No dates are certified or published by this evidence-only report.");
await writeFile(mdPath,lines.join("\n")+"\n");
console.log(JSON.stringify(report.totals,null,2));
console.log("Reports: "+jsonPath+" and "+mdPath);
