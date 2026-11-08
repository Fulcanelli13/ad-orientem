#!/usr/bin/env node
/**
 * Strict read-only research overlay; does NOT certify photos, approve new
 * artwork, overwrite existing Prayer selections, or change public categories.
 */
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const ledgerPath="data/artwork/research-priority-16-source-audit-20261109.v1.json";
const ledger=read(ledgerPath);
const frozen=read("data/artwork/research-semantic-candidates-989.v1.json");
const derived=read("data/artwork/sacred-art-category-match-989-267.v1.json");
const aliases=read("data/artwork/research-prior-duplicate-decisions.v1.json");
const prayer=read("data/prayer/artwork-editorial-20261101/curatorial-master-267-20261101.v1.json");
assert.equal(ledger.schema,"AO_SACRED_ART_PRIORITY16_SOURCE_AUDIT_V1");
assert.equal(ledger.scope,"NONPUBLISHING_RESEARCH_SOURCE_SIDE_CAR");
assert.equal(ledger.artworks.length,16);
assert.equal(frozen.artworks.length,989);
assert.equal(derived.researchGroupsTitleCandidateIndex.length,989);
assert.equal(derived.counts.researchGroupsWithTitleBasedCategoryCandidates,657);
assert.equal(derived.counts.researchGroupsStillWithoutTitleCategory,332);
assert.equal(derived.canonicalPrayerSlotCategoryCrosswalk.length,267);
assert.equal(ledger.policies.doNotAutoPromoteCommons,true);
assert.equal(ledger.policies.pradoImagesExcluded,true);
assert.equal(ledger.policies.physicalArtworkIdentityNotProvenByTitle,true);
assert.equal(ledger.policies.biblicalEventDistinctFromTypology,true);
assert.equal(ledger.policies.keepScopeSpecificOwnerDecisions,true);
assert.equal(ledger.policies.leaveProtected65CardMassAndRosaryUnchanged,true);
assert.equal(ledger.policies.newPhotoPublication,false);
const priority=frozen.artworks.filter(w=>
 (w.workGroupId.startsWith("CANONICAL::")||w.workGroupId.startsWith("PRAYER::")||w.workGroupId.startsWith("HERO::")) &&
 w.subjectCandidates.length===0
);
assert.equal(priority.length,16,"Unexpected priority registry drift");
assert.deepEqual(ledger.artworks.map(a=>a.workGroupId),priority.map(a=>a.workGroupId),
 "Exactly the source-order 16 unclassified high-priority groups must be covered");
