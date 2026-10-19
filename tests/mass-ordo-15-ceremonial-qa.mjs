// Fixed Ordo Missae 15 ceremonial cues: source/owner parity, NOT simulated
// physical observation. Uses established 1962 and R17 presentation registries.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {isExplicitRequiemMass,requiemEntranceIncensationOmittedCuesForResolvedMass,
 requiemFinalBlessingOmittedCuesForResolvedMass,
 requiemOffertoryIncensationVariantsForResolvedMass} from "../src/mass/reader-requiem-conditions.js";
const j=p=>JSON.parse(readFileSync(new URL("../data/"+p,import.meta.url),"utf8"));
const reg=j("research/mass-ordo-15-ceremonial-source-ownership-20261019.v1.json");
const english=j("research/mass-ordo-red-missal-2013-editorial.v1.json");
const source=j("presentation/reader-text-sung.v1.json");
const low=j("presentation/reader-text-low.v1.json");
const rubrics=j("presentation/reader-rubric-events.v1.json");
const actions=j("presentation/reader-priest-actions.v1.json");
const positions=j("presentation/reader-priest-positions.v1.json");
const gestures=j("mass/gesture-matrix.v1.json");
const ids=english.ceremonialOutOfEnglishScope.map(x=>x.cueId).sort();
assert.equal(ids.length,15);
assert.deepEqual(reg.entries.map(x=>x.cueId).sort(),ids);
assert.deepEqual(reg.summary,{
 total:15,formFixed:3,existingSourceOwned:10,partialObservationHold:2,
 reviewedSourceCueCount:15,uncertifiedPhysicalObservations:15,
});
assert.equal(reg.invariants.cardStructureMutationAllowed??reg.invariants.cardStructureMutation,false);
const unitMap=corpus=>new Map(corpus.blocks.flatMap(b=>(b.units??[])
 .map(x=>[x.cue_id,{u:x,block:b.Block_ID}])));
const sung=unitMap(source),lowMap=unitMap(low);
const families={
 publishedRubric:rubrics.items,priestAction:actions.items,
 priestPosition:positions.items,gestureMatrix:gestures.items,
 ritusResearch:j("mass/ritus-1962-verified-ceremonial-batch01.v1.json").events,
};
for(const row of reg.entries){
 for(const sourceMap of [sung,lowMap]){
  const sourceRow=sourceMap.get(row.cueId);
  assert.ok(sourceRow,row.cueId+" missing original source");
  assert.match(sourceRow.u.english,/^\[.+\]$/u,
   "A priest ceremonial direction was misclassified as liturgical prayer");
 }
 for(const evidence of row.registeredEvidence){
  const records=families[evidence.family].filter(x=>x.cueId===row.cueId);
  assert.deepEqual(evidence.ids,
    records.map(x=>x.id??x.action??x.label??x.station),
    row.cueId+" registry owner mismatch in "+evidence.family);
 }
}
const get=id=>reg.entries.find(x=>x.cueId==="AO.SM.C"+String(id).padStart(4,"0"));
for(const n of [41,124,263])assert.equal(get(n).status,"FORM_GATED");
for(const n of [201,205]){
 assert.equal(get(n).status,"PARTIAL_OBSERVATION_REQUIRED");
 assert.equal(actions.items.find(x=>x.cueId===get(n).cueId)?.label,"GENUFLECTS");
 assert.equal(rubrics.items.filter(x=>x.cueId===get(n).cueId).length,0,
  "New unpublished Per ipsum microsteps need fresh review, not automatic promotion");
}
for(const n of [174,181]){
 const published=rubrics.items.filter(x=>x.cueId===get(n).cueId);
 assert.equal(published.filter(x=>x.actor==="SERVER"&&x.kind==="BELL").length,1);
 assert.ok(published.filter(x=>x.actor==="PRIEST"&&x.kind!=="STATE").length>=4,
  "Need four source-ordered priest elevation microsteps");
}
const normal={form:"MISSA_CANTATA_INCENSE",actualCelebration:{type:"CALENDAR"}};
const requiem={form:"MISSA_CANTATA_INCENSE",actualCelebration:{type:"REQUIEM"}};
assert.equal(isExplicitRequiemMass({session:{resolvedMass:requiem}}),true);
assert.deepEqual(requiemEntranceIncensationOmittedCuesForResolvedMass(normal),[]);
assert.deepEqual(requiemFinalBlessingOmittedCuesForResolvedMass(normal),[]);
assert.deepEqual(requiemEntranceIncensationOmittedCuesForResolvedMass(requiem),
 ["AO.SM.C0040","AO.SM.C0041"]);
assert.deepEqual(requiemFinalBlessingOmittedCuesForResolvedMass(requiem),
 ["AO.SM.C0263","AO.SM.C0264","AO.SM.C0265","AO.SM.C0266"]);
const variant=requiemOffertoryIncensationVariantsForResolvedMass(requiem);
assert.match(variant["AO.SM.C0124"].en,/Only the celebrant is incensed/);
assert.ok(!requiemOffertoryIncensationVariantsForResolvedMass(normal));
assert.equal(reg.invariants.latinTextMutation,false);
assert.equal(reg.invariants.englishTextMutation,false);
assert.equal(reg.invariants.frenchTextMutation,false);
assert.equal(reg.invariants.scriptedObservationalTimelineAllowed,false);
console.log("mass ceremonial 15: PASS — 15 original cue/source identities, 3 form gates, 10 source-owned cues, 2 observational holds.");
