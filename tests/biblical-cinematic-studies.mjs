import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
import {approvedBibleSceneArtwork} from "../src/find/bible-scene-art-gate.js";
import {
 validateCinematicStudies,validateCinematicCrosswalk,studyChapter,studyScene,studyStep,
 cinematicExactAtlasTarget,renderCinematicStudies
} from "../src/find/bible-cinematic-studies.js";
const source=JSON.parse(readFileSync(new URL("../data/explore/biblical-cinematic-studies-review.v1.json",import.meta.url),"utf8"));
const atlasData=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const stops=buildBibleAtlas(atlasData.entries);
assert.equal(stops.length,151,"canonical chronology is unchanged");
assert.equal(validateCinematicStudies(source),true,"181 source-reviewed scene integrity required");
assert.equal(validateCinematicCrosswalk(source,stops),true,
 "Every 181-scene candidate must still reference the exact current canonical passage and index");

assert.deepEqual(source.chapters.map(c=>c.group).filter((g,i,a)=>i===0||g!==a[i-1]),["ABRAHAM","MOSES","CHRIST","PAUL"]);
assert.equal(source.chapters.reduce((n,c)=>n+c.sceneIndices.length,0),181);
assert.equal(new Set(source.scenes.map(s=>s.sceneKey)).size,181,
 "all study scenes carry stable source identities separate from numbered display order");
assert.equal(source.scenes[74].sceneKey,"biblical:scene:christ:074");
const duplicateKey=structuredClone(source);
duplicateKey.scenes[1].sceneKey=duplicateKey.scenes[0].sceneKey;
assert.equal(validateCinematicStudies(duplicateKey),false,"duplicate study scene identity is prohibited");

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
assert.equal(source.scenes[74].candidates[0].atlasIndex,82,"John 2 source reference migrates into PUBLIC");
assert.equal(source.scenes[74].candidates[0].atlasEventKey,"biblical:event:jerusalem-temple-e3");
assert.match(source.scenes[32].title_en,/first plague/);
assert.match(source.scenes[32].sourceNote_en,/not all ten plagues/);
assert.match(source.scenes[176].sourceNote_en,/Acts 28:1/);
assert.equal(stops[82].eventKey,"biblical:event:jerusalem-temple-e3");
assert.match(renderCinematicStudies(source,{language:"en",chapter:"MINISTRY",scene:74,atlasStops:stops}),/John places this episode near the beginning/);
assert.match(renderCinematicStudies(source,{language:"fr",chapter:"RISEN",scene:131,atlasStops:stops}),/Le tombeau vide et Marie-Madeleine/);
assert.match(source.scenes[131].sourceNote_en,/not an eyewitness description/);
assert.equal(source.scenes[68].candidates[1].atlasIndex,77,"Luke 2 hidden-life overlap stays separate");
assert.equal(studyChapter(source,"PATRIARCHS").sceneIndices.length,25);
assert.equal(studyChapter(source,"MINISTRY").sceneIndices.length,46);
assert.equal(studyChapter(source,"TO_ROME").sceneIndices.length,11);
assert.equal(studyScene(source,"DELIVERANCE",-1).index,25);
assert.equal(studyStep(source,"PATRIARCHS",0,1),1);
assert.equal(studyStep(source,"PATRIARCHS",0,-1),0);
assert.equal(studyStep(source,"PATRIARCHS",24,1),24);

const noArt=renderCinematicStudies(source,{language:"en",chapter:"MINISTRY",scene:74,atlasStops:stops});
assert.doesNotMatch(noArt,/data-bible-scene-artwork=|<img\b/,
 "research-only paintings must never enter the production study reader");
const syntheticApproval={
 owner:"SACRED_ART_CANONICAL",status:"PUBLICATION_APPROVED",
 association:{status:"APPROVED",relationship:"EXACT_EPISODE",sceneKey:source.scenes[74].sceneKey,
  reference:"John 2:13–22",eventKey:"biblical:event:jerusalem-temple-e3"},
 artwork:{id:"museum-example-001",medium:"painting",title:"Synthetic test painting",
  artist:"Example Artist",source:{rights:"CC0",objectUrl:"https://www.metmuseum.org/art/collection/search/438724"},
  review:{status:"APPROVED",source:"MUSEUM_API_CC0_VERIFIED",rights:"MUSEUM_API_CC0_VERIFIED",
   artistic:"APPROVED",image:"PASS",crop:"PASS"},
  image:{path:"assets/sacred-art/test-original.webp",width:3200,height:2900,
   sha256:"a".repeat(64),colour:true,museumOriginal:true,frameFree:true,glareFree:true}}
};
assert.equal(approvedBibleSceneArtwork(source.scenes[74],syntheticApproval)?.id,"museum-example-001",
 "synthetic fixture demonstrates the contract only, not an approved real painting");
