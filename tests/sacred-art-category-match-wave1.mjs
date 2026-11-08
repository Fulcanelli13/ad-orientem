import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {SACRED_ART_CATEGORIES_V1,SACRED_ART_CURATED_WORKS_V1,sacredArtWorkById,sacredArtReleasedPhotoClassification,sacredArtWorksInCategory,sacredArtMatchesForPrayerSlot} from "../src/art/sacred-art-taxonomy-v1.js";
import {RELEASED_MODULE_PAINTINGS} from "../src/art/released-module-paintings.v1.js";
import {SACRED_ART_RELEASED_GALLERY_V1} from "../src/art/released-gallery-batch1.v1.js";
import {SACRED_ART_SAINT_SCOPE_EXCEPTIONS_V1,lexicalSaintScopeException} from "../scripts/art/sacred-art-saint-scope-exceptions-v1.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const src=read("data/artwork/research-semantic-candidates-989.v1.json");
const queue=read("data/artwork/sacred-art-batch1-25-release-progress.v1.json");
assert.equal(src.artworks.length,989);
assert.equal(SACRED_ART_SAINT_SCOPE_EXCEPTIONS_V1.length,3);
const known={};
for(const exception of SACRED_ART_SAINT_SCOPE_EXCEPTIONS_V1){
 const original=src.artworks.find(w=>w.workGroupId===exception.workGroupId);
 assert.ok(original,"Source work missing "+exception.workGroupId);
 assert.equal(original.title,exception.title);
 assert.equal(original.artist,exception.artist);
 assert.equal(original.subjectCandidates.some(t=>t.tag===exception.excludedTag),true,
   "Frozen lexical evidence is retained rather than erased");
 assert.equal(lexicalSaintScopeException(original,exception.excludedTag),exception);
 assert.equal(lexicalSaintScopeException({...original,title:"Different identity"},exception.excludedTag),null,
   "Exception cannot match another depiction or attribution");
 known[exception.workGroupId]=original;
}
assert.equal(lexicalSaintScopeException({workGroupId:"not-reviewed"},"CHR-MIRACLE"),null);

