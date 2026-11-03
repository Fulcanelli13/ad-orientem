/**
 * Source-only follow-up to the 989-group / 365-day bulk candidate audit.
 * Adds RESEARCH PROPOSALS for previously unmatched seasonal ferias and Marian
 * Saturdays. Does not approve artwork for Home or license any photo.
 *
 * node scripts/art/assign-2026-existing-seasonal-marian-reuse.mjs
 */
import assert from "node:assert/strict";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const source=resolve(root,"artifacts/sacred-art-2026/365-existing-gallery-bulk-match.json");
const target=resolve(root,"artifacts/sacred-art-2026/104-existing-seasonal-marian-reuse-proposals.json");
const galleryPath=resolve(root,"data/artwork/research-operational-989.v1.json");
const [audit,master]=await Promise.all([source,galleryPath].map(p=>readFile(p,"utf8").then(JSON.parse)));
assert.equal(audit.dates.length,365);
assert.equal(audit.stats.sourceResolvedGospels,355,"Only source-verified Gospel audit is authoritative");
assert.equal(master.works.length,989);
const gallery=new Map(master.works.map(w=>[w.workGroupId,w]));
const eligible=day=>day.selectionState==="SEASONAL_OR_MARIAN_REUSE_NOT_YET_ASSIGNED";
const requested=audit.dates.filter(eligible);
assert.equal(requested.length,104);
const dateDiff=(a,b)=>Math.round((Date.parse(a+"T00:00:00Z")-Date.parse(b+"T00:00:00Z"))/86400000);
const bannedArtist=work=>/fra angelico|el greco/i.test(work?.artist??"");
const bannedSource=work=>/museodelprado\.es/i.test(work?.selectedSourceUrl??"");
const safeGroup=id=>{
 const w=gallery.get(id);
 return w&&!w.historicalExclusion&&!bannedArtist(w)&&!bannedSource(w)&&
  w.userReviewStates?.some(state=>!["REJECT","PLACEMENT_REJECT"].includes(state))?w:null;
};
const rank=Object.freeze({
 CURRENT_EXPLICIT_DATE_APPROVAL:0,
 PREVIOUS_DATED_ARTWORK_RESEARCH:1,
 FROZEN_CURATED_DATE_ART_ASSOCIATION:2,
 VERIFIED_GOSPEL_EXISTING_GALLERY_TITLE_SCREEN:3,
 EXISTING_GALLERY_EXACT_SAINT_TITLE_SCREEN:4,
 EXACT_OBSERVED_PRINCIPAL_FROM_EXISTING_GALLERY:5,
 EXISTING_CATALOGUE_DATE_RESEARCH_MATCH:6,
 ALREADY_RESEARCHED_GOSPEL_OR_FEAST_STUDY:7,
 ALREADY_RESEARCHED_EXTERNAL_SOURCE_LEAD:8
});
function chooseDonorArt(day){
 const options=day.candidates.filter(item=>{
  if(item.evidenceKind==="FROZEN_CURATED_DATE_ART_ASSOCIATION"&&
    item.applicableToSelectedGospel===false)return false;
  return !item.groupId||Boolean(safeGroup(item.groupId));
 }).sort((a,b)=>(rank[a.evidenceKind]??99)-(rank[b.evidenceKind]??99));
 return options.find(x=>x.title||x.artworkId||x.groupId)??null;
}
const marianSourceIds=["REVIEW::met:437175","REVIEW::met:436261"];
for(const id of marianSourceIds)assert.ok(safeGroup(id),"Missing accepted existing Marian art: "+id);
const proposals=[];
for(const day of requested){
 const marian=day.observedTitle.includes("B. V. M.");
 let status,selection=null,alternatives=[],anchor=null,context;
 if(marian){
  const picked=safeGroup(marianSourceIds[0]);
  const second=safeGroup(marianSourceIds[1]);
  status="MARIAN_SATURDAY_EXISTING_GALLERY_CANDIDATE";
  context="BVM_SATURDAY_VOTIVE_MASS_ICONOGRAPHY_NOT_EXACT_GOSPEL_SCENE";
  selection={workGroupId:picked.workGroupId,title:picked.artworkTitle,artist:picked.artist,
    sourceUrl:picked.selectedSourceUrl,sourceQueue:picked.queue,
    originalHumanStates:picked.userReviewStates};
  alternatives=[{workGroupId:second.workGroupId,title:second.artworkTitle,
    artist:second.artist,sourceUrl:second.selectedSourceUrl,sourceQueue:second.queue}];
 }else{
  const preceding=audit.dates.filter(candidate=>{
   const distance=dateDiff(day.date,candidate.date);
   return distance>0&&distance<=14&&candidate.usableResearchCandidateCount>0;
  });
  const equalGospel=preceding.filter(candidate=>day.gospel.reference&&
   day.gospel.status==="ACTUAL_SELECTED_PROPER_GOSPEL_VERIFIED"&&
   candidate.gospel.status==="ACTUAL_SELECTED_PROPER_GOSPEL_VERIFIED"&&
   candidate.gospel.reference===day.gospel.reference);
  let donor=equalGospel.slice(-1)[0];
  if(donor){
   status="SAME_VERIFIED_GOSPEL_EXISTING_DATED_ARTWORK_CANDIDATE";
   context="SAME_VERIFIED_GOSPEL_CITATION_NOT_PAINTED_SCENE_PROOF";
  }else{
   donor=preceding.filter(x=>dateDiff(day.date,x.date)<=8&&
     ["I","II"].includes(x.rank)).slice(-1)[0];
   if(donor){
    status="PREVIOUS_LITURGICAL_WEEK_ARTWORK_CANDIDATE";
    context="LITURGICAL_WEEK_CONTEXT_NOT_GOSPEL_MATCH";
   }else{
    status="NO_ELIGIBLE_DATED_SOURCE_FOR_CONTEXTUAL_REUSE";
    context="EXISTING_GALLERY_MANUAL_MATCH_ONLY_NO_NEW_ACQUISITION";
   }
  }
  if(donor){
   const artwork=chooseDonorArt(donor);
   if(artwork){
    anchor={date:donor.date,observedPrincipalId:donor.observedPrincipalId,
      title:donor.observedTitle,sourceGospel:donor.gospel.reference,
      originalEvidenceKind:artwork.evidenceKind};
    const w=artwork.groupId?gallery.get(artwork.groupId):null;
    selection={workGroupId:artwork.groupId??null,
      artworkId:artwork.artworkId??null,title:artwork.title??w?.artworkTitle??null,
      artist:artwork.artist??w?.artist??null,
      sourceUrl:artwork.originalSource??artwork.selectedSourceUrl??w?.selectedSourceUrl??null,
      sourceQueue:w?.queue??"HISTORICAL_DATED_SELECTION_SOURCE_RECONCILIATION",
      originalHumanStates:w?.userReviewStates??[],
      donorEvidenceKind:artwork.evidenceKind};
   }else{
    status="DATED_DONOR_ARTWORK_NEEDS_SOURCE_RECONCILIATION";
   }
  }
 }
 proposals.push({
   date:day.date,rank:day.rank,observedTitle:day.observedTitle,
   observedPrincipalId:day.observedPrincipalId,gospel:day.gospel,
   stage:"PROVISIONAL_EXISTING_ART_REUSE_NOT_USER_DATE_APPROVED",
   status,context,selection,alternativeArtwork:alternatives,donor:anchor,
   exactGospelDepictionCertified:false,
   exactImageRightsCertified:false,originalPhotoVisualQaCertified:false,
   physicalArtworkIdentityDedupCertified:false,productionPublished:false,
   nextAction:selection?
    "RECONCILE_PREVIOUS_USER_APPROVAL_AND_EXACT_PHOTO_RIGHTS_VISUAL_QA":
    "SEARCH_PREEXISTING_GALLERY_AND_PRIOR_APPROVED_SEASONAL_ART_ONLY"
 });
}
const histogram={};
for(const p of proposals)histogram[p.status]=(histogram[p.status]??0)+1;
const matched=proposals.filter(p=>p.selection).length;
const unresolved=proposals.filter(p=>!p.selection).map(p=>({date:p.date,
  observedTitle:p.observedTitle,gospel:p.gospel.reference}));
