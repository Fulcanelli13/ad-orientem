import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
import {
 validateCinematicStudies,studyChapter,studyScene,studyStep,
 cinematicExactAtlasTarget,renderCinematicStudies
} from "../src/find/bible-cinematic-studies.js";
const source=JSON.parse(readFileSync(new URL("../data/explore/biblical-cinematic-studies-review.v1.json",import.meta.url),"utf8"));
const atlasData=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const stops=buildBibleAtlas(atlasData.entries);
assert.equal(stops.length,151,"canonical chronology is unchanged");
assert.equal(validateCinematicStudies(source),true,"181 source-reviewed scene integrity required");
assert.deepEqual(source.chapters.map(c=>c.group).filter((g,i,a)=>i===0||g!==a[i-1]),["ABRAHAM","MOSES","CHRIST","PAUL"]);
assert.equal(source.chapters.reduce((n,c)=>n+c.sceneIndices.length,0),181);
const counts=Object.fromEntries(["EXACT_REFERENCE","PASSAGE_OVERLAP_REVIEW_ONLY","NO_DIRECT_PASSAGE_MATCH"].map(k=>[k,source.scenes.filter(s=>s.status===k).length]));
assert.deepEqual(counts,{EXACT_REFERENCE:65,PASSAGE_OVERLAP_REVIEW_ONLY:29,NO_DIRECT_PASSAGE_MATCH:87});
const linked=source.scenes.filter(s=>cinematicExactAtlasTarget(s,stops)!==null);
assert.equal(linked.length,64,"all uniquely certified exact references link to existing timeline records");
assert.equal(source.scenes[68].status,"EXACT_REFERENCE");
assert.equal(source.scenes[68].candidates.length,2,"one exact scene also has an overlap candidate");
assert.equal(cinematicExactAtlasTarget(source.scenes[68],stops),null,"ambiguous #68 cannot auto-link");
for(const s of source.scenes){
 assert.ok(s.reference&&s.title_en&&s.title_fr);
 assert.equal(Object.hasOwn(s,"geo"),false);
 assert.equal(Object.hasOwn(s,"art"),false);
 assert.equal(Object.hasOwn(s,"imageUrl"),false);
 if(s.status!=="EXACT_REFERENCE")assert.equal(cinematicExactAtlasTarget(s,stops),null,"overlap or unmatched never jumps");
}
assert.equal(studyChapter(source,"PATRIARCHS").sceneIndices.length,25);
assert.equal(studyChapter(source,"MINISTRY").sceneIndices.length,46);
assert.equal(studyChapter(source,"TO_ROME").sceneIndices.length,11);
assert.equal(studyScene(source,"DELIVERANCE",-1).index,25);
assert.equal(studyStep(source,"PATRIARCHS",0,1),1);
assert.equal(studyStep(source,"PATRIARCHS",0,-1),0);
assert.equal(studyStep(source,"PATRIARCHS",24,1),24);
const en=renderCinematicStudies(source,{language:"en",chapter:"PATRIARCHS",scene:21,atlasStops:stops});
const fr=renderCinematicStudies(source,{language:"fr",chapter:"INCARNATION",scene:68,atlasStops:stops});
const extra=renderCinematicStudies(source,{language:"en",chapter:"DELIVERANCE",scene:35,atlasStops:stops});
assert.match(en,/data-bible-study-scene="21"/);
assert.match(en,/data-bible-review-jump="11"/);
assert.match(en,/Read passage/);
assert.match(en,/research|comparison/i);
assert.match(fr,/data-bible-study-scene="68"/);
assert.doesNotMatch(fr,/data-bible-review-jump/);
assert.match(fr,/publication non autorisée/i);
assert.match(extra,/Additional episode/);
assert.doesNotMatch(extra,/data-bible-review-jump/);
for(const html of [en,fr,extra]){
 assert.match(html,/data-bible-study-chapter="TO_ROME"/);
 assert.match(html,/data-bible-review-surface="timeline"/);
 assert.doesNotMatch(html,/<img\b|<canvas\b|<iframe\b|data-bible-map|maps.google.com/i,"art, routes and pins do not leak");
}
const corrupted=structuredClone(source);corrupted.scenes[0].coordinates=[35,31];
assert.equal(validateCinematicStudies(corrupted),false);
assert.doesNotMatch(renderCinematicStudies(corrupted),/data-bible-study-scene=/,"schema guard blocks accidental map imports");
console.log("PASS Cinematic companion: 181 scenes in 14 chapters, 64 unique exact source jumps, 29 overlaps held, 87 unmatched preserved, zero images/routes/pins");
