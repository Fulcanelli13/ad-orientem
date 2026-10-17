import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { ATLAS_READING_CHAPTERS } from "../src/find/bible-atlas-reading-chapters.js";
import { ATLAS_JOURNEY_ARCS, ATLAS_JOURNEY_THEMES } from "../src/find/bible-atlas-journeys.js";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const data=JSON.parse(readFileSync(resolve(root,"data/explore/historia-salutis-p0-master-crosswalk.v1.json"),"utf8"));
const chapterKeys=ATLAS_READING_CHAPTERS.flatMap(c=>c.eventKeys);
const arcs=data.narrativeArcs;
const matrixKeys=data.eventCrosswalk.map(e=>e.eventKey);
const arcKeys=arcs.flatMap(a=>a.eventKeys);
const covenantIds=new Set(data.covenantPromiseStages.map(c=>c.id));
const storyIds=data.individualStoryResearchPointers.map(x=>x.storyId);

assert.equal(data.schema,"AO_HISTORIA_SALUTIS_P0_COVENANT_GENEALOGY_NARRATIVE_MATRIX_V1");
assert.equal(data.status,"RESEARCH_ONLY_NOT_PRODUCTION_CERTIFIED");
assert.equal(ATLAS_READING_CHAPTERS.length,37);
assert.equal(ATLAS_JOURNEY_ARCS.length,10);
assert.equal(ATLAS_JOURNEY_THEMES.length,9);
assert.equal(chapterKeys.length,151);
assert.equal(new Set(chapterKeys).size,151);
assert.deepEqual(matrixKeys,chapterKeys,"Canonical Atlas event keys and order must be untouched");
assert.deepEqual(arcKeys,chapterKeys,"Primary narrative arcs must be contiguous, exhaustive and non-duplicating");
assert.equal(arcs.length,12);
assert.deepEqual(arcs.map(a=>a.order),Array.from({length:12},(_,i)=>i+1));
assert.equal(data.chapterCrosswalk.length,37);
assert.deepEqual(data.chapterCrosswalk.map(x=>x.chapterId),ATLAS_READING_CHAPTERS.map(x=>x.id));
for(const [i,ch] of data.chapterCrosswalk.entries()){
 assert.deepEqual(ch.eventKeys,ATLAS_READING_CHAPTERS[i].eventKeys);
 assert.equal(ch.era,ATLAS_READING_CHAPTERS[i].era);
 assert.ok(arcs.some(a=>a.id===ch.primaryArcId && ch.eventKeys.every(k=>a.eventKeys.includes(k))));
}
for(const e of data.eventCrosswalk){
 assert.ok(e.reference && e.title_en && e.title_fr && e.chapterId);
 assert.ok(arcs.some(a=>a.id===e.primaryArcId && a.eventKeys.includes(e.eventKey)));
 assert.ok(e.covenantTextAnchors.every(c=>covenantIds.has(c.id)));
 assert.equal(e.shortExcerptApproved,false);
 assert.equal(e.authoredNarrativeApproved,false);
 assert.equal(e.status,"RESEARCH_ONLY_REUSES_EXISTING_ATLAS_ID");
}
assert.equal(data.covenantPromiseStages.length,7);
assert.equal(covenantIds.size,7);
for(const c of data.covenantPromiseStages) {
 if(c.anchorEventKey)assert.ok(chapterKeys.includes(c.anchorEventKey));
 else assert.equal(c.anchorStatus,"REFERENCE_GAP");
}
assert.equal(data.eventCrosswalk.reduce((n,x)=>n+x.publishedSelectionEvidenceRows,0),460);
assert.equal(data.eventCrosswalk.filter(x=>x.qualifiedIndependentFamilies>0).length,149);
assert.deepEqual(data.eventCrosswalk.filter(x=>x.qualifiedIndependentFamilies===0).map(x=>x.reference),["Daniel 14:1–22","Daniel 14:23–42"]);
assert.equal(data.eventCrosswalk.filter(e=>e.sceneMatchStatus==="EXACT_CITATION_EVENT").length,67);
assert.equal(data.eventCrosswalk.filter(e=>e.sceneMatchStatus==="OVERLAP_ONLY_EVENT").length,17);
assert.equal(data.eventCrosswalk.filter(e=>e.sceneMatchStatus==="NO_SCENE_CANDIDATE").length,67);
assert.equal(storyIds.length,39);
assert.equal(new Set(storyIds).size,39);
assert.deepEqual([data.genealogyResearchPointers.genesis.edges,data.genealogyResearchPointers.matthew.nodes,data.genealogyResearchPointers.luke.nodes],[90,41,76]);
assert.equal(data.policy.noAiAuthoredBibleNarrative,true);
assert.equal(data.policy.noAutomaticGenealogyEdgePromotion??data.policy.unreviewedKinshipEdgesNotPromoted,true);
assert.equal(data.policy.noAppChanges,true);
console.log("Historia Salutis P0 matrix: 151 canonical event keys, 37 chapters, 12 arcs, 7 covenant/promise stages, 460 evidence records and source/release guards verified.");