const report={
 schema:"AO_EXISTING_2026_SEASONAL_MARIAN_ART_REUSE_PROPOSALS_V1",
 generatedAt:new Date().toISOString(),year:2026,
 source:"365-existing-gallery-bulk-match.json and frozen 989-group catalogue",
 noNewResearchOrAcquisition:true,
 constraints:[
  "DO_NOT_PROMOTE_RESEARCH_SOURCE_DECISIONS_AS_NEW_DATE_APPROVAL",
  "DO_NOT_OVERRIDE_EXISTING_PROTECTED_FEAST_HEROES",
  "SAME_GOSPEL_REFERENCE_IS_NOT_SCENE_VERIFICATION",
  "WEEK_CONTEXT_IS_NOT_AN_EXACT_GOSPEL_MATCH",
  "ONLY_USER_ACCEPTED_OR_CONDITIONAL_EXISTING_GALLERY_SOURCE_IDS",
  "NO_IMAGE_SHOWN_UNLESS_EXACT_RIGHTS_CROP_BYTES_AND_RELEVANCE_PASS"
 ],
 totals:{previousCandidateDays:audit.stats.candidateDays,
  previouslySeasonalOrMarianUnassigned:requested.length,
  newlyProposedExistingReuses:matched,
  remainingSeasonalOrMarianExceptions:unresolved.length,
  provisionalDaysWithAtLeastOneExistingArtLead:audit.stats.candidateDays+matched,
  all2026Days:365,
  remainingDaysWithoutAnyProposal:365-audit.stats.candidateDays-matched,
  byStatus:histogram,
  actualHomeArtworkPublicationCertified:0},
  unresolved,proposals
};
assert.equal(report.totals.previouslySeasonalOrMarianUnassigned,104);
assert.equal(report.totals.provisionalDaysWithAtLeastOneExistingArtLead+
  report.totals.remainingDaysWithoutAnyProposal,365);
await mkdir(resolve(root,"artifacts/sacred-art-2026"),{recursive:true});
await writeFile(target,JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report.totals,null,2));
console.log("Existing-gallery seasonal and Marian research proposals: "+target);
