// Phase 2 research manuscript gate; counts, source links and canonical ownership.
// Node 22+, no external dependencies. Does not modify runtime.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const inventory=load("data/learn/research/mystery-mass-canonical-39-owner-inventory-20261014.v1.json");
const selected=load("data/learn/research/mystery-mass-selected20-bilingual-mystagogy-20261014.v1.json");
const gaps=load("data/learn/research/mystery-mass-24-bilingual-gap-manuscript-20261014.v1.json");
const lessons=load("data/learn/research/mystery-mass-eight-lesson-bilingual-synthesis-20261014.v1.json");
const baseline=load("data/learn/mass-formation-campion.v1.json");
const guide=load("data/presentation/guide-registry.v1.json");
const old=new Map(inventory.sections.map(x=>[x.sectionId,x]));
const stageIds=new Set(baseline.stages.map(x=>x.id));
const used=new Map(),bySection=new Map();
assert.equal(inventory.sections.length,39);
assert.equal(selected.records.length,20);
assert.equal(selected.overview.uniqueSourceFirstOwners,15);
assert.equal(gaps.records.length,24);
assert.equal(gaps.count,24);
assert.equal(lessons.records.length,8);
assert.equal(lessons.recordCount,8);
assert.equal(lessons.owner,"learn.mass");
assert.equal(lessons.noParallelCourse,true);
assert.equal(lessons.noChangesToMassRuntime,true);
assert.equal(selected.noNewReader,true);
assert.equal(selected.noMassTextChange,true);
assert.equal(gaps.publicationApproved,false);
const urlRe=/\[[^\]]+\]\(https:\/\/[^\s)]+(?:\([^)]*\)[^\s)]*)*\)/g;
const links=t=>Array.from(String(t).matchAll(urlRe)).length;
for(const entry of selected.records){
 const owner=old.get(entry.sourceFirstOwner);
 assert(owner,"missing section for selected "+entry.id);
 assert(owner.primaryDraftCandidateIds.includes(entry.sourceManuscriptId),"not a primary source in inventory "+entry.id);
 assert(!used.has(entry.sourceManuscriptId),"selected MB source appears twice");
 used.set(entry.sourceManuscriptId,entry.sourceFirstOwner);
 const cur=bySection.get(entry.sourceFirstOwner)||[];
 cur.push(entry.id);bySection.set(entry.sourceFirstOwner,cur);
 assert(links(entry.short.en)>=1&&links(entry.short.fr)>=1,entry.id+" short needs citations");
 assert(links(entry.deep.en)>=2&&links(entry.deep.fr)>=2,entry.id+" deep needs original 1962 and Bible links");
 assert(entry.short.en.length>100&&entry.short.fr.length>95,entry.id+" short text absent");
 assert(entry.deep.en.length>300&&entry.deep.fr.length>300,entry.id+" full text absent");
 assert(entry.sourceHierarchy.normative1962.startsWith("https://"));
 assert(entry.sourceHierarchy.biblicalText.startsWith("https://"));
 assert(entry.provenance.massBiblePR===1082);
 assert(entry.publishing.approved===false);
 assert(entry.publishing.requires.length>=2);
 const ids=new Set(owner.selectedResearchSourceIds.guéranger.map(x=>x.id));
 for(const g of entry.guerangerExistingOwner){assert(ids.has(g.id),"Guéranger not in owner "+entry.id);assert(g.sourceLocator.startsWith("https://"));}
 for(const paragraph of entry.editorialReconciliation.supplementarySubstantiveParagraphs){
  assert(links(paragraph.text.en)>0&&links(paragraph.text.fr)>0);
  assert.equal(paragraph.status,"SECONDARY_DRAFT_NOT_APPROVED");
 }
}
assert.equal(used.size,20);
assert.equal(bySection.size,15);
const gapOwners=new Set();
for(const entry of gaps.records){
 const owner=old.get(entry.sourceFirstOwner);
 assert(owner,"unknown gap owner "+entry.id);
 assert.equal(owner.primaryDraftCandidateIds.length,0,"gap owner already has polished Bible passage");
 assert(!gapOwners.has(entry.sourceFirstOwner),"two new gap owners");
 gapOwners.add(entry.sourceFirstOwner);
 assert(stageIds.has(entry.formationStage));
 assert.equal(entry.formationStage,owner.mainFormationChapter);
 assert.equal(entry.existingGuideOwner,owner.liveGuideExistingSource);
 assert.equal(entry.originalGuideSourceAlreadyExists,true);
 assert(guide.entries[entry.existingGuideOwner],"missing inherited 1962 Guide owner");
 assert(links(entry.short.en)>=1&&links(entry.short.fr)>=1);
 assert(links(entry.deep.en)>=1&&links(entry.deep.fr)>=1);
 assert(entry.short.en.length>70&&entry.short.fr.length>70);
 assert(entry.deep.en.length>350&&entry.deep.fr.length>390,"substantive long research drafts required "+entry.id);
 for(const inherited of owner.conditionalityFlags)assert(entry.conditionalityFlags.includes(inherited),"existing owner condition must be retained: "+entry.id+" "+inherited);
 assert.equal(entry.publication.approved,false);
 assert.equal(entry.publication.hasNativeFrenchReview,false);
 assert.equal(entry.publication.requiresRubricAndEditionAcceptance,true);
}
assert.equal(gapOwners.size,24);
for(const owner of inventory.sections)assert(bySection.has(owner.sectionId)!==gapOwners.has(owner.sectionId),"exactly one of selected/gap must cover "+owner.sectionId);
assert.equal(new Set([...bySection.keys(),...gapOwners]).size,39);
assert.equal(selected.records.filter(x=>x.sourceFirstOwner==="AO.CANON.09").length,3,"Abel, Abraham, Melchisedech should be submoments of Supra quae");
assert(selected.records.some(x=>x.sourceManuscriptId==="MB24"&&x.sourceFirstOwner==="AO.CARD.022"),"priest's centurion verse ownership");
assert(gaps.records.some(x=>x.sourceFirstOwner==="AO.CARD.024"),"faithful Communion preparation distinct");
assert(gaps.records.some(x=>x.sourceFirstOwner==="AO.CANON.03"&&x.deep.en.includes("8 December 1962")),"1962 Joseph amendment");
assert(gaps.records.some(x=>x.sourceFirstOwner==="AO.CANON.10"&&x.deep.en.includes("not a dogmatic identification")),"angels disputed");
assert(gaps.records.some(x=>x.sourceFirstOwner==="AO.CARD.020"&&x.deep.en.includes("second Eucharistic Consecration")),"no second consecration at commingling");
assert(gaps.records.some(x=>x.sourceFirstOwner==="AO.CARD.028"&&x.deep.en.includes("Requiescant in pace")),"dismissal variants preserved");
assert(selected.records.some(x=>x.sourceManuscriptId==="MB02"&&x.sourceFirstOwner==="AO.CARD.001"),"Psalm 42 base");
assert(!selected.records.some(x=>x.sourceManuscriptId==="MB01"),"MB01 duplicate should not get its own long exposition");
const lessonSeen=new Set();
let paras=0;
for(const lesson of lessons.records){
 assert(stageIds.has(lesson.stageId));
 assert(!lessonSeen.has(lesson.stageId));lessonSeen.add(lesson.stageId);
 const stage=baseline.stages.find(x=>x.id===lesson.stageId);
 assert.deepEqual(lesson.existingClaimIds,stage.claims.map(x=>x.id));
 assert(lesson.synopsis.en.length>70&&lesson.synopsis.fr.length>75);
 assert(lesson.paragraphs.length>=2);
 for(const p of lesson.paragraphs){
  assert(links(p.en)>=1&&links(p.fr)>=1,"each synthesis paragraph has source link");
  assert(p.en.length>260&&p.fr.length>280);
  assert(p.sourceKinds.every(x=>x.url.startsWith("https://")));
  paras++;
 }
 for(const sec of lesson.linksToExistingSections)assert(old.has(sec),"lesson links unknown section "+sec);
 assert.equal(lesson.publicationApproved,false);
}
assert.equal(lessonSeen.size,8);
assert.equal(paras,16);
assert.equal(inventory.counts.newApprovedPublicationEntries,0);
console.log("PASS Mystery of Mass Phase 2: 20 polished bilingual selections + 24 gap sections = 39 unique owners; 44 source-linked explanations, 8 course lessons with 16 sourced bilingual paragraphs; 0 runtime/publication promotions.");
