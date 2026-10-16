import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const json=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const n=json('data/learn/research/mystery-mass-source-led-narrative-drafts-20261014.v1.json');
const map=json('data/learn/research/mystery-mass-two-chronologies-evidence-crosswalk-20261014.v1.json');
const p=json('data/learn/research/mystery-mass-selected20-bilingual-mystagogy-20261014.v1.json');
const q=json('data/learn/research/mystery-mass-24-bilingual-gap-manuscript-20261014.v1.json');
const a=json('data/learn/research/mystery-mass-alphonsus-22-passage-source-snapshot-20261014.v1.json');
assert.equal(n.status,'ENGLISH_BIBLICAL_SCENE_SCRIPT_DRAFT_AND_UNALTERED_DEEP_STUDY_CONTENT_UNPUBLISHED');
assert.equal(n.biblicalNarrativeDrafts.length,24);
assert.equal(n.liturgicalStudySelections.length,39);
assert.equal(n.counts.existingStudyDrafts,44);
assert.equal(n.counts.biblicalScenesWithAlphonsusOriginalPassages,19);
assert.equal(n.counts.alphonsusCitedPassageLinks,30);
const canon=json('data/learn/research/mystery-mass-roman-canon-14-critical-narrative-20261014.v1.json');
assert.equal(canon.canonPrayers.length,14);
assert.equal(n.counts.canonSourceCriticalPrayerExpositions,14);
const editorialCanon=new Map(canon.canonPrayers.map(x=>[x.massOwner,x]));
assert.equal(editorialCanon.size,14);
assert.equal(n.liturgicalStudySelections.filter(x=>x.canonSourceCriticalStudy).length,14);
for(const x of n.liturgicalStudySelections.filter(x=>x.owner.startsWith('AO.CANON.'))){
 const expected=editorialCanon.get(x.owner);
 assert.ok(expected,x.owner);
 assert.ok(expected.coreTheologicalQuestion.length>=60);
 assert.ok(expected.sourceLedExplanationDraftEN.length>=320);
 assert.ok(expected.transitionInLiturgicalJourney.length>=65);
 assert.equal(expected.published,false);
 assert.equal(x.canonSourceCriticalStudy.researchRecordId,x.owner);
 assert.equal(x.canonSourceCriticalStudy.authorDrivenEnglishExplanation,expected.sourceLedExplanationDraftEN);
 assert.equal(x.canonSourceCriticalStudy.approved,false);
 assert.ok(expected.sourceAnchorIds.guérangerOriginalFrench.length>0);
 assert.ok(expected.sourceAnchorIds.inheritedBilingualManuscripts.length>0);
}

assert.deepEqual(n.biblicalNarrativeDrafts.map(x=>x.id),map.biblicalChronology.map(x=>x.id));
assert.deepEqual(n.liturgicalStudySelections.map(x=>x.owner),map.liturgicalChronology.map(x=>x.ownerId));
const alph=new Map(a.alphonsusPassageClaims.map(x=>[x.id,x]));
const allManus=new Map([...p.records,...q.records].map(x=>[x.id,x]));
let alphCount=0,manusCount=0;
for(let i=0;i<n.biblicalNarrativeDrafts.length;i++){
 const x=n.biblicalNarrativeDrafts[i],truth=map.biblicalChronology[i];
 assert.equal(x.order,i+1);
 assert.equal(x.published,false);
 assert.equal(x.artwork.canonicalArtworkIds.length,0);
 assert.ok(x.narrative.length>=440,`${x.id} has a too-short generic passage`);
 assert.ok(x.transitionToNext.length>=65,`${x.id} missing narrative connective tissue`);
 assert.deepEqual(x.primaryMassAnchors,truth.relatedMassOwnerIds);
 assert.deepEqual(x.primaryScripturePassages,truth.scriptureReferences);
 assert.equal(x.relationType,truth.relationType);
 for(const evidence of x.substantialOriginalAuthorArguments){
   alphCount++;
   assert.ok(alph.has(evidence.claimId),evidence.claimId);
   const original=alph.get(evidence.claimId);
   assert.equal(evidence.printedLocator,original.printedLocation);
   assert.equal(evidence.originalAuthorParaphrase,original.paraphrase);
   assert.ok(evidence.sourcePageUrl.startsWith('https://'));
 }
}
assert.equal(alphCount,30);
for(const x of n.liturgicalStudySelections){
 assert.ok(x.studyOfMassExistingDrafts.length>=1,x.owner);
 assert.equal(x.publicationApproved,false);
 for(const m of x.studyOfMassExistingDrafts){
   manusCount++;
   const original=allManus.get(m.id);
   assert.ok(original,m.id);
   assert.equal(m.sourceOwner,original.sourceFirstOwner);
   assert.equal(m.originalEnglishDeep,original.deep.en);
   assert.equal(m.originalFrenchDeep,original.deep.fr);
   assert.equal(m.releaseApproved,false);
   assert.ok(m.originalEnglishDeep.length>80 && m.originalFrenchDeep.length>80);
 }
}
assert.equal(manusCount,44);
assert.ok(n.methodology.production.includes('No runtime'));
console.log('Source-led narrative: 24 substantial English scenes with transitions, 30 exact Alphonsus-locator links across 19 scenes; 39 Mass sections reuse 44 byte-matched English/French original study drafts. Zero runtime mutation.');