assert.equal(SACRED_ART_CURATED_WORKS_V1.length,25);
assert.equal(SACRED_ART_CURATED_WORKS_V1.filter(w=>w.photoModuleId).length,16);
assert.equal(SACRED_ART_CURATED_WORKS_V1.filter(w=>!w.photoModuleId).length,9);
assert.equal(SACRED_ART_RELEASED_GALLERY_V1.length,16);
assert.equal(new Set(SACRED_ART_CURATED_WORKS_V1.map(w=>w.id)).size,25);
assert.equal(new Set(Object.keys(SACRED_ART_CATEGORIES_V1)).size,14);
for(const [id,source] of Object.entries(RELEASED_MODULE_PAINTINGS)){
 const w=sacredArtReleasedPhotoClassification(id);
 assert.ok(w,"Released photo must have classified identity: "+id);
 assert.equal(w.title,source.title);assert.equal(w.artist,source.artist);
 assert.equal(w.photoReleaseState,"ALREADY_RELEASED_MODULE_PHOTO");
 assert.equal(w.newPhotoPublication,false);
 assert.equal(w.existingMatching.releasedModule,id);
}
for(const w of SACRED_ART_CURATED_WORKS_V1){
 assert.equal(sacredArtWorkById(w.id),w);
 assert.ok(w.categoryIds.length>0);
 assert.ok(w.depictedPersonsCandidates.length>0);
 assert.equal(w.newPhotoPublication,false);
 for(const c of w.categoryIds){
  assert.ok(SACRED_ART_CATEGORIES_V1[c],"Unknown category "+c);
  assert.ok(sacredArtWorksInCategory(c).includes(w));
  if(w.photoModuleId)assert.ok(sacredArtWorksInCategory(c,{releasedOnly:true}).includes(w));
 }
}
const slots=new Set();
for(const item of queue.nextNineSourcePhotographWorkQueue){
 const w=sacredArtWorkById(item.id);
 assert.ok(w);
 assert.equal(w.photoModuleId,null);
 assert.deepEqual(w.existingMatching.existingPrayerSlots,item.selectedSlotIds);
 assert.equal(w.photoReleaseState,"PHOTOGRAPH_NOT_RELEASED");
 for(const s of item.selectedSlotIds){
  assert.equal(sacredArtMatchesForPrayerSlot(s).length,1);
  assert.equal(sacredArtMatchesForPrayerSlot(s)[0].id,item.id);
  assert.ok(!slots.has(s),"Duplicate Prayer slot "+s);
  slots.add(s);
 }
}
assert.equal(slots.size,41);
assert.equal(sacredArtMatchesForPrayerSlot("not-a-real-prayer-slot").length,0);
const gen="data/artwork/sacred-art-category-match-989-267.v1.json";
if(existsSync(new URL("../"+gen,import.meta.url))){
 const master=read(gen);
 assert.equal(master.schema,"AO_SACRED_ART_CATEGORIES_AND_EXISTING_MATCHES_989_267_V1");
 assert.equal(master.counts.researchArtworkGroups,989);
 assert.equal(master.counts.researchGroupsWithTitleBasedCategoryCandidates,657);
 assert.equal(master.counts.researchGroupsStillWithoutTitleCategory,332);
 assert.equal(master.counts.exactSaintSubjectScopeCorrections,3);
 assert.ok(master.policies.retainOriginalLexicalTagsAfterSaintSubjectDisambiguation);
 assert.ok(master.generatedFrom.includes("scripts/art/sacred-art-saint-scope-exceptions-v1.mjs"));
 for(const exception of SACRED_ART_SAINT_SCOPE_EXCEPTIONS_V1){
  const derived=master.researchGroupsTitleCandidateIndex.find(w=>w.workGroupId===exception.workGroupId);
  assert.ok(derived?.saintSubjectTitleScopeReviewed);
  assert.deepEqual(derived.categoryCandidates,["SAINTS"],"Saint-specific image must not become a Christ event: "+exception.workGroupId);
  assert.ok(derived.existingLexicalSubjectTags.some(t=>t.tag===exception.excludedTag&&t.categoryId===null&&
     t.subjectScopeExclusion===exception.reason));
  assert.ok(master.categoryDefinitions.find(c=>c.id==="SAINTS")?.proposedResearchGroupIds.includes(exception.workGroupId));
  assert.equal(master.categoryDefinitions.some(c=>c.id!=="SAINTS"&&c.proposedResearchGroupIds.includes(exception.workGroupId)),false);
  assert.ok(known[exception.workGroupId].subjectCandidates.some(t=>t.tag===exception.excludedTag),
    "Original 989 research source must not be rewritten");
 }
 assert.equal(master.canonicalPrayerSlotCategoryCrosswalk.some(s=>
   s.researchGroupIds.some(id=>SACRED_ART_SAINT_SCOPE_EXCEPTIONS_V1.some(e=>e.workGroupId===id))),false,
   "Corrected examples have no linked Prayer assignment requiring recomputation");

 assert.equal(master.counts.canonicalPrayerPositions,267);
 assert.equal(master.counts.previouslyReleasedPhotoEntries,16);
 assert.equal(master.counts.manuallyCategorizedCuratedWorks,25);
 assert.equal(master.counts.pendingWorksWithExistingPrayerMatches,9);
 assert.equal(master.counts.existingPendingPrayerPlacementLinks,41);
 assert.equal(master.counts.newPhotoPublications,0);
 assert.equal(master.counts.newPrayerOverrides,0);
 assert.equal(master.researchGroupsTitleCandidateIndex.length,989);
 assert.equal(master.canonicalPrayerSlotCategoryCrosswalk.length,267);
 assert.equal(master.pendingArtworksWithPreexistingSlots.length,9);
 assert.equal(master.releasedPhotoCategories.length,16);
 assert.ok(master.researchGroupsTitleCandidateIndex.every(w=>w.visualSubjectVerification===false));
 assert.ok(master.researchGroupsTitleCandidateIndex.every(w=>w.userApprovedForNewDate===false));
 assert.ok(master.canonicalPrayerSlotCategoryCrosswalk.every(w=>w.newArtworkSelection===false&&w.newPhotoRelease===false));
 assert.ok(master.policies.preserveAllPriorUserApprovalsAndRejections);
 assert.ok(master.policies.neverPromoteLexicalTagToVerifiedDepiction);
}
console.log("PASS: 25 actual published+matched artwork classifications, 41 existing Prayer slots; 989 provisional research groups and 267 existing Prayer positions preserved.");
