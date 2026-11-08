#!/usr/bin/env node
/**
 * Generate the first cross-module Sacred Art classification/matching registry.
 *
 * Authoritative inputs:
 * - 989 research artwork groups, whose lexical subject tags remain provisional;
 * - the 267-position Prayer art editorial master (never overwritten);
 * - 16 previously released photographs (may appear in live category browsing);
 * - nine explicitly matched-but-unreleased works, with 41 recorded Prayer slots.
 *
 * The output is a non-publishing research index. No script assigns a new
 * source photograph, overwrites a protected cover or promotes a research work.
 */
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {SACRED_ART_CURATED_WORKS_V1,SACRED_ART_CATEGORIES_V1} from "../../src/art/sacred-art-taxonomy-v1.js";
import {RELEASED_MODULE_PAINTINGS} from "../../src/art/released-module-paintings.v1.js";
import {SACRED_ART_SAINT_SCOPE_EXCEPTIONS_V1,lexicalSaintScopeException} from "./sacred-art-saint-scope-exceptions-v1.mjs";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(readFileSync(resolve(ROOT,p),"utf8"));
const gallery=read("data/artwork/research-semantic-candidates-989.v1.json");
const editorial=read("data/prayer/artwork-editorial-20261101/curatorial-master-267-20261101.v1.json");
const batch=read("data/artwork/sacred-art-batch1-25-release-progress.v1.json");
assert.equal(gallery.artworks.length,989);
assert.equal(editorial.assignments.length,267);
assert.equal(SACRED_ART_CURATED_WORKS_V1.length,25);
assert.equal(Object.keys(RELEASED_MODULE_PAINTINGS).length,16);
assert.equal(batch.nextNineSourcePhotographWorkQueue.length,9);

const unique=items=>[...new Set(items)];
const categoryForTag=tag=>{
 if(typeof tag!=="string")return null;
 const [prefix,specific=""]=tag.split("-");
 if(prefix==="CHR"){
  if(["NATIVITY","MAGI","FLIGHT","PRESENT","FINDING","CHILD","NAZARETH"].includes(specific))return "INCARNATION";
  if(["CRUCIFIX","GETHSEMANE","THORNS","DEPOSITION","CROSSBEAR","ENTOMB","SCOURGING","SIDE","RESURRECT","ASCENSION","APPEAR"].includes(specific))return "PASSION";
  if(["MERCY","SACREDHEART"].includes(specific))return "MERCY";
  if(["JUDGMENT"].includes(specific))return "LAST_THINGS";
  if(["KING","BLESSING"].includes(specific))return "PASSION";
  return "MINISTRY";
 }
 if(prefix==="MAR")return "MARY";
 if(prefix==="SNT")return "SAINTS";
 if(prefix==="EUC")return "EUCHARIST";
 if(prefix==="ANG")return "ANGELS";
 if(prefix==="PEN")return "MERCY";
 if(prefix==="SPR")return "HOLY_SPIRIT";
 if(prefix==="TRI")return "TRINITY";
 if(prefix==="END")return "LAST_THINGS";
 if(prefix==="JOS")return "SAINTS";
 if(prefix==="OT")return "OLD_TESTAMENT";
 if(prefix==="LIFE")return "CHURCH_LIFE";
 if(prefix==="NAT")return "CREATION";
 return null;
};
const groups=gallery.artworks.map(w=>{
 const candidates=(w.subjectCandidates??[]).map(t=>{
  const exception=lexicalSaintScopeException(w,t.tag);
  return {
   tag:t.tag,confidence:t.confidence,
   categoryId:exception?null:categoryForTag(t.tag),
   evidence:t.evidence,
   ...(exception?{subjectScopeExclusion:exception.reason}:{})
  };
 });
 const categories=unique(candidates.map(t=>t.categoryId).filter(Boolean));
 return {
  workGroupId:w.workGroupId,title:w.title,artist:w.artist,
  categoryCandidates:categories,
  existingLexicalSubjectTags:candidates,
  ...(candidates.some(t=>t.subjectScopeExclusion)?{
   saintSubjectTitleScopeReviewed:true
  }:{}),
  matchEvidence:"TITLE_AND_ARTIST_LEXICAL_CANDIDATES_ONLY",
  visualSubjectVerification:false,
  categoryReviewState:categories.length?"UNVERIFIED_CANDIDATE_TAGGED":"UNCLASSIFIED_NEEDS_SCENE_REVIEW",
  userApprovedForNewDate:false,
  publicPhotoReleaseCertified:false
 };
});
const groupById=new Map(groups.map(w=>[w.workGroupId,w]));
assert.equal(groupById.size,989);
assert.equal(groups.filter(w=>w.categoryCandidates.length).length,657);
assert.equal(groups.filter(w=>!w.categoryCandidates.length).length,332);
for(const exception of SACRED_ART_SAINT_SCOPE_EXCEPTIONS_V1){
 const work=groupById.get(exception.workGroupId);
 assert.ok(work,"Missing exact saint scope exception: "+exception.workGroupId);
 assert.ok(work.categoryCandidates.includes("SAINTS")&&!work.categoryCandidates.includes("PASSION")&&!work.categoryCandidates.includes("MINISTRY"),"Named saint work cannot be a Christ-specific event: "+exception.workGroupId);
 assert.ok(work.existingLexicalSubjectTags.some(t=>t.tag===exception.excludedTag
  && t.categoryId===null&&t.subjectScopeExclusion===exception.reason));
}
for(const art of groups)for(const tag of art.categoryCandidates)assert.ok(SACRED_ART_CATEGORIES_V1[tag]);

