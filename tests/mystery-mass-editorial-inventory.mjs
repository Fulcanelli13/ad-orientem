// Phase 1 editorial ownership and provenance gate. No runtime mutations.
// Run from repository root: node tests/mystery-mass-editorial-inventory.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const get=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const matrix=get('data/learn/research/mystery-mass-canonical-39-owner-inventory-20261014.v1.json');
const main=get('data/learn/mass-formation-campion.v1.json');
const guide=get('data/presentation/guide-registry.v1.json');
const live=get('data/presentation/reader-text-sung.v1.json');
const canon=get('data/presentation/reader-canon-source-map.v1.json');
const doc=readFileSync(new URL('../docs/research/MYSTERY-OF-MASS-CANONICAL-CONSOLIDATION-20261014.md',import.meta.url),'utf8');
assert.equal(matrix.schema,'AO_MYSTERY_OF_MASS_CANONICAL_EDITORIAL_INVENTORY_V1');
assert.equal(matrix.sections.length,39);
assert.equal(matrix.stages.length,8);
assert.equal(matrix.counts.existingClaims,24);
assert.equal(main.stages.length,8);
assert.equal(main.stages.reduce((n,x)=>n+x.claims.length,0),24);
assert.equal(guide.entryCount,32);
assert.equal(guide.status,'RECOVERED_CONTINUITY_CERTIFIED');
assert.equal(matrix.counts.existingGuideEntries,32);
assert.equal(matrix.counts.massBibleDrafts,31);
assert.equal(matrix.counts.massBiblePolished,20);
assert.equal(matrix.counts.guerangerCueRecords,41);
assert.equal(matrix.counts.lanslotsBilingualDrafts,7);
assert.equal(matrix.counts.lanslotsCriticalCases,10);
assert.equal(matrix.counts.lanslotsNonparentheticalConnections,16);
assert.equal(matrix.counts.lanslotsExactPrayerAnchors,12);
assert.equal(matrix.counts.newApprovedPublicationEntries,0);
assert.equal(matrix.publication.newApprovals,0);
assert.equal(matrix.publication.doNotTouchProductionGuide,true);
assert.equal(matrix.publication.doNotChangeMassText,true);
assert.equal(matrix.publication.doNotChangeNativeReader,true);
const stages=new Map(main.stages.map(x=>[x.id,x]));
const knownCue=new Map(),blockByCue=new Map();
for(const b of live.blocks)for(const u of b.units){knownCue.set(u.cue_id,u);blockByCue.set(u.cue_id,b);}
const segmentByBlock=new Map(canon.segments.flatMap(x=>x.blockIds.map(bid=>[bid,x.id])));
const resolveCue=cueId=>{
 const b=blockByCue.get(cueId);
 assert(b,'Guéranger cue missing: '+cueId);
 return segmentByBlock.get(b.Block_ID)??'AO.CARD.'+b.Macro_ID.match(/\d+$/)[0].padStart(3,'0');
};
const sectionIds=new Set(matrix.sections.map(x=>x.sectionId));
assert.equal(sectionIds.size,39,'39 different canonical content owners');
assert.equal(new Set(matrix.sections.map(x=>x.oneCanonicalExplanationOwner)).size,39);
const idCount=new Map();
const seenGueranger=new Map();
const sourceBilingual=new Map();
let totalMB=0,polished=0,totalGueranger=0,totalLan=0,totalCritical=0,totalNP=0,totalCueAnchors=0;
let baseCovered=0,enhanced=0,polishedSections=0,withFrg=0,empty=0;
for(const row of matrix.sections){
 assert.equal(row.oneCanonicalExplanationOwner,row.sectionId);
 assert(stages.has(row.mainFormationChapter),'bad formation stage '+row.sectionId);
 assert.equal(row.crossCuttingTeachingChapters.length,1);
 assert.equal(row.crossCuttingTeachingChapters[0],'MF02');
 assert.equal(row.existingGuidePresent,true);
 assert(guide.entries[row.liveGuideExistingSource],row.sectionId+' missing Guide');
 const s=row.selectedResearchSourceIds;
 const sourceCount=Object.values(s).reduce((n,a)=>n+a.length,0);
 if(sourceCount)enhanced++;else empty++;
 if(row.primaryDraftCandidateIds.length)polishedSections++;
 if(s.guéranger.length)withFrg++;
 for(const item of s.massBible){
  totalMB++;
  idCount.set(item.id,(idCount.get(item.id)||0)+1);
  assert.equal(item.publicationApproved,false);
  assert.equal(row.primaryDraftCandidateIds.includes(item.id),item.manuscriptPolished);
  if(item.manuscriptPolished)polished++;
  if(item.id==='MB01')assert.equal(item.disposition,'MERGE_INTO_MB02');
  if(item.id==='MB20')assert.equal(item.disposition,'SUPPORT_MB19_BUT_DIFFERENT_SCRIPTURE_PASSAGE');
 }
 for(const item of s.guéranger){
  totalGueranger++;
  assert.equal(resolveCue(item.sourceCueId),row.sectionId,'Guéranger source cue owner mismatch: '+item.id);
  seenGueranger.set(item.id,(seenGueranger.get(item.id)||0)+1);
 }
 for(const item of s.lanslotsBilingual){
  totalLan++;
  sourceBilingual.set(item.id,(sourceBilingual.get(item.id)||0)+1);
  assert.equal(item.association,item.cue?'PRAYER_MATCH':'THEMATIC_CONTEXT_ONLY');
  if(item.cue)assert.equal(resolveCue(item.cue),row.sectionId,'Lanslots prayer cue owner '+item.id);
 }
 totalCritical+=s.lanslotsCritical.length;
 totalNP+=s.lanslotsNonparenthetical.length;
 totalCueAnchors+=s.lanslotsExactLatinAnchors.length;
 assert.equal(row.publicationGate,'NOT_APPROVED_FOR_EXPANDED_MODULE');
 assert.equal(row.contentGaps.requiresEnglishFrenchPublicationApproval,true);
 assert.equal(row.contentGaps.requiresLiturgicalFormCheck,true);
 baseCovered++;
}
assert.equal(baseCovered,39);
assert.equal(totalMB,31);
assert.equal(idCount.size,31);
assert([...idCount.values()].every(x=>x===1),'no duplicate Bible exposition row');
assert.equal(polished,20);
assert.equal(totalGueranger,41);
assert.equal(seenGueranger.size,41);
assert([...seenGueranger.values()].every(x=>x===1));
assert.equal(totalLan,7);
assert.equal(sourceBilingual.size,7);
assert([...sourceBilingual.values()].every(x=>x===1));
assert.equal(totalCritical,9,'eight unique prayer-owned critical topics, with one shared bread/chalice owner');
const ownedCritical=new Set(matrix.sections.flatMap(s=>s.selectedResearchSourceIds.lanslotsCritical));
assert.equal(ownedCritical.size,8);
assert.deepEqual(matrix.contextualNonSectionCriticalItems.map(x=>x.id),['L1897-DISC-04','L1897-DISC-09']);
for(const c of matrix.contextualNonSectionCriticalItems){assert(!ownedCritical.has(c.id));assert.equal(c.inlineGuideCue,null);assert(stages.has(c.lessonOwner));}
assert.equal(new Set([...ownedCritical,...matrix.contextualNonSectionCriticalItems.map(x=>x.id)]).size,10,'all ten critical source records accounted for');
assert.equal(totalNP,16);
assert.equal(totalCueAnchors,12);
assert.equal(enhanced,33);
assert.equal(empty,6);
assert.equal(polishedSections,15);
assert.equal(withFrg,21);
const noSup=matrix.sections.filter(row=>Object.values(row.selectedResearchSourceIds).every(a=>a.length===0)).map(x=>x.sectionId);
assert.deepEqual(noSup,['AO.CARD.004','AO.CARD.006','AO.CARD.008','AO.CARD.012','AO.CARD.024','AO.CARD.028']);
const chapterOwner=new Set();
for(const stage of matrix.stages){
 const original=stages.get(stage.stageId);
 assert(original,'unknown stage '+stage.stageId);
 assert.deepEqual(stage.existingClaimIds,original.claims.map(x=>x.id));
 assert.equal(stage.existingClaimCount,3);
 assert.equal(stage.currentMainStatus,'EXISTS_IN_MAIN_BRANCH_LEARN_MASS_RUNTIME');
 if(stage.stageId==='MF02'){
  assert(stage.crossCutting,'MF02 is cross-sectional, not a static Mass prayer');
  assert.equal(stage.canonicalSectionIds.length,0);
 }else{
  for(const id of stage.canonicalSectionIds){
   assert(sectionIds.has(id));
   assert(!chapterOwner.has(id),'section owned by two formation chapters: '+id);
   chapterOwner.add(id);
  }
 }
}
assert.equal(chapterOwner.size,39);
for(const src of Object.values(matrix.researchSourceBranches)){
 assert(src.branch&&src.path);
 if(src.pr)assert(/^([0-9a-f]{40})$/.test(src.sha),'pin research PR source commit');
}
assert.equal(matrix.nextReleaseSequence.length,5);
assert(matrix.nextReleaseSequence.every(g=>!g.passed));
assert(doc.includes('39-section owner-by-owner selection ledger'));
assert(doc.includes('FRG01–FRG30'));
assert(doc.includes('The structured'));
console.log('PASS Mystery of the Mass Phase 1: 8 lessons/24 claims, 39 unique owners, 32 inherited Guide entries, 31 Bible drafts (20 polished), 41 FRG cues, 7 Lanslots drafts, 16 Bible contexts, 12 exact source anchors; 33 enriched + 6 source-light; zero publication promotion.');
