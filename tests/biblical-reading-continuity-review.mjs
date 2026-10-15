import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const data=load("data/explore/biblical-reading-continuity-review.v1.json");
const places=load("data/explore/bible-places-compact.v1.json");
const scenes=load("data/explore/biblical-cinematic-studies-review.v1.json");
const chapters=load("data/explore/biblical-narrative-journeys-review.v1.json");
const source=buildBibleAtlas(places.entries);
assert.equal(data.status,"RESEARCH_ONLY_NOT_PUBLICATION_CERTIFIED");
assert.equal(data.policy.noCanonicalOwnerChange,true);
assert.equal(data.policy.proseNotAuthored,true);
assert.equal(data.counts.events,151);
assert.equal(source.length,151);
assert.equal(data.events.length,source.length);
assert.equal(data.readingChapters.length,37);
assert.equal(data.transitions.length,150);
const sceneIds=new Set(scenes.scenes.map(s=>s.sceneKey));
const storyIds=new Set(chapters.stories.map(s=>s.id));
const ownership=new Map();
for(const ch of data.readingChapters){
  assert.equal(ch.status,"EDITORIAL_GROUP_ONLY_NO_APPROVED_CONTINUOUS_PROSE");
  for(const key of ch.eventKeys){
    assert.ok(!ownership.has(key),"Duplicate chapter ownership "+key);
    ownership.set(key,ch.id);
  }
}
assert.equal(ownership.size,151);
const counts={EXACT_CITATION_EVENT:0,OVERLAP_ONLY_EVENT:0,NO_SCENE_CANDIDATE:0};
for(const [i,e] of data.events.entries()){
  const s=source[i];
  for(const field of ["eventKey","reference","era","title_en","title_fr","placeId","sourceEventId"])
    assert.equal(e[field],s[field],"Canonical drift "+field+" at "+i);
  assert.equal(e.readingChapterId,ownership.get(e.eventKey));
  assert.equal(e.narrativeProseStatus,"NOT_AUTHORED_OR_APPROVED_IN_THIS_PIPELINE");
  for(const key of [...e.exactCitationSceneKeys,...e.overlapReviewSceneKeys])assert.ok(sceneIds.has(key));
  for(const key of e.relatedResearchStoryIds)assert.ok(storyIds.has(key));
  const expected=scenes.scenes.flatMap(t=>(t.candidates||[]).filter(c=>c.atlasEventKey===e.eventKey).map(c=>({key:t.sceneKey,relation:c.relation})));
  assert.deepEqual(e.exactCitationSceneKeys,expected.filter(c=>c.relation==="EXACT_REFERENCE").map(c=>c.key));
  assert.deepEqual(e.overlapReviewSceneKeys,expected.filter(c=>c.relation==="PASSAGE_OVERLAP_REVIEW_ONLY").map(c=>c.key));
  counts[e.sceneCitationStatus]++;
}
assert.deepEqual(counts,{EXACT_CITATION_EVENT:67,OVERLAP_ONLY_EVENT:17,NO_SCENE_CANDIDATE:67});
assert.equal(data.unrepresentedSceneResearchQueue.length,67);
for(const [i,t] of data.transitions.entries()){
  assert.equal(t.fromEventKey,data.events[i].eventKey);
  assert.equal(t.toEventKey,data.events[i+1].eventKey);
  assert.equal(t.bridgeProse,null);
  assert.equal(t.editorialStatus,"BRIDGE_AND_NARRATIVE_CONTINUITY_NOT_REVIEWED");
}
console.log("Bible Theatre continuous-reading audit: 151 canonical keys; 37 reading chapters; 150 transition reviews; scene coverage 67/17/67; research-only.");
