import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildThematicPilots} from '../src/scripture/historia-thematic-collections.js';
import {all217ThematicResearchCollections} from '../src/scripture/historia-thematic-remaining.js';
import {apply150EditorialTriage} from '../src/scripture/historia-thematic-editorial-triage.js';
import {composeHistoriaResearchEvidence} from '../src/scripture/historia-thematic-adjudication.js';
const json=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const master=json('data/research/historia-salutis-thematic-episode-reconciliation-20261021.v2.json');
const inventory=json('data/research/historia-salutis-thematic-collections-expansion-preflight-20261021.v1.json');
const segments=json('data/research/historia-salutis-thematic-composite-segments-20261021.v1.json');
const review=json('data/research/historia-salutis-thematic-batch2-boundary-audit-20261021.v1.json');
const remaining=json('data/research/historia-salutis-thematic-remainder-research-20261021.v1.json');
const triage=json('data/research/historia-salutis-thematic-150-editorial-queue-20261021.v1.json');
const base=json('data/research/historia-salutis-thematic-identity-covenant-context-20261021.v1.json');
const restoration=json('data/research/historia-salutis-core-restoration-46-adjudication-20261022.v1.json');
const atlas=json('data/research/historia-salutis-atlas-28-named-scene-review-20261022.v1.json');
const atlasOwner=json('data/explore/bible-places-compact.v1.json');
const app=readFileSync(new URL('../src/find/bible-atlas.js',import.meta.url),'utf8');
const main=json('data/research/historia-salutis-v18-continuous-reading-proof.v1.json');
const corpus=apply150EditorialTriage(all217ThematicResearchCollections(
 remaining,review,segments,inventory,buildThematicPilots(master),master.collectionTitles),triage);
const merged=composeHistoriaResearchEvidence(base,atlas,restoration,corpus);
assert.equal(merged.entries.length,81);
assert.equal(restoration.entries.length,46);
assert.deepEqual(restoration.totals,{candidates:46,priority:16,conditional:23,
 selectedAlready:2,keepSupplementary:5,actualSelectedVerseOverlaps:2,
 sameChapterButDistinctSolomonPassage:1,publicationApprovals:0});
const restored=new Map(restoration.entries.map(e=>[e.episodeId,e]));
for(const r of restoration.entries){
 const ref=corpus.flatMap(g=>g.episodes).find(x=>x.id===r.episodeId);
 assert(ref);
 assert.equal(r.originalInventoryReference,ref.originalInventoryReference);
 assert(r.nearestProposedResearchMovement.candidate54ChapterIds.length>0);
 assert(main.movements.some(m=>m.id===r.nearestProposedResearchMovement.id));
 assert.equal(r.publicationApproved,false);
 assert.equal(r.mainReaderUpdateApproved,false);
 assert.equal(r.status,'EDITORIAL_PROPOSAL_REQUIRES_ACCEPTANCE');
}
assert(restored.get('hist-omitted-031').selectedScriptureVerseIntersections.length>0);
assert(restored.get('hist-omitted-041').selectedScriptureVerseIntersections.length>0);
assert.equal(restored.get('hist-omitted-063').selectedScriptureVerseIntersections.length,0);
assert.equal(corpus.flatMap(g=>g.episodes).find(e=>e.id==='hist-omitted-063').reference,'1 Kings 11:1–13');
assert.equal(atlas.entries.length,28);
assert.equal(atlas.totals.sameNamed,26);
assert.equal(atlas.totals.sameSourceDifferentEmphasis,2);
assert.equal(atlas.totals.runtimeNavigable,9);
const atlasNames=new Map(atlasOwner.entries.flatMap(place=>(place.events||[]).map(e=>[e.id,e])));
for(const match of atlas.entries){
 const exact=atlasNames.get(match.sourceEvidence.eventId);
 assert(exact);
 assert.equal(exact.reference,match.scriptureReference);
 assert.equal(match.approvedCanonicalEpisodeIdentity,false);
 assert.equal(match.geographicalGeolocationVerified,false);
 if(match.navigation.eventKey){
  assert.equal(match.recommendedRelationship,'SAME_NAMED_SCRIPTURAL_SCENE_RESEARCH_MATCH');
  assert.equal(match.navigation.eventKey,'biblical:event:'+exact.id);
  assert(app.includes('"'+exact.id+'"'));
 }else assert.equal(match.navigation.eventKey,null);
}
assert.equal(merged.entries.filter(x=>x.atlasRuntimeNavigation?.status==='EVENT_PRESENT_IN_ATLAS_151_SEQUENCE').length,13);
assert.equal(merged.entries.filter(x=>x.editorialRecommendation).length,46);
assert.equal(merged.entries.filter(x=>x.atlasIdentity).length,39);
const mergeId=id=>merged.entries.find(x=>x.episodeId==='hist-omitted-'+id);
assert(mergeId('103').editorialRecommendation);
assert.equal(mergeId('103').atlasRuntimeNavigation.eventKey,'biblical:event:ein-karem-e1');
assert.equal(mergeId('123').atlasIdentity.relation,'SAME_SOURCE_PASSAGE_DIFFERENT_SUBACTION_OR_EMPHASIS');
assert.equal(mergeId('123').atlasRuntimeNavigation.eventKey,null);
assert.equal(mergeId('185').atlasRuntimeNavigation.eventKey,null);
assert.equal(mergeId('031').editorialRecommendation.proposedEditorialDisposition,'ALREADY_SELECTED_SCRIPTURE_RECONCILIATION');
assert.equal(mergeId('063').editorialRecommendation.selectedSourceOverlapCount,0);
const altered=structuredClone(atlas);
altered.entries.find(e=>e.episodeId==='hist-omitted-123').navigation.eventKey='biblical:event:nazareth-e3';
assert.throws(()=>composeHistoriaResearchEvidence(base,altered,restoration,corpus));
const approved=structuredClone(restoration);
approved.entries[0].publicationApproved=true;
assert.throws(()=>composeHistoriaResearchEvidence(base,atlas,approved,corpus));
console.log('PASS Historia adjudication: 46 restoration proposals, 28 reviewed Atlas candidate scenes, 9 new and 4 existing navigable Atlas links, 2 true P3 verse overlaps, no auto-publication or geographic claims.');
