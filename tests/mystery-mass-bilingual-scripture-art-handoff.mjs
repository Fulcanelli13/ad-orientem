import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';
import {parseScriptureContext} from '../src/scripture/context.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const en=read('data/learn/research/mystery-mass-source-led-narrative-drafts-20261014.v1.json');
const fr=read('data/learn/research/mystery-mass-biblical-24-french-editorial-drafts-20261014.v1.json');
const handoff=read('data/learn/research/mystery-mass-24-bible-atlas-artwork-scripture-handoff-20261014.v1.json');
const places=read('data/explore/bible-places-compact.v1.json');
const ids=new Map(places.entries.flatMap(p=>(p.events||[]).map(e=>[e.id,{place:p.id,reference:e.reference}])));
assert.equal(en.biblicalNarrativeDrafts.length,24);
assert.equal(fr.drafts.length,24);
assert.equal(handoff.rows.length,24);
assert.equal(fr.counts.nativeFrenchApproved,0);
assert.equal(handoff.counts.artworksApprovedForMystery,0);
const ownerSet=new Set(en.liturgicalStudySelections.map(x=>x.owner));
const ed=new Set(),artTargets=new Set(),atlasEvents=new Set();
let artCount=0,atlCount=0,links=0,subjectCount=0,atlas151=0;
for(let i=0;i<24;i++){
 const source=en.biblicalNarrativeDrafts[i];
 const trans=fr.drafts[i],row=handoff.rows[i];
 assert.equal(row.sceneId,source.id);
 assert.equal(trans.sceneId,source.id);
 assert.equal(trans.approval.publication,false);
 assert.equal(row.script.editorialFrenchApproved,false);
 assert.ok(trans.titleFr.length>9 && trans.narrativeFr.length>=450 && trans.transitionFr.length>=90,source.id);
 assert.ok(trans.narrativeFr!==source.narrative,source.id);
 assert.deepEqual(trans.sourceAlphonsusIds,source.substantialOriginalAuthorArguments.map(x=>x.claimId));
 assert.deepEqual(row.studyMassOwnerIds,source.primaryMassAnchors);
 assert.ok(row.scripture.primaryContextReference.length>5);
 assert.ok(row.scripture.readMechanism.includes('AO_SCRIPTURE_CONTEXT_V1.open'));
 const refs=[row.scripture.primaryContextReference,...row.scripture.additionalContextReferences];
 assert.ok(refs.length>=1);
 for(const passage of refs){
   const parsed=parseScriptureContext(passage);
   assert.ok(parsed && parsed.passage && parsed.numbering,passage);
   links++;
 }
 if(row.atlas){
   atlCount++;
   assert.ok(ids.has(row.atlas.eventId));
   assert.equal(row.atlas.existingPlaceId,ids.get(row.atlas.eventId).place);
   assert.equal(row.atlas.reference,ids.get(row.atlas.eventId).reference);
   assert.ok(!atlasEvents.has(row.atlas.eventId));
   atlasEvents.add(row.atlas.eventId);
   if(row.atlas.in151EventSequenceCandidate)atlas151++;
 }
 if(row.artwork.canonicalBiblicalSubjectId){subjectCount++;}
 assert.equal(row.artwork.canonicalArtWorkId,null);
 assert.equal(row.artwork.artReleaseApproved,false);
 if(row.artwork.existingRelatedCuratorSelection){
   artCount++;
   const hint=row.artwork.existingRelatedCuratorSelection;
   assert.ok(hint.sourceUrl.startsWith('https://'));
   assert.match(hint.sourceOriginalSha256,/^[a-f0-9]{64}$/);
   assert.equal(hint.originalOwnerApproval,'EDITORIALLY_APPROVED_ONLY');
   assert.ok(!artTargets.has(hint.artworkId));artTargets.add(hint.artworkId);
 }
 for(const id of row.studyMassOwnerIds)assert.ok(ownerSet.has(id));
 assert.ok(!ed.has(row.sceneId));ed.add(row.sceneId);
}
assert.equal(links,51);
assert.equal(atlCount,10);
assert.equal(atlas151,9);
assert.equal(subjectCount,16);
assert.equal(artCount,6);
assert.deepEqual(handoff.counts,{scenes:24,scenesWithStablePlaceEvent:10,placeEventsPresentInAtlasSourceCandidates:9,scenesWithEditorialArtSubject:16,scenesWithExistingRelatedApprovedArtworkSelection:6,artworksApprovedForMystery:0,frenchApproved:0});
console.log('Mystery Mass bilingual source handoff: 24/24 substantive French narratives; '+links+' Scripture references parse in shared browser; 10 verified Bible Places IDs (9 Atlas candidates); 16 registered art subjects and six previously selected originals (zero cross-context approvals).');