const artHtml=renderCinematicStudies(source,{language:"en",chapter:"MINISTRY",scene:74,atlasStops:stops,artSelection:syntheticApproval});
assert.match(artHtml,/data-bible-scene-artwork="museum-example-001"/);
assert.match(artHtml,/loading="lazy" decoding="async"/);
for(const [name,change] of [
 ["research candidate",x=>x.status="RESEARCH_CANDIDATES_ONLY"],
 ["wrong biblical scene",x=>x.association.sceneKey="biblical:scene:christ:131"],
 ["wrong Gospel episode",x=>x.association.reference="Mark 11:15–18"],
 ["unapproved subject association",x=>x.association.relationship="GENERAL_CONTEXT"],
 ["mismatched canonical event",x=>x.association.eventKey="biblical:event:christ-tomb-e2"],
 ["unapproved crop",x=>x.artwork.review.crop="PENDING"],
 ["low-resolution thumbnail",x=>{x.artwork.image.width=900;x.artwork.image.height=900;}],
 ["non original image",x=>x.artwork.image.museumOriginal=false],
 ["provisional external image",x=>x.artwork.image.path="https://example.org/thumb.jpg"],
 ["unapproved rights",x=>x.artwork.source.rights="UNKNOWN"],
 ["unverified museum",x=>x.artwork.source.objectUrl="https://unverified.example.net/art/1"],
 ["rights-review still held",x=>x.artwork.review.rights="PENDING"],
 ["museum object source not corroborated",x=>x.artwork.review.source="SEARCH_SNIPPET"],
 ["excluded artist",x=>x.artwork.artist="El Greco"]
]){
 const changed=structuredClone(syntheticApproval);change(changed);
 assert.equal(approvedBibleSceneArtwork(source.scenes[74],changed),null,name);
 assert.doesNotMatch(renderCinematicStudies(source,{language:"en",chapter:"MINISTRY",scene:74,atlasStops:stops,artSelection:changed}),/<img\b/,name);
}

const en=renderCinematicStudies(source,{language:"en",chapter:"PATRIARCHS",scene:21,atlasStops:stops});
const fr=renderCinematicStudies(source,{language:"fr",chapter:"INCARNATION",scene:68,atlasStops:stops});
const extra=renderCinematicStudies(source,{language:"en",chapter:"DELIVERANCE",scene:35,atlasStops:stops});
assert.match(en,/data-bible-study-scene="21"/);
assert.match(en,/data-bible-scene-stage/,"Theatre renders an actual scene-focused stage");
assert.match(en,/aoBibleStageReading/,"narrative is visually isolated from source metadata");
assert.match(en,/aoBibleStageEvidence/,"source qualification stays available on stage");
assert.match(en,/Chapter context/,"chapter background stays accessible but not repeated in the hero");
const theatreMarkup=en.slice(en.indexOf('<section class="aoFindSurface aoBibleStudy"'));
assert.ok(theatreMarkup.indexOf('<nav class="aoBibleStudySceneTimeline"')<theatreMarkup.indexOf('<article class="aoBibleStudyScene"'),
 "scene navigation precedes the focused reading region (ignore earlier CSS selectors)");
assert.ok(theatreMarkup.indexOf('<article class="aoBibleStudyScene"')<theatreMarkup.indexOf("Research comparison"),
 "technical editorial notice must no longer dominate the top of the phone reader");
assert.match(en,/prefers-reduced-motion:reduce/,"stage motion respects user settings");

assert.match(en,/data-bible-study-timeline/);
assert.match(en,/data-bible-study-jump="21" aria-pressed="true"/);
assert.equal((en.match(/data-bible-study-jump="/g)||[]).length,25,
 "Patriarchs must expose every scene as a direct chapter timeline target");
const ministry=renderCinematicStudies(source,{language:"en",chapter:"MINISTRY",scene:74,atlasStops:stops});
assert.equal((ministry.match(/data-bible-study-jump="/g)||[]).length,46,
 "Ministry must expose all 46 named scene targets");
assert.match(ministry,/data-bible-study-jump="74" aria-pressed="true"/);
assert.match(ministry,/data-bible-study-jump="74"[^>]*title="Jesus cleanses the Temple/);

assert.match(en,/data-bible-review-jump="11"/);
assert.match(en,/data-bible-review-event-key="biblical:passage:genesis-21-1-7"/);
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
const shuffled=structuredClone(source);
[shuffled.scenes[2],shuffled.scenes[3]]=[shuffled.scenes[3],shuffled.scenes[2]];
assert.equal(validateCinematicStudies(shuffled),false,
 "Direct-index UI must reject out-of-order scene arrays");
const staleCandidate=structuredClone(source);
staleCandidate.scenes[70].candidates[0].reference="Matthew 4:12–17";
assert.equal(validateCinematicCrosswalk(staleCandidate,stops),false,
 "A stale candidate passage must never pass the 151-to-181 evidence gate");
assert.doesNotMatch(renderCinematicStudies(staleCandidate,{atlasStops:stops}),/data-bible-study-scene=/,
 "The actual cinematic reader must refuse stale source/candidate indices");
const staleEventIdentity=structuredClone(source);
staleEventIdentity.scenes[74].candidates[0].atlasEventKey="biblical:event:cana-e1";
assert.equal(validateCinematicCrosswalk(staleEventIdentity,stops),false,
 "A candidate cannot use the right reference and index with another event's stable identity");
assert.doesNotMatch(renderCinematicStudies(staleEventIdentity,{atlasStops:stops}),/data-bible-study-scene=/,
 "The phone reader must refuse a wrong stable identity");
const staleIndex=structuredClone(source);
staleIndex.scenes[70].candidates[0].atlasIndex=0;
assert.equal(validateCinematicCrosswalk(staleIndex,stops),false,
 "A candidate with a wrong canonical index must fail even when metadata looks valid");
const wrongStatus=structuredClone(source);
wrongStatus.scenes[0].status="EXACT_REFERENCE";
assert.equal(validateCinematicStudies(wrongStatus),false,
 "Review-only overlap cannot be promoted just by flipping a label");
const secondExact=structuredClone(source);
secondExact.scenes[70].candidates.push({...secondExact.scenes[70].candidates[0],atlasIndex:78});
assert.equal(validateCinematicStudies(secondExact),false,
 "Duplicate exact-reference candidates must not silently authorize a chronology jump");
console.log("PASS Cinematic companion: crosswalk candidate/index/order guards; 181 scenes in 14 chapters, 64 unique exact source jumps, 29 overlaps held, 87 unmatched preserved, zero images/routes/pins");