const released=Object.entries(RELEASED_MODULE_PAINTINGS).map(([moduleId,photo])=>{
 const curated=SACRED_ART_CURATED_WORKS_V1.find(a=>a.photoModuleId===moduleId);
 assert.ok(curated,"Unclassified already-published photo: "+moduleId);
 assert.equal(photo.title,curated.title,"Published photo title mismatch "+moduleId);
 assert.equal(photo.artist,curated.artist,"Published photo artist mismatch "+moduleId);
 return {
  id:curated.id,moduleId,title:curated.title,artist:curated.artist,
  scene:curated.scene,categoryIds:curated.categoryIds,
  depictedPersonsCandidates:curated.depictedPersonsCandidates,
  scriptureAnchors:curated.scriptureAnchors,
  source:photo.source,image:photo.image,releasePr:photo.releasePr,
  alreadyReleased:true,
  newEditorialApproval:false,
  newPhotoApproval:false
 };
});
assert.equal(released.length,16);

const pendingIds=new Set(batch.nextNineSourcePhotographWorkQueue.map(w=>w.id));
const pending=SACRED_ART_CURATED_WORKS_V1.filter(w=>!w.photoModuleId);
assert.equal(pending.length,9);
const pendingMatches=[];
for(const work of pending){
 assert.ok(pendingIds.has(work.id),"Curated pending work not in original batch: "+work.id);
 const original=batch.nextNineSourcePhotographWorkQueue.find(w=>w.id===work.id);
 const originalSlots=original.selectedSlotIds;
 assert.deepEqual(work.existingMatching.existingPrayerSlots,originalSlots,"Original owner/Prayer placements changed: "+work.id);
 assert.equal(originalSlots.length,original.knownSelectedSlotCount);
 pendingMatches.push({
  id:work.id,title:work.title,artist:work.artist,scene:work.scene,
  categoryIds:work.categoryIds,
  depictedPersonsCandidates:work.depictedPersonsCandidates,
  scriptureAnchors:work.scriptureAnchors,
  existingPrayerSlots:originalSlots,
  matchSource:"EXISTING_RECORDED_PRAYER_SLOT_CROSSWALK",
  sourceCatalogue:original.sourcePage,
  subjectEvidence:work.subjectEvidence,
  subjectVisualCheckStillRequired:true,
  newPhotoReleaseAuthorized:false,
  newEditorialPlacementCreated:false
 });
}
assert.equal(pendingMatches.reduce((n,w)=>n+w.existingPrayerSlots.length,0),41);

