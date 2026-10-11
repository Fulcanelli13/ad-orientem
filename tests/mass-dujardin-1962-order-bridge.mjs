import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const B=load("data/geography/research/mass-dujardin-1962-order-bridge-20261011.v1.json");
const M=load(B.sourceMeditations),S=load(B.sourceSung),L=load(B.sourceLow);
assert.equal(B.schema,"MASS_DUJARDIN_1962_ORDER_POSITION_BRIDGE_V1");
assert.equal(B.status,"RESEARCH_ORDER_ANCHORS_VERIFIED_NOT_BIBLE_CERTIFIED");
assert.equal(B.records.length,22);
assert.deepEqual(B.records.map(x=>x.meditationId),M.dujardinMeditativeStations.map(x=>x.id));
assert.ok(B.records.every(r=>r.author.includes("Dujardin") && r.scripturalReferencesRemainEditorial && r.meditationDoesNotProveHistoricalOrigin && !r.approvedForPublication));
const sungCues=new Map(S.blocks.flatMap(b=>b.units.map(u=>[u.cue_id,b])));
const lowCues=new Map(L.blocks.flatMap(b=>b.units.map(u=>[u.cue_id,b])));
for(const r of B.records){
 assert.deepEqual(r.originalSourceWitness,M.dujardinMeditativeStations.find(m=>m.id===r.meditationId).sourceTextWitness);
 for(const id of r.sourceCueIds){
   const s=sungCues.get(id),l=lowCues.get(id);
   assert.ok(s&&l&&s.Block_ID===l.Block_ID&&r.sourceBlockIds.includes(s.Block_ID),r.meditationId+" cue "+id+" source drift");
 }
 if(r.properSlot){
   assert.equal(r.mappingKind,"VARIABLE_PROPER_SLOT");
   const s=S.blocks.find(b=>b.Proper_Slot===r.properSlot);
   const l=L.blocks.find(b=>b.Proper_Slot===r.properSlot);
   assert.ok(s&&l&&s.Block_ID===l.Block_ID&&r.sourceBlockIds.includes(s.Block_ID));
   assert.deepEqual(r.sourceCueIds,[],"Variable Proper must not gain a fixed Bible passage");
 }
}
assert.equal(B.records.filter(x=>x.sourceCueIds.length).length,16);
assert.equal(B.records.filter(x=>x.properSlot).length,5);
assert.equal(B.records.filter(x=>x.mappingKind==="OUTSIDE_MASS_NO_FIXED_CUE").length,1);
assert.equal(B.records.find(x=>x.meditationId==="DJ01").mappingKind,"OUTSIDE_MASS_NO_FIXED_CUE");
assert.equal(B.records.find(x=>x.meditationId==="DJ22").mappingKind,"EXACT_ORDER_ANCHOR_SUBJECT_TO_RITE");
assert.ok(B.records.find(x=>x.meditationId==="DJ15").sourceCueIds.includes("AO.SM.C0179"));
assert.ok(B.records.find(x=>x.meditationId==="DJ18").sourceCueIds.includes("AO.SM.C0221"));
assert.ok(B.exceptions.some(x=>x.includes("Last Gospel")));
console.log("PASS Dujardin: all 22 meditations have qualified 1962 source positions; 16 cue positions + 5 variable slots + 1 preparation out of Mass");
