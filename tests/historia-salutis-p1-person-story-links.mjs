import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ATLAS_READING_CHAPTERS } from "../src/find/bible-atlas-reading-chapters.js";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const source=JSON.parse(readFileSync(resolve(root,"data/explore/historia-salutis-p0-master-crosswalk.v1.json"),"utf8"));
const p1=JSON.parse(readFileSync(resolve(root,"data/explore/historia-salutis-p1-person-story-scripture-links.v1.json"),"utf8"));
const canonical=ATLAS_READING_CHAPTERS.flatMap(ch=>ch.eventKeys);
const known=new Set(canonical);
const eq=(a,b,reason)=>assert.deepEqual(a,b,reason);
const labels=new Map();

assert.equal(source.status,"RESEARCH_ONLY_NOT_PRODUCTION_CERTIFIED");
assert.equal(p1.status,"RESEARCH_ONLY_NO_PUBLICATION");
eq(source.eventCrosswalk.map(e=>e.eventKey),canonical,"P0 to main must preserve 151 ordered canonical IDs");
eq(p1.counts.canonicalEventIdsPreserved,151);
const genesis=p1.genealogicalWitnesses.genesis;
assert.equal(genesis.edgeResearch.length,90);
assert.equal(new Set(genesis.edgeResearch.map(e=>e.edgeId)).size,90);
assert.equal(genesis.derivedPersonIndex.length,91);
assert.equal(new Set(genesis.derivedPersonIndex.map(p=>p.donorPersonId)).size,91);
for(const p of genesis.derivedPersonIndex)labels.set(p.donorPersonId,p.displayName);
for(const edge of genesis.edgeResearch){
 assert.ok(labels.has(edge.parentDonorId) && labels.has(edge.childDonorId));
 assert.equal(edge.status,"CURATED_DONOR_RESEARCH_EDGE_NOT_PUBLICATION_CERTIFIED");
 assert.match(edge.biblicalReference,/^Genesis \d+:\d+/);
 assert.ok(edge.sourceUrl.startsWith("https://"));
 assert.ok(edge.fullyContainedInAtlasEventKeys.every(k=>known.has(k)));
 assert.notEqual(edge.parentDonorId,edge.childDonorId);
}
for(const b of p1.homonymIdentityBarriers){
 assert.notEqual(b.donorIdA,b.donorIdB);
 assert.ok(labels.has(b.donorIdA) && labels.has(b.donorIdB));
}
assert.equal(p1.genealogicalWitnesses.matthew.nodes.length,41);
assert.equal(p1.genealogicalWitnesses.luke.nodes.length,76);
eq(p1.genealogicalWitnesses.matthew.nodes.map(x=>x.position),Array.from({length:41},(_,i)=>i));
eq(p1.genealogicalWitnesses.luke.nodes.map(x=>x.position),Array.from({length:76},(_,i)=>i));
assert.ok(p1.genealogicalWitnesses.matthew.nodes.every(x=>x.canonicalPersonId===null));
assert.ok(p1.genealogicalWitnesses.luke.nodes.every(x=>x.canonicalPersonId===null));
assert.equal(p1.genealogicalWitnesses.matthew.nodes.at(-1).displayName,"Jesus");
assert.equal(p1.genealogicalWitnesses.luke.nodes.at(-1).displayName,"Jesus");
assert.equal(p1.genealogicalWitnesses.matthew.status,"SEPARATE_TEXTUAL_ACCOUNT_JOSEPH_LEGAL_ROLE");
assert.equal(p1.sourceOnlyCompanionReadings.length,5);
for(const x of p1.sourceOnlyCompanionReadings){
 assert.equal(x.canonicalAtlasEventKey,null);
 assert.equal(x.completeWitnessRange,true);
 assert.ok(x.verseCount>0);
 assert.equal(x.witnessEdition,"crampon-1923");
 assert.ok(x.arcs.every(a=>source.narrativeArcs.some(b=>b.id===a)));
 assert.equal(x.linkKind,"SOURCE_ONLY_NATIVE_SCRIPTURE_READING_NOT_AN_ATLAS_EVENT");
}
assert.equal(p1.proposedRuthAncestrySourceOnlyEdges.length,4);
assert.ok(p1.proposedRuthAncestrySourceOnlyEdges.some(x=>x.parent==="Ruth" && x.child==="Obed" && x.familyRole==="MOTHER_CHILD"));
assert.ok(p1.proposedRuthAncestrySourceOnlyEdges.some(x=>x.parent==="Jesse" && x.child==="David"));
assert.ok(p1.proposedRuthAncestrySourceOnlyEdges.every(x=>x.status==="SOURCE_ONLY_PROPOSED_FAMILY_EDGE_NEEDS_EDITORIAL_REVIEW"));
assert.equal(p1.apostolicAndMarianResearchDossierJoins.length,55);
assert.equal(p1.apostolicAndMarianResearchDossierJoins.filter(x=>x.canonicalEventKey!==null).length,11);
for(const x of p1.apostolicAndMarianResearchDossierJoins){
 if(x.canonicalEventKey){
  assert.equal(x.evidenceKind,"scripture");
  assert.ok(known.has(x.canonicalEventKey));
  assert.equal(source.eventCrosswalk.find(e=>e.eventKey===x.canonicalEventKey).reference,x.reference);
 }
}
const stories=p1.donorStoryResearchCrosswalk;
assert.equal(stories.length,39);
assert.equal(new Set(stories.map(x=>x.storyId)).size,39);
const sceneKeys=stories.flatMap(x=>x.sourceSceneKeys);
assert.equal(sceneKeys.length,183);
assert.equal(new Set(sceneKeys).size,183);
eq(stories.reduce((acc,s)=>{
 for(const key of Object.keys(acc))acc[key]+=s.sceneStatusCounts[key];
 return acc;
},{exactReference:0,overlapOnly:0,noDirectMatch:0}),{exactReference:67,overlapOnly:29,noDirectMatch:87});
for(const s of stories){
 assert.equal(s.narrativeProseApproved,false);
 eq(s.autoNavigableCanonicalEventKeys,[...new Set(s.exactCitationJoins.map(e=>e.eventKey))],
 "Auto navigation may only derive from exact source citations");
 assert.ok(s.exactCitationJoins.every(x=>known.has(x.eventKey) && s.sourceSceneKeys.includes(x.sceneKey)));
 assert.ok(s.overlapOnlyJoinsHeld.every(x=>known.has(x.eventKey) && s.sourceSceneKeys.includes(x.sceneKey)));
 assert.equal(s.cannotLinkToAtlasAutomatically,s.autoNavigableCanonicalEventKeys.length===0);
 assert.ok(s.existingResearchContextEventKeysNotCertified.every(k=>known.has(k)));
}
assert.equal(stories.filter(s=>s.cannotLinkToAtlasAutomatically).length,9);
assert.equal(stories.filter(s=>!s.existingResearchContextEventKeysNotCertified.length).length,5);
assert.equal(p1.donorStoryPersonGroups.length,4);
assert.equal(new Set(p1.donorStoryPersonGroups.flatMap(g=>g.storyIds)).size,39);
assert.equal(p1.prohibitions.noNewCanonicalEvents,true);
assert.equal(p1.prohibitions.noAutomaticMergeOfMatthewAndLuke,true);
assert.equal(p1.prohibitions.josephHusbandOfMaryNotBiologicalFatherOfJesus,true);
assert.equal(p1.prohibitions.noOverlapOnlyAutoNavigation,true);
assert.equal(p1.prohibitions.noAiAuthoredNarrative,true);
assert.equal(p1.prohibitions.noChangesToAppReaders,true);
console.log("Historia Salutis P1 PASS: 151 canonical keys; 90 Genesis relationships/91 persons; 41 Matthew + 76 Luke distinct nodes; 5 source-only readings; 55 dossiers with 11 exact joins; 39 groups/183 scenes without overlap promotion.");