const pendingBySlot=new Map();
for(const work of pendingMatches){
 for(const slot of work.existingPrayerSlots){
  if(pendingBySlot.has(slot))throw Error("Two pending artworks assigned to same slot "+slot);
  pendingBySlot.set(slot,work);
 }
}
const classifiedSlots=[], seenSlots=new Set();
for(const a of editorial.assignments){
 if(seenSlots.has(a.slot))throw Error("Duplicate canonical Prayer slot "+a.slot);
 seenSlots.add(a.slot);
 const ids=unique([
  ...(a.sourceCrosswalk?.candidateIDs??[]),
  ...(a.currentAssignment?.originalArtworkIDs??[]),
  ...(a.approvedPrimaryIdOverlap??[])
 ]).filter(id=>groupById.has(id));
 const lexical=unique(ids.flatMap(id=>groupById.get(id).categoryCandidates));
 const exact=pendingBySlot.get(a.slot)||null;
 const painting=a.currentAssignment?.painting??null;
 const editorialConflict=exact&&painting&&
   Boolean((painting.title||"").trim()!==exact.title.trim()
    && (painting.sourcePage??null)!==(exact.sourceCatalogue??null));
 const categoryIds=unique([...lexical,...(exact?.categoryIds??[])]);
 const candidateStatus=exact?"EXISTING_BATCH1_MATCH_DO_NOT_OVERRIDE_CANONICAL":ids.length?"RESEARCH_CROSSWALK_NOT_NEW_APPROVAL":"NO_RESEARCH_CATEGORY_MATCH";
 classifiedSlots.push({
  slot:a.slot,family:a.family,label:a.label,kind:a.kind,
  authoritativeEditorialStatus:a.editorialStatus,
  existingPainting:painting?{
   title:painting.title??null,artist:painting.artist??null,
   sourcePage:painting.sourcePage??null
  }:null,
  researchGroupIds:ids,
  provisionalCategoryIds:categoryIds,
  originalBatch1MatchedArtwork:exact?.id??null,
  existingEditorialCrosswalkStatus:candidateStatus,
  batch1TitleOrSourceDisagreement:!!editorialConflict,
  existingProductionEnabled:!!a.currentAssignment?.productionEnabled,
  newArtworkSelection:false,
  newPhotoRelease:false,
  protectedCoverUnchanged:true,
  noNewDateSelection:true
 });
}
assert.equal(seenSlots.size,267);
const canonicalSlotDisagreement=classifiedSlots.filter(s=>s.batch1TitleOrSourceDisagreement).map(s=>s.slot);
const catalog=Object.entries(SACRED_ART_CATEGORIES_V1).map(([id,labels])=>({
 id,...labels,
 releasedPhotoModuleIds:released.filter(w=>w.categoryIds.includes(id)).map(w=>w.moduleId),
 pendingExactWorkIds:pendingMatches.filter(w=>w.categoryIds.includes(id)).map(w=>w.id),
 proposedResearchGroupIds:groups.filter(w=>w.categoryCandidates.includes(id)).map(w=>w.workGroupId),
 categoryTaggedPrayerSlots:classifiedSlots.filter(s=>s.provisionalCategoryIds.includes(id)).map(s=>s.slot)
}));
const output={
 schema:"AO_SACRED_ART_CATEGORIES_AND_EXISTING_MATCHES_989_267_V1",
 generatedFrom:[
  "data/artwork/research-semantic-candidates-989.v1.json",
  "data/prayer/artwork-editorial-20261101/curatorial-master-267-20261101.v1.json",
  "data/artwork/sacred-art-batch1-25-release-progress.v1.json",
  "src/art/released-module-paintings.v1.js",
  "src/art/sacred-art-taxonomy-v1.js",
  "scripts/art/sacred-art-saint-scope-exceptions-v1.mjs"
 ],
 state:"CATEGORY_INDEX_AND_EXISTING_PLACEMENT_MATCHES_NOT_NEW_EDITORIAL_APPROVAL",
 policies:{
  preserveAllPriorUserApprovalsAndRejections:true,
  photoRightsIndependentFromArtworkSubject:true,
  neverPromoteLexicalTagToVerifiedDepiction:true,
  retainOriginalLexicalTagsAfterSaintSubjectDisambiguation:true,
  preserve267CanonicalSlotAssignments:true,
  protectOriginalCovers:true,
  preserveRosaryDecadeArtwork:true,
  contextualCalendarReuseRequiresExistingDateApproval:true,
  noResearchPhotoPublication:true,
  noGallerySourceMutation:true
 },
 counts:{
  researchArtworkGroups:groups.length,
  researchGroupsWithTitleBasedCategoryCandidates:657,
  researchGroupsStillWithoutTitleCategory:332,
  exactSaintSubjectScopeCorrections:SACRED_ART_SAINT_SCOPE_EXCEPTIONS_V1.length,
  canonicalPrayerPositions:classifiedSlots.length,
  previouslyReleasedPhotoEntries:released.length,
  manuallyCategorizedCuratedWorks:released.length+pendingMatches.length,
  pendingWorksWithExistingPrayerMatches:pendingMatches.length,
  existingPendingPrayerPlacementLinks:pendingBySlot.size,
  canonicalPrayerSlotDisagreements:canonicalSlotDisagreement.length,
  newPhotoPublications:0,
  newPrayerOverrides:0
 },
 categoryDefinitions:catalog,
 releasedPhotoCategories:released,
 pendingArtworksWithPreexistingSlots:pendingMatches,
 canonicalPrayerSlotCategoryCrosswalk:classifiedSlots,
 researchGroupsTitleCandidateIndex:groups,
 canonicalSlotDisagreement
};
const target=resolve(ROOT,"data/artwork/sacred-art-category-match-989-267.v1.json");
mkdirSync(dirname(target),{recursive:true});
writeFileSync(target,JSON.stringify(output,null,2)+"\n","utf8");
console.log(JSON.stringify({
 status:"SACRED_ART_CATEGORY_MATCH_GENERATED",
 output:target.replace(ROOT+"/",""),
 counts:output.counts,
 perCategory:catalog.map(c=>({id:c.id,released:c.releasedPhotoModuleIds.length,pending:c.pendingExactWorkIds.length,provisionalGroups:c.proposedResearchGroupIds.length,prayerSlots:c.categoryTaggedPrayerSlots.length}))
},null,2));