const knownCategories=new Set(derived.categoryDefinitions.map(c=>c.id));
let categorised=0,contextual=0,unidentified=0,blank=0;
const idSet=new Set(),byId=new Map();
for(const [index,row] of ledger.artworks.entries()){
 const original=priority[index];
 assert.ok(!idSet.has(row.workGroupId),"Each source group exactly once");
 idSet.add(row.workGroupId);byId.set(row.workGroupId,row);
 assert.equal(row.title,original.title,"Do not alter original source title");
 assert.equal(row.artist,original.artist,"Do not infer an unidentified artist");
 assert.equal(row.sourceGroupKind,row.workGroupId.split("::")[0]);
 const base=derived.researchGroupsTitleCandidateIndex.find(w=>w.workGroupId===row.workGroupId);
 assert.deepEqual(base?.categoryCandidates,[],"Proposals must not silently become active categories");
 assert.equal(base?.visualSubjectVerification,false,"Do not certify depicted persons by catalogue title alone");
 assert.equal(row.auditOnly,true);
 assert.equal(row.changeExistingUserApproval,false);
 assert.equal(row.newPhotoPublicationAuthorized,false);
 assert.equal(row.exactOriginalPhotoRightsAndPixelQaCertified,false);
 assert.equal(row.proposal.visualSourceVerification,false);
 assert.ok(typeof row.requiredBeforePromotion==="string"&&row.requiredBeforePromotion.length>10);
 assert.ok(Array.isArray(row.sourceLeads));
 assert.ok(Array.isArray(row.proposal.categoryIds));
 assert.ok(Array.isArray(row.proposal.scriptureReferences));
 for(const cat of row.proposal.categoryIds)assert.ok(knownCategories.has(cat),"Existing taxonomy only: "+cat);
 for(const source of row.sourceLeads){
  assert.match(source.url,/^https:\/\//);
  assert.ok(source.institution&&source.objectId&&source.role);
  assert.ok(!/common(s)?\.wikimedia\.org/i.test(source.url),
   "No Commons-only new source promotion in exact 16-wave");
 }
 for(const key of row.protectedOriginalDecisionKeys||[]){
  assert.ok(prayer.original28OctUnmodifiedDecisions.some(d=>d.key===key),
   "Preserve original keep/reject decision before any source join: "+key);
 }
 if(!row.title){blank++;assert.equal(row.artist,null);}
 if(row.proposal.categoryIds.length)categorised++;
 if(row.proposal.classificationContext==="MORNING_THEMATIC_NON_SCRIPTURAL_GENRE_PAINTING")contextual++;
 if(row.proposal.classificationContext==="UNIDENTIFIED_PRAYER_ARCHIVE_ENTRY")unidentified++;
}
assert.equal(blank,2);
assert.equal(categorised,12);
assert.equal(contextual,2);
assert.equal(unidentified,2);
assert.deepEqual(ledger.counts,{
 priorityArtworkGroups:16,canonical:11,prayer:3,hero:2,
 originalSourceEntriesWithBlankTitle:2,titleBearingEntries:14,
 directCategoryProposals:12,thematicGenreEntriesWithoutCategory:2,
 unidentifiedPrayerEntries:2,sourceAliasPairsReused:1,
 newVerifiedDepictions:0,newPhotoPublications:0,newEditorialApprovals:0
});
assert.deepEqual(["CANONICAL","PRAYER","HERO"].map(kind=>
 ledger.artworks.filter(x=>x.sourceGroupKind===kind).length),[11,3,2]);
const saintCrosstalk=byId.get("CANONICAL::ART-ean-uguste-ominique-ngres-oan-of-rc-at-oronation-of-harles");
assert.deepEqual(saintCrosstalk.proposal.categoryIds,["SAINTS"]);
assert.deepEqual(saintCrosstalk.proposal.scriptureReferences,[],
 "A French historical saint event is not a Scripture episode");
const meirelles=byId.get("HERO::museu-nacional-belas-artes:meirelles-first-mass-brazil-1860");
assert.deepEqual(meirelles.proposal.categoryIds,["CHURCH_LIFE"]);
assert.deepEqual(meirelles.proposal.scriptureReferences,[],
 "Historical Mass must never be interpreted as the biblical Last Supper or 1962 Missal event");
const babel=byId.get("CANONICAL::ART-ieter-ruegel-the-lder-ower-of-abel");
assert.equal(babel.sourceLeads.length,2);
assert.ok(babel.sourceLeads.every(x=>x.role==="COMPETING_PHYSICAL_VERSION"));
assert.equal(new Set(babel.sourceLeads.map(x=>x.objectId)).size,2);
assert.match(babel.requiredBeforePromotion,/TWO_DISTINCT_BRUEGEL_PAINTINGS/);
const serpent=byId.get("CANONICAL::ART-eter-aul-ubens-he-razen-erpent");
assert.deepEqual(serpent.proposal.categoryIds,["OLD_TESTAMENT"]);
assert.deepEqual(serpent.proposal.thematicOnlyScriptureReferences,["John 3:14-15"]);
const isaac=byId.get("CANONICAL::ART-aravaggio-he-acrifice-of-saac");
assert.deepEqual(isaac.proposal.categoryIds,["OLD_TESTAMENT"]);
assert.ok(!isaac.proposal.categoryIds.includes("PASSION"),
 "Typology does not create a second depicted Gospel event");
const altomonte=byId.get("PRAYER::w7-altomonte"),ricci=byId.get("PRAYER::w4-ricci");
assert.equal(altomonte.title,"");
assert.equal(ricci.title,"");
assert.deepEqual(altomonte.proposal.categoryIds,[]);
assert.deepEqual(ricci.proposal.categoryIds,[]);
assert.equal(ricci.relatedEditorialObjectNotAnIdentityMatch.notAnIdentityMatch,true);
const decisionFor=key=>prayer.original28OctUnmodifiedDecisions.find(d=>d.key===key);
assert.equal(decisionFor("communion::w4-ricci")?.action,"keep");
assert.equal(decisionFor("good-death::w4-ricci")?.action,"reject");
for(const key of ["good-death::w7-altomonte","dying::w7-altomonte"]){
 assert.equal(decisionFor(key)?.action,"keep");
 assert.match(decisionFor(key)?.note??"",/better quality/);
}
const pair=["HERO::new:jules-breton-song-of-the-lark-artic-94841","PRAYER::morning--primary"];
const existingAlias=aliases.reconciledSourceAliases.find(a=>a.id==="DUP-8de26ac1927601");
assert.equal(existingAlias?.status,"EXACT_SOURCE_RECORD_ALIAS_NO_VISUAL_CHOICE");
assert.deepEqual([...existingAlias.recordIds].sort(),[...pair].sort());
for(const id of pair){
 const row=byId.get(id);
 assert.equal(row.existingSourceAliasId,existingAlias.id);
 assert.deepEqual(row.proposal.categoryIds,[],
  "Breton's Morning genre work is not a painted biblical Creation event");
 assert.deepEqual(row.proposal.scriptureReferences,[]);
 assert.equal(row.sourceLeads[0].url,existingAlias.sharedSource);
}
const morning=prayer.assignments.find(a=>a.slot==="COV-daily.morning");
assert.equal(morning?.currentAssignment?.painting?.title,"The Song of the Lark");
assert.equal(morning.currentAssignment.photoRightsAndPixelQAPassed,false);
const build=readFileSync(new URL("../tools/build-web-preview.mjs",import.meta.url),"utf8");
assert.ok(build.includes(' "data/artwork/research-priority-16-source-audit-20261109.v1.json",'),
 "Public Pages build must explicitly strip this private research-sidecar data");
const published=new URL("../dist/web-preview/"+ledgerPath,import.meta.url);
if(existsSync(new URL("../dist/web-preview/index.html",import.meta.url))){
 assert.equal(existsSync(published),false,"New research sidecar leaked into built public Pages");
}
console.log("Sacred Art 16-work source triage: 12 provisional category proposals, 2 contextual source aliases, 2 unidentified holds; no photo, Prayer, Rosary, Mass or public release override");
