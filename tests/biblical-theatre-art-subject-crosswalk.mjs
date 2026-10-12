import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateCinematicStudies} from "../src/find/bible-cinematic-studies.js";
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const scenes=read("../data/explore/biblical-cinematic-studies-review.v1.json");
const cross=read("../data/explore/biblical-theatre-art-subject-crosswalk.v1.json");
assert.ok(validateCinematicStudies(scenes));
assert.equal(scenes.scenes.length,183);
assert.equal(scenes.extension.baselineSceneCount,181);
assert.equal(cross.schema,"AO_BIBLICAL_THEATRE_ART_SUBJECT_CROSSWALK_V1");
assert.equal(cross.owner,"BIBLICAL_ATLAS_SCENE_RESEARCH");
assert.equal(cross.status,"CROSS_MODULE_RESEARCH_ONLY");
assert.equal(cross.publicationAllowed,false);
assert.equal(cross.joins.length,44);
const valid=new Set([
 "SAME_EPISODE_REVIEW","DEPICTS_SUBEPISODE_REVIEW",
 "COMPOSITE_ICONOGRAPHY_HOLD","DIFFERENT_MOMENT_HOLD",
 "EXCLUDED_ARTIST_HOLD","HISTORICAL_IDENTITY_HOLD",
 "NON_NARRATIVE_SUBJECT","NO_THEATRE_SCENE"
]);
const mustBeAbsent=new Set(["NON_NARRATIVE_SUBJECT","NO_THEATRE_SCENE"]);
const sceneByKey=new Map(scenes.scenes.map(s=>[s.sceneKey,s]));
const targets=new Set();
const tally={};
let linked=0,positive=0,unrepresented=0;
for(const row of cross.joins){
 assert.ok(/^((calendar|rosary|devotion|person)\.[a-z0-9-]+)$/.test(row.targetId),row.targetId);
 assert.ok(!targets.has(row.targetId),"one canonical association disposition per selected subject");
 targets.add(row.targetId);
 assert.ok(valid.has(row.relation),"unknown source/subject relation");
 assert.equal(row.review,"SOURCE_ASSOCIATION_NOT_APPROVED");
 assert.equal(row.release,false);
 assert.ok(typeof row.note==="string"&&row.note.length>32);
 assert.ok(!("artworkId" in row)&&!("artwork" in row)&&!("image" in row),
   "artwork records belong to the Sacred Art owner; the scene join is target-based");
 tally[row.relation]=(tally[row.relation]||0)+1;
 if(row.sceneKey===null){
  unrepresented++;
  assert.equal(row.sceneReference,null);
  assert.ok(mustBeAbsent.has(row.relation),"unrepresented subjects need explicit no-scene classification");
  assert.ok(!("atlasEventKey" in row));
  continue;
 }
 linked++;
 assert.ok(!mustBeAbsent.has(row.relation));
 const scene=sceneByKey.get(row.sceneKey);
 assert.ok(scene,"cannot use invented or obsolete Theatre scene IDs");
 assert.equal(row.sceneReference,scene.reference,"must preserve original Gospel passage identity");
 const uniqueExact=scene.status==="EXACT_REFERENCE"&&scene.candidates.length===1
    ?scene.candidates[0].atlasEventKey:null;
 assert.equal(row.atlasEventKey,uniqueExact,"151-event key allowed only for uniquely exact cited source");
 if(["SAME_EPISODE_REVIEW","DEPICTS_SUBEPISODE_REVIEW"].includes(row.relation))positive++;
}
assert.deepEqual(tally,cross.counts);
assert.equal(linked,29);
assert.equal(unrepresented,15);
assert.equal(positive,20);
assert.equal(tally.EXCLUDED_ARTIST_HOLD,3);
assert.equal(tally.DIFFERENT_MOMENT_HOLD,3);
for(const target of ["calendar.good-friday","rosary.sor4","rosary.sor5"]){
 const row=cross.joins.find(x=>x.targetId===target);
 assert.equal(row.relation,"EXCLUDED_ARTIST_HOLD");
 assert.equal(row.release,false);
}
for(const target of ["calendar.easter","rosary.glo1"]){
 const row=cross.joins.find(x=>x.targetId===target);
 assert.equal(row.sceneKey,"biblical:scene:christ:131");
 assert.equal(row.relation,"DIFFERENT_MOMENT_HOLD",
   "painted Resurrection instant is not the witnessed event in John 20's empty-tomb passage");
}
assert.equal(cross.joins.find(x=>x.targetId==="devotion.confession").relation,"HISTORICAL_IDENTITY_HOLD",
 "Luke 7's unnamed sinner is not automatically Mary Magdalene");
for(const [target,sceneKey,sourceKey] of [
 ["calendar.pentecost","biblical:scene:paul:182","biblical:passage:acts-2-1-41"],
 ["rosary.glo3","biblical:scene:paul:182","biblical:passage:acts-2-1-41"],
 ["calendar.holy-innocents","biblical:scene:christ:181","biblical:event:bethlehem-additional-003"]
]){
 const row=cross.joins.find(x=>x.targetId===target);
 assert.equal(row.relation,"SAME_EPISODE_REVIEW",
  "the new episode is a candidate depiction, not yet approved artwork");
 assert.equal(row.sceneKey,sceneKey);
 assert.equal(row.atlasEventKey,sourceKey);
 assert.equal(row.release,false);
}
assert.equal(tally.NO_THEATRE_SCENE||0,0,"the three genuine missing episode gaps now have their own scenes");
assert.equal(new Set(cross.joins.filter(x=>x.targetId.startsWith("rosary.")).map(x=>x.targetId)).size,15,
 "all 15 traditional Rosary subject decisions must be accounted for");
console.log("PASS art↔Theatre: 44 scoped subjects, 29 linked candidate/hold identities, 20 potential depictions, 15 non-narrative subjects, 3 prohibited selected artists. No artwork promoted.");
